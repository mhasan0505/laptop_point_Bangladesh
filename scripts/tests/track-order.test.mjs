import test from "node:test";
import assert from "node:assert/strict";

// Register module alias loader
await import("../lib/register.mjs");

process.env.TRUSTED_PROXY = "xff";

const { POST: trackOrder } = await import("../../app/api/orders/track/route.ts");

test("Order Tracking API (/api/orders/track)", async (t) => {
  await t.test("1. Rejects missing fields with 400", async () => {
    const req = new Request("http://localhost:3000/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.1" },
      body: JSON.stringify({ orderNumber: "" }),
    });

    const res = await trackOrder(req);
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.match(json.error, /required/i);
  });

  await t.test("2. Rejects bot honeypot submission with 400", async () => {
    const req = new Request("http://localhost:3000/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.2" },
      body: JSON.stringify({
        orderNumber: "ORD-12345-678",
        phone: "01712345678",
        _hp: "bot-payload",
      }),
    });

    const res = await trackOrder(req);
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.match(json.error, /automated/i);
  });

  await t.test("3. Uniform 404 on non-existent order number", async () => {
    const req = new Request("http://localhost:3000/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.3" },
      body: JSON.stringify({
        orderNumber: "ORD-99999-999",
        phone: "01700000000",
      }),
    });

    const res = await trackOrder(req);
    assert.equal(res.status, 404);
    const json = await res.json();
    assert.equal(
      json.error,
      "Order not found with provided phone and order number.",
      "Must return uniform error message to avoid enumeration"
    );
  });

  await t.test("4. Rate limiting rejects excessive lookup requests (HTTP 429)", async () => {
    const ip = "10.0.0.50";
    let lastStatus = 200;

    // Send 16 requests (limit is 15)
    for (let i = 0; i < 16; i++) {
      const req = new Request("http://localhost:3000/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify({
          orderNumber: `ORD-TEST-${i}`,
          phone: "01712345678",
        }),
      });

      const res = await trackOrder(req);
      lastStatus = res.status;
    }

    assert.equal(lastStatus, 429, "16th request must trigger 429 rate limit");
  });
});
