import test from "node:test";
import assert from "node:assert/strict";

// Register module alias loader
await import("../lib/register.mjs");

const { POST: postLogin } = await import("../../app/api/admin/login/route.ts");
const {
  resetLoginRateLimit,
  checkLoginRateLimit,
  recordFailedLogin,
  MAX_ATTEMPTS,
  rateLimitStore,
} = await import("../../lib/rate-limit.ts");
const {
  createTrustedDeviceToken,
  computePasswordFingerprint,
  TRUSTED_DEVICE_COOKIE,
  ADMIN_SESSION_COOKIE,
} = await import("../../lib/admin-auth.ts");

process.env.ADMIN_SESSION_SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef";
process.env.ADMIN_EMAIL = "admin@laptoppointbd.com";
process.env.ADMIN_PASSWORD = "StrongSecurePassword123!";
process.env.TRUSTED_PROXY = "xff";


test("Staff Lockout & Trusted-Device Regression Suite", async (t) => {
  const testIp = "192.168.10.99";
  const testEmail = "admin@laptoppointbd.com";

  // Clean state before tests
  resetLoginRateLimit(testIp, testEmail);

  await t.test("1. Failed login returns 401 and records attempt", async () => {
    resetLoginRateLimit(testIp, testEmail);
    const req = new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": testIp,
      },
      body: JSON.stringify({
        email: testEmail,
        password: "wrong-password",
      }),
    });

    const res = await postLogin(req);
    assert.equal(res.status, 401, "Wrong password must return 401");
    const json = await res.json();
    assert.equal(json.error, "Invalid credentials");
  });

  await t.test("2. Exactly 5 failed attempts locks out the account/IP (HTTP 429)", async () => {
    resetLoginRateLimit(testIp, testEmail);

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      recordFailedLogin(testIp, testEmail);
    }

    const rateCheck = checkLoginRateLimit(testIp, testEmail);
    assert.equal(rateCheck.allowed, false, "Should be locked out after 5 attempts");

    // Request from locked IP/email should be rejected before checking credentials
    const req = new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": testIp,
      },
      body: JSON.stringify({
        email: testEmail,
        password: process.env.ADMIN_PASSWORD, // Even with correct password
      }),
    });

    const res = await postLogin(req);
    assert.equal(res.status, 429, "Locked account must receive 429 Too Many Requests");
    assert.ok(res.headers.get("Retry-After"), "Must include Retry-After header");
    const json = await res.json();
    assert.match(json.error, /too many login attempts/i);
  });

  await t.test("3. Trusted device token bypasses account lockout", async () => {
    // Generate valid trusted device token for primary owner
    const fp = await computePasswordFingerprint(process.env.ADMIN_PASSWORD);
    const validTrustedToken = await createTrustedDeviceToken("usr-owner-1", fp);

    const req = new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": testIp,
        cookie: `${TRUSTED_DEVICE_COOKIE}=${validTrustedToken}`,
      },
      body: JSON.stringify({
        email: testEmail,
        password: process.env.ADMIN_PASSWORD,
      }),
    });

    const res = await postLogin(req);
    assert.equal(res.status, 200, "Valid trusted device must bypass lockout and succeed");
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.equal(json.user.role, "owner");

    // Verify cookies set
    const cookies = res.headers.getSetCookie();
    assert.ok(cookies.some((c) => c.includes(ADMIN_SESSION_COOKIE)), "Must set admin_session cookie");
    assert.ok(cookies.some((c) => c.includes(TRUSTED_DEVICE_COOKIE)), "Must set trusted_device cookie");
    assert.ok(cookies.every((c) => c.includes("HttpOnly")), "All security cookies must be HttpOnly");
    assert.ok(cookies.every((c) => c.includes("SameSite=Lax")), "All security cookies must be SameSite=Lax");
  });

  await t.test("4. Invalid trusted device token fails to bypass lockout", async () => {
    // Lock again
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      recordFailedLogin(testIp, testEmail);
    }

    const req = new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": testIp,
        cookie: `${TRUSTED_DEVICE_COOKIE}=forged_or_invalid_token_xyz`,
      },
      body: JSON.stringify({
        email: testEmail,
        password: process.env.ADMIN_PASSWORD,
      }),
    });

    const res = await postLogin(req);
    assert.equal(res.status, 429, "Forged token must not bypass lockout");
  });

  // Clean state after tests
  resetLoginRateLimit(testIp, testEmail);
});
