import test from "node:test";
import assert from "node:assert/strict";

// Register @/ module alias loader for dynamic imports
await import("../lib/register.mjs");

const { GET } = await import("../../app/api/admin/health/db/route.ts");
const { createAdminSession, ADMIN_SESSION_COOKIE } = await import("../../lib/admin-auth.ts");

test("GET /api/admin/health/db hardening & RBAC access control", async (t) => {
  // Ensure DATABASE_URL and ADMIN_SESSION_SECRET are set in test environment
  const origDbUrl = process.env.DATABASE_URL;
  const origSecret = process.env.ADMIN_SESSION_SECRET;
  process.env.ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "test-session-secret-at-least-32-chars-long";
  process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://testuser:testpass@staging-db.test.internal:5432/testdb";

  try {

    await t.test("1. No cookie returns 401 Unauthorized", async () => {
      const req = new Request("http://localhost:3000/api/admin/health/db", {
        method: "GET",
      });
      const res = await GET(req);
      assert.equal(res.status, 401, "Requests without an admin session cookie must return 401");
      const data = await res.json();
      assert.equal(data.error, "Unauthorized");
    });

    await t.test("2. Support role returns 403 Forbidden", async () => {
      const supportToken = await createAdminSession({
        userId: "usr-support-1",
        role: "support",
        email: "support@laptoppointbd.com",
        name: "Support Staff",
      });

      const req = new Request("http://localhost:3000/api/admin/health/db", {
        method: "GET",
        headers: {
          cookie: `${ADMIN_SESSION_COOKIE}=${supportToken}`,
        },
      });

      const res = await GET(req);
      assert.equal(res.status, 403, "Support role must return 403 Forbidden");
      const data = await res.json();
      assert.match(data.error, /requires role owner or manager/i);
    });

    await t.test("3. Marketing role returns 403 Forbidden", async () => {
      const marketingToken = await createAdminSession({
        userId: "usr-marketing-1",
        role: "marketing",
        email: "marketing@laptoppointbd.com",
        name: "Marketing Staff",
      });

      const req = new Request("http://localhost:3000/api/admin/health/db", {
        method: "GET",
        headers: {
          cookie: `${ADMIN_SESSION_COOKIE}=${marketingToken}`,
        },
      });

      const res = await GET(req);
      assert.equal(res.status, 403, "Marketing role must return 403 Forbidden");
    });

    await t.test("4. Owner role returns 200 with 64-character hex fingerprint", async () => {
      const ownerToken = await createAdminSession({
        userId: "usr-owner-1",
        role: "owner",
        email: "owner@laptoppointbd.com",
        name: "Store Owner",
      });

      const req = new Request("http://localhost:3000/api/admin/health/db", {
        method: "GET",
        headers: {
          cookie: `${ADMIN_SESSION_COOKIE}=${ownerToken}`,
        },
      });

      const res = await GET(req);
      assert.equal(res.status, 200, "Owner role must return 200 OK");
      const data = await res.json();
      assert.equal(data.ok, true);
      assert.ok(typeof data.fingerprint === "string");
      assert.match(data.fingerprint, /^[a-f0-9]{64}$/, "Fingerprint must be a 64-character hex string");

      // Verify no sensitive info is leaked
      assert.equal(data.host, undefined, "Must never return database host");
      assert.equal(data.url, undefined, "Must never return database URL");
      assert.equal(data.username, undefined, "Must never return database username");
      assert.equal(data.password, undefined, "Must never return database password");
    });

    await t.test("5. Manager role returns 200 with 64-character hex fingerprint", async () => {
      const managerToken = await createAdminSession({
        userId: "usr-manager-1",
        role: "manager",
        email: "manager@laptoppointbd.com",
        name: "Store Manager",
      });

      const req = new Request("http://localhost:3000/api/admin/health/db", {
        method: "GET",
        headers: {
          cookie: `${ADMIN_SESSION_COOKIE}=${managerToken}`,
        },
      });

      const res = await GET(req);
      assert.equal(res.status, 200, "Manager role must return 200 OK");
      const data = await res.json();
      assert.equal(data.ok, true);
      assert.match(data.fingerprint, /^[a-f0-9]{64}$/);
    });

    await t.test("6. None of the env secrets works as a token (all return 401)", async () => {
      const envSecrets = [
        process.env.ADMIN_SESSION_SECRET || "fallback-secret-for-test-32charslong",
        process.env.ADMIN_PASSWORD || "fallback-admin-pass",
        process.env.ADMIN_SETUP_SECRET || "fallback-setup-secret",
        process.env.CRON_SECRET || "fallback-cron-secret",
        process.env.STAGING_GUARD_TOKEN || "fallback-staging-token",
      ];

      for (const secret of envSecrets) {
        // Test Authorization: Bearer <secret>
        const bearerReq = new Request("http://localhost:3000/api/admin/health/db", {
          method: "GET",
          headers: {
            authorization: `Bearer ${secret}`,
          },
        });
        const bearerRes = await GET(bearerReq);
        assert.equal(bearerRes.status, 401, `Bearer token with secret "${secret}" must be rejected with 401`);

        // Test x-staging-guard-token: <secret>
        const headerReq = new Request("http://localhost:3000/api/admin/health/db", {
          method: "GET",
          headers: {
            "x-staging-guard-token": secret,
          },
        });
        const headerRes = await GET(headerReq);
        assert.equal(headerRes.status, 401, `x-staging-guard-token header with secret "${secret}" must be rejected with 401`);
      }
    });
  } finally {
    if (origDbUrl !== undefined) {
      process.env.DATABASE_URL = origDbUrl;
    } else {
      delete process.env.DATABASE_URL;
    }
    if (origSecret !== undefined) {
      process.env.ADMIN_SESSION_SECRET = origSecret;
    } else {
      delete process.env.ADMIN_SESSION_SECRET;
    }
  }
});

