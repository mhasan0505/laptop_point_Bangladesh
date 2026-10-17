import test from "node:test";
import assert from "node:assert/strict";

// Register module alias loader
await import("../lib/register.mjs");

process.env.ADMIN_SESSION_SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef";

const { requireAdmin } = await import("../../lib/auth-guard.ts");

const { createAdminSession, ADMIN_SESSION_COOKIE } = await import("../../lib/admin-auth.ts");

test("CSRF Protection for State-Changing Admin Requests", async (t) => {
  const sessionToken = await createAdminSession({
    userId: "usr-owner-1",
    role: "owner",
    email: "admin@laptoppointbd.com",
    name: "Primary Store Owner",
  });

  const validCookie = `${ADMIN_SESSION_COOKIE}=${sessionToken}`;

  await t.test("1. Rejects state-changing POST request with Sec-Fetch-Site: cross-site", async () => {
    const req = new Request("http://localhost:3000/api/admin/setup", {
      method: "POST",
      headers: {
        cookie: validCookie,
        "sec-fetch-site": "cross-site",
        origin: "https://malicious-site.com",
        host: "localhost:3000",
      },
    });

    const result = await requireAdmin(req);
    assert.equal(result.user, null, "User must be null when CSRF detected");
    assert.ok(result.error, "Error response must be returned");
    assert.equal(result.error.status, 403, "Status must be 403 Forbidden");
    const json = await result.error.json();
    assert.match(json.error, /cross-site/i);
  });

  await t.test("2. Rejects state-changing PUT request with mismatched Origin", async () => {
    const req = new Request("http://localhost:3000/api/admin/products", {
      method: "PUT",
      headers: {
        cookie: validCookie,
        origin: "https://attacker.org",
        host: "localhost:3000",
      },
    });

    const result = await requireAdmin(req);
    assert.equal(result.user, null);
    assert.equal(result.error.status, 403);
    const json = await result.error.json();
    assert.match(json.error, /origin mismatch/i);
  });

  await t.test("3. Allows state-changing POST with matching Origin", async () => {
    const req = new Request("http://localhost:3000/api/admin/setup", {
      method: "POST",
      headers: {
        cookie: validCookie,
        origin: "http://localhost:3000",
        host: "localhost:3000",
        "sec-fetch-site": "same-origin",
      },
    });

    const result = await requireAdmin(req);
    assert.equal(result.error, null, "Matching origin must not trigger CSRF rejection");
    assert.ok(result.user, "Authorized user must be returned");
    assert.equal(result.user.role, "owner");
  });

  await t.test("4. Safe GET requests are NOT subject to CSRF origin blocking", async () => {
    const req = new Request("http://localhost:3000/api/admin/setup", {
      method: "GET",
      headers: {
        cookie: validCookie,
        origin: "https://attacker.org",
        host: "localhost:3000",
      },
    });

    const result = await requireAdmin(req);
    assert.equal(result.error, null, "GET requests should not be blocked by CSRF checks");
    assert.ok(result.user);
  });
});
