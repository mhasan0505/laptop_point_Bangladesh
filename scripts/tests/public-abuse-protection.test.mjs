import test from "node:test";
import assert from "node:assert/strict";

// Register module alias loader
await import("../lib/register.mjs");

const { POST: postQuestion } = await import("../../app/api/questions/route.ts");
const { POST: postContact } = await import("../../app/api/contact/route.ts");
const { POST: postOrder } = await import("../../app/api/orders/route.ts");

test("Public Abuse Protection & Bot Friction", async (t) => {
  await t.test("1. Contact Form: Rejects bot submissions via honeypot", async () => {
    const req = new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Bot User",
        email: "bot@spammer.org",
        message: "Buy cheap products now at spam link!",
        _hp: "I am a spam bot filling all inputs",
      }),
    });

    const res = await postContact(req);
    assert.equal(res.status, 400, "Must reject honeypot submissions with 400");
    const json = await res.json();
    assert.match(json.error, /automated/i);
  });

  await t.test("2. Contact Form: Rejects unnaturally fast automated script submissions", async () => {
    const now = Date.now();
    const req = new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Fast Bot",
        email: "fast@bot.org",
        message: "Instant submission within 50ms of form render",
        _t: now - 50, // Only 50ms elapsed
      }),
    });

    const res = await postContact(req);
    assert.equal(res.status, 400, "Must reject fast submissions with 400");
    const json = await res.json();
    assert.match(json.error, /automated/i);
  });

  await t.test("3. Contact Form: Accepts legitimate human submission (>= 2s elapsed)", async () => {
    const now = Date.now();
    const req = new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Rahim Chowdhury",
        email: "rahim@example.com",
        subject: "Product Inquiry",
        message: "Do you have the ThinkPad T14 Gen 3 in stock today?",
        _t: now - 3500, // 3.5s elapsed
      }),
    });

    const res = await postContact(req);
    assert.equal(res.status, 200, "Must accept valid contact submission");
    const json = await res.json();
    assert.equal(json.ok, true);
  });

  await t.test("4. Questions Form: Rejects bot honeypots", async () => {
    const req = new Request("http://localhost:3000/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productSlug: "lenovo-thinkpad-t14",
        question: "Is this laptop available with 16GB RAM?",
        _hp: "spam-bot",
      }),
    });

    const res = await postQuestion(req);
    assert.equal(res.status, 400, "Must reject honeypot with 400");
    const json = await res.json();
    assert.match(json.error, /automated/i);
  });

  await t.test("5. Questions Form: Length limit validation", async () => {
    const req = new Request("http://localhost:3000/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productSlug: "lenovo-thinkpad-t14",
        question: "Short", // < 10 chars
      }),
    });

    const res = await postQuestion(req);
    assert.equal(res.status, 400, "Must reject question shorter than 10 chars");
  });

  await t.test("6. Orders Form: Rejects bot honeypot", async () => {
    const req = new Request("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Bot Orderer",
        customerPhone: "01700000000",
        _hp: "bot-payload",
        items: [{ productId: "test", quantity: 1 }],
      }),
    });

    const res = await postOrder(req);
    assert.equal(res.status, 400, "Must reject order with honeypot");
    const json = await res.json();
    assert.match(json.error, /automated/i);
  });

  await t.test("7. Orders Form: Enforces maximum field lengths", async () => {
    const req = new Request("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "A".repeat(150), // exceeds 100
        customerPhone: "01700000000",
        items: [{ productId: "test", quantity: 1 }],
      }),
    });

    const res = await postOrder(req);
    assert.equal(res.status, 400, "Must reject excessively long customer name");
    const json = await res.json();
    assert.match(json.error, /between 2 and 100 characters/i);
  });
});
