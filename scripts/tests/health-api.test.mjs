import test from "node:test";
import assert from "node:assert/strict";

// Register @/ module alias loader
await import("../lib/register.mjs");

const { GET } = await import("../../app/api/health/route.ts");

test("Public Health Endpoint (GET /api/health)", async (t) => {
  await t.test("1. Returns structured health payload without secrets", async () => {
    const res = await GET();
    const data = await res.json();

    assert.ok(data.status === "healthy" || data.status === "degraded", "Status must be 'healthy' or 'degraded'");
    assert.ok(typeof data.timestamp === "string", "Timestamp must be an ISO string");
    assert.ok(typeof data.uptimeSeconds === "number", "Uptime must be a number");
    assert.ok(typeof data.version === "string", "Version must be present");
    assert.ok(typeof data.checks === "object", "Checks object must be present");
    assert.ok(typeof data.checks.database === "boolean", "Database check must be boolean");
    assert.ok(typeof data.checks.imagekit === "boolean", "ImageKit check must be boolean");
    assert.ok(typeof data.checks.env === "boolean", "Env check must be boolean");

    // Strictly ensure no secrets leak into response
    const jsonStr = JSON.stringify(data);
    assert.ok(!jsonStr.includes("postgres://"), "Must not leak postgres:// URLs");
    assert.ok(!jsonStr.includes("postgresql://"), "Must not leak postgresql:// URLs");
    assert.ok(!jsonStr.includes("password"), "Must not leak passwords");
    assert.ok(!jsonStr.includes("private_"), "Must not leak private keys");

    // Cache-Control verification
    assert.equal(
      res.headers.get("Cache-Control"),
      "no-store, no-cache, must-revalidate, max-age=0",
      "Health checks must never be cached by CDNs"
    );
  });
});
