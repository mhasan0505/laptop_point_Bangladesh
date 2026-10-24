import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_SERVER_URL || "http://localhost:3005";
const CRON_SECRET = process.env.CRON_SECRET || "test-cron-secret-12345";

async function runRealHttpSmokeTests() {
  console.log(`=== Running Real HTTP Smoke Tests against ${BASE_URL} ===\n`);

  // 1. Security Headers on /
  console.log("1. Checking security headers on / ...");
  const rootRes = await fetch(`${BASE_URL}/`, { redirect: "manual" });
  assert.equal(rootRes.status, 200, "Root / should return HTTP 200");

  const cspHeader = rootRes.headers.get("content-security-policy-report-only");
  assert.ok(cspHeader, "CSP Report-Only header must be present");
  assert.ok(cspHeader.includes("default-src 'self'"), "CSP must include default-src 'self'");

  const hsts = rootRes.headers.get("strict-transport-security");
  assert.ok(hsts, "Strict-Transport-Security must be present");

  const nosniff = rootRes.headers.get("x-content-type-options");
  assert.equal(nosniff, "nosniff", "X-Content-Type-Options must be nosniff");

  const frameOptions = rootRes.headers.get("x-frame-options");
  assert.equal(frameOptions, "SAMEORIGIN", "X-Frame-Options must be SAMEORIGIN");

  const permissions = rootRes.headers.get("permissions-policy");
  assert.ok(permissions, "Permissions-Policy must be present");

  console.log("✓ Security headers verified on /");

  // 2. Public Page Status Codes
  console.log("\n2. Checking public pages status codes...");
  const publicPages = [
    "/",
    "/shop",
    "/deals",
    "/accessories",
    "/accessories/routers",
    "/accessories/charger-and-adapter",
    "/accessories/hp-65w-usb-c-charger",
    "/product/hp-probook-440-g3-business-laptop",
    "/compare",
    "/wishlist",
    "/cart",
    "/checkout",
    "/contact",
    "/track-order",
    "/privacy",
    "/terms",
    "/returns",
    "/shipping",
    "/EMI",
    "/power-deal",
    "/admin/login",
  ];

  for (const page of publicPages) {
    const res = await fetch(`${BASE_URL}${page}`);
    assert.equal(
      res.status,
      200,
      `Expected ${page} to return HTTP 200, got ${res.status}`
    );
    console.log(`  ✓ ${page} -> 200 OK`);
  }

  // 3. SEO & Convenience Redirects
  console.log("\n3. Checking redirects...");
  const redirects = [
    { from: "/login", expectedLocation: "/admin/login", status: 307 },
    { from: "/payment-methods", expectedLocation: "/EMI", status: 308 },
    { from: "/about", expectedLocation: "/contact", status: 308 },
    { from: "/privacy-policy", expectedLocation: "/privacy", status: 308 },
    { from: "/order-tracking", expectedLocation: "/track-order", status: 308 },
  ];

  for (const r of redirects) {
    const res = await fetch(`${BASE_URL}${r.from}`, { redirect: "manual" });
    const location = res.headers.get("location");
    assert.ok(
      [307, 308, 301, 302].includes(res.status),
      `Expected redirect status for ${r.from}, got ${res.status}`
    );
    assert.ok(
      location && location.includes(r.expectedLocation),
      `Expected ${r.from} to redirect to ${r.expectedLocation}, got ${location}`
    );
    console.log(`  ✓ ${r.from} -> ${res.status} redirecting to ${location}`);
  }

  // 4. Public API Endpoints
  console.log("\n4. Checking public API endpoints...");
  const publicApis = [
    { path: "/api/health", allowed: [200, 503] },
    { path: "/api/products?limit=2", allowed: [200] },
    { path: "/api/accessories", allowed: [200] },
    { path: "/api/power-deals", allowed: [200] },
    { path: "/api/banners", allowed: [200] },
  ];

  for (const api of publicApis) {
    const res = await fetch(`${BASE_URL}${api.path}`);
    assert.ok(
      api.allowed.includes(res.status),
      `Expected ${api.path} to return one of [${api.allowed.join(",")}], got ${res.status}`
    );
    console.log(`  ✓ ${api.path} -> HTTP ${res.status}`);
  }

  // 5. Cron API Security
  console.log("\n5. Checking /api/cron authentication fail-closed...");
  // a. Unset or no header -> 401
  const cronNoHeader = await fetch(`${BASE_URL}/api/cron`);
  assert.equal(cronNoHeader.status, 401, "Expected missing header to return 401");

  // b. Wrong secret -> 401
  const cronWrong = await fetch(`${BASE_URL}/api/cron`, {
    headers: { Authorization: "Bearer wrong-secret" },
  });
  assert.equal(cronWrong.status, 401, "Expected wrong secret to return 401");

  // c. Correct secret -> 200
  const cronOk = await fetch(`${BASE_URL}/api/cron`, {
    headers: { Authorization: `Bearer ${CRON_SECRET}` },
  });
  assert.equal(cronOk.status, 200, "Expected matching secret to return 200");
  console.log("  ✓ /api/cron correctly rejects unauth (401) and accepts bearer secret (200)");

  // 6. Admin API Protection (Fail-Closed)
  console.log("\n6. Checking admin API protection (fail-closed with 401)...");
  const adminApis = [
    "/api/admin/orders",
    "/api/admin/messages",
    "/api/admin/products",
    "/api/admin/health/db",
    "/api/admin/users",
    "/api/inventory",
  ];

  for (const endpoint of adminApis) {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    assert.equal(
      res.status,
      401,
      `Expected ${endpoint} to reject unauthenticated request with 401, got ${res.status}`
    );
    console.log(`  ✓ ${endpoint} -> 401 Unauthorized`);
  }

  console.log("\n🎉 ALL REAL HTTP SMOKE TESTS PASSED CLEANLY!");
}

runRealHttpSmokeTests().catch((err) => {
  console.error("HTTP Smoke Test FAILED:", err);
  process.exit(1);
});
