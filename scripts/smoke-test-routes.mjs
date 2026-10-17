import assert from "node:assert/strict";

// Register module alias loader
await import("./lib/register.mjs");

process.env.TRUSTED_PROXY = "xff";

async function runSmokeTests() {
  console.log("=== Running Route Smoke Tests (Direct Handler Invocations) ===");

  // 1. /api/health
  console.log("Testing GET /api/health...");
  const { GET: healthGet } = await import("../app/api/health/route.ts");
  const healthRes = await healthGet();
  assert.ok([200, 503].includes(healthRes.status), "Health check returns 200 or 503");
  const healthJson = await healthRes.json();
  assert.ok(["healthy", "degraded"].includes(healthJson.status));
  assert.ok(healthJson.version, "Health response includes version");
  console.log("✓ GET /api/health passed:", healthJson.version, healthJson.status, "(HTTP " + healthRes.status + ")");

  // 2. /api/contact
  console.log("Testing POST /api/contact (honeypot)...");
  const { POST: contactPost } = await import("../app/api/contact/route.ts");
  const hpReq = new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.99" },
    body: JSON.stringify({
      name: "Bot",
      email: "bot@example.com",
      message: "Hello",
      _hp: "bot",
    }),
  });
  const hpRes = await contactPost(hpReq);
  assert.equal(hpRes.status, 400);
  console.log("✓ POST /api/contact rejected honeypot with 400");

  // 3. /api/newsletter
  console.log("Testing POST /api/newsletter (honeypot & timing)...");
  const { POST: newsletterPost } = await import("../app/api/newsletter/route.ts");
  const newsHpReq = new Request("http://localhost/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.99" },
    body: JSON.stringify({
      email: "bot@example.com",
      _hp: "trap",
      _t: Date.now() - 5000,
    }),
  });
  const newsHpRes = await newsletterPost(newsHpReq);
  assert.equal(newsHpRes.status, 400);
  console.log("✓ POST /api/newsletter rejected honeypot with 400");

  // 4. /api/admin/messages (Auth check)
  console.log("Testing GET /api/admin/messages without auth...");
  const { GET: adminMessagesGet } = await import("../app/api/admin/messages/route.ts");
  const unauthReq = new Request("http://localhost/api/admin/messages", {
    headers: { "x-forwarded-for": "127.0.0.99" },
  });
  const unauthRes = await adminMessagesGet(unauthReq);
  assert.equal(unauthRes.status, 401);
  console.log("✓ GET /api/admin/messages rejected unauthenticated request with 401");

  // 5. /api/admin/health/db (Auth check)
  console.log("Testing GET /api/admin/health/db without auth...");
  const { GET: dbHealthGet } = await import("../app/api/admin/health/db/route.ts");
  const dbHealthReq = new Request("http://localhost/api/admin/health/db", {
    headers: { "x-forwarded-for": "127.0.0.99" },
  });
  const dbHealthRes = await dbHealthGet(dbHealthReq);
  assert.equal(dbHealthRes.status, 401);
  console.log("✓ GET /api/admin/health/db rejected unauthenticated request with 401");

  console.log("\nALL ROUTE SMOKE TESTS PASSED CLEANLY!");
}

runSmokeTests().catch((err) => {
  console.error("Route Smoke Test FAILED:", err);
  process.exit(1);
});
