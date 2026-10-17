import test from "node:test";
import assert from "node:assert/strict";

// Register module alias loader
await import("../lib/register.mjs");

process.env.ADMIN_SESSION_SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef";
process.env.TRUSTED_PROXY = "xff";

const { POST: postContact } = await import("../../app/api/contact/route.ts");
const { GET: getAdminMessages } = await import("../../app/api/admin/messages/route.ts");
const { PATCH: patchAdminMessage, DELETE: deleteAdminMessage } = await import("../../app/api/admin/messages/[id]/route.ts");
const {
  getContactMessages,
  resetContactMessagesCache,
} = await import("../../lib/contact-messages-storage.ts");
const { createAdminUser, deleteAdminUser } = await import("../../lib/admin-users-storage.ts");
const { createAdminSession, ADMIN_SESSION_COOKIE } = await import("../../lib/admin-auth.ts");

test("Contact Messages & Admin Inbox Workflow", async (t) => {
  resetContactMessagesCache();

  const ownerToken = await createAdminSession({
    userId: "usr-owner-1",
    role: "owner",
    email: "admin@laptoppointbd.com",
    name: "Primary Store Owner",
  });
  const ownerCookie = `${ADMIN_SESSION_COOKIE}=${ownerToken}`;

  // Create an active support staff user in store
  const supportUser = await createAdminUser({
    name: "Support Staff Agent",
    email: `support-${Date.now()}@laptoppointbd.com`,
    role: "support",
  });

  const supportToken = await createAdminSession({
    userId: supportUser.id,
    role: "support",
    email: supportUser.email,
    name: supportUser.name,
  });
  const supportCookie = `${ADMIN_SESSION_COOKIE}=${supportToken}`;

  let createdMessageId = "";

  t.after(async () => {
    if (supportUser?.id) {
      await deleteAdminUser(supportUser.id).catch(() => {});
    }
  });

  await t.test("1. Submission is stored with IP hash, truncated UA, and status 'unread'", async () => {
    const now = Date.now();
    const req = new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36",
        "x-forwarded-for": "103.205.71.10",
      },
      body: JSON.stringify({
        name: "Shakib Al Hasan",
        email: "shakib@example.com",
        subject: "Lenovo Legion Stock Query",
        message: "Hello, do you currently have the Lenovo Legion 5 Pro in stock with RTX 4060?",
        _t: now - 3000, // 3 seconds elapsed (passes bot friction)
      }),
    });

    const res = await postContact(req);
    assert.equal(res.status, 200, "Must return 200 on successful storage");
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.match(json.message, /message received successfully/i);

    // Verify persisted directly in storage
    const all = await getContactMessages();
    const found = all.find((m) => m.email === "shakib@example.com");
    assert.ok(found, "Record must be saved to contact messages store");
    assert.equal(found.name, "Shakib Al Hasan");
    assert.equal(found.subject, "Lenovo Legion Stock Query");
    assert.equal(found.status, "unread");
    assert.ok(found.ipHash && found.ipHash.length === 64, "IP hash must be a 64-char SHA-256 digest");
    assert.ok(!found.ipHash.includes("103.205.71.10"), "Raw IP must NEVER be persisted in store");
    assert.ok(found.userAgent.includes("Mozilla/5.0"), "User agent must be captured");

    createdMessageId = found.id;
  });

  await t.test("2. Honeypot submission is rejected with 400 without storing record", async () => {
    const beforeCount = (await getContactMessages()).length;
    const now = Date.now();

    const req = new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "103.205.71.11",
      },
      body: JSON.stringify({
        name: "Bot Spammer",
        email: "spammer@botnet.ru",
        subject: "Cheap SEO backlinks",
        message: "Buy cheap high DA backlinks at scam-link.ru now!",
        _hp: "Hidden bot value",
        _t: now - 5000,
      }),
    });

    const res = await postContact(req);
    assert.equal(res.status, 400, "Honeypot submission must return 400 Bad Request");
    const json = await res.json();
    assert.match(json.error, /automated submission rejected/i);

    const afterCount = (await getContactMessages()).length;
    assert.equal(afterCount, beforeCount, "Honeypot payload must NOT be written to storage");
  });

  await t.test("3. Per-IP rate limiting rejects excessive contact submissions (429)", async () => {
    const testIp = "192.168.100.55";
    const now = Date.now();

    // Make 5 submissions to exhaust the 5/10m window for this IP
    for (let i = 0; i < 5; i++) {
      const req = new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": testIp,
        },
        body: JSON.stringify({
          name: `User ${i}`,
          email: `rate-test-${i}@example.com`,
          message: `Inquiry message number ${i} for rate limiting check`,
          _t: now - 3000,
        }),
      });
      const res = await postContact(req);
      assert.equal(res.status, 200, `Request ${i + 1} should succeed under the rate limit`);
    }

    // 6th attempt must be rejected with 429
    const blockedReq = new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": testIp,
      },
      body: JSON.stringify({
        name: "User Blocked",
        email: "blocked@example.com",
        message: "This inquiry exceeds the 5/10m rate limit",
        _t: now - 3000,
      }),
    });

    const blockedRes = await postContact(blockedReq);
    assert.equal(blockedRes.status, 429, "Excessive submissions must return 429");
    assert.ok(blockedRes.headers.get("retry-after"), "Retry-After header must be present");
  });

  await t.test("4. Admin messages route requires authentication (401 for unauthenticated)", async () => {
    const unauthReq = new Request("http://localhost:3000/api/admin/messages", {
      method: "GET",
    });

    const res = await getAdminMessages(unauthReq);
    assert.equal(res.status, 401, "Unauthenticated request to /api/admin/messages must return 401");
  });

  await t.test("5. Admin messages route allows owner and support roles with search/filter", async () => {
    // Owner access
    const ownerReq = new Request("http://localhost:3000/api/admin/messages?status=unread", {
      method: "GET",
      headers: {
        cookie: ownerCookie,
        host: "localhost:3000",
      },
    });

    const ownerRes = await getAdminMessages(ownerReq);
    assert.equal(ownerRes.status, 200, "Owner must have access");
    const ownerData = await ownerRes.json();
    assert.ok(Array.isArray(ownerData.messages), "Messages must be an array");
    assert.ok(typeof ownerData.unreadCount === "number", "unreadCount must be a number");
    assert.ok(ownerData.messages.some((m) => m.id === createdMessageId));

    // Support access
    const supportReq = new Request("http://localhost:3000/api/admin/messages?q=Legion", {
      method: "GET",
      headers: {
        cookie: supportCookie,
        host: "localhost:3000",
      },
    });

    const supportRes = await getAdminMessages(supportReq);
    assert.equal(supportRes.status, 200, "Support role must have access");
    const supportData = await supportRes.json();
    assert.ok(supportData.messages.length > 0);
    assert.equal(supportData.messages[0].name, "Shakib Al Hasan");
  });

  await t.test("6. Admin can update status and delete customer message", async () => {
    assert.ok(createdMessageId, "Created message ID must exist from test 1");

    // Patch status to 'handled'
    const patchReq = new Request(`http://localhost:3000/api/admin/messages/${createdMessageId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        cookie: ownerCookie,
        host: "localhost:3000",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({ status: "handled" }),
    });

    const patchRes = await patchAdminMessage(patchReq, {
      params: Promise.resolve({ id: createdMessageId }),
    });
    assert.equal(patchRes.status, 200, "Patching status must return 200");
    const patchData = await patchRes.json();
    assert.equal(patchData.ok, true);
    assert.equal(patchData.message.status, "handled");

    // Delete message
    const deleteReq = new Request(`http://localhost:3000/api/admin/messages/${createdMessageId}`, {
      method: "DELETE",
      headers: {
        cookie: ownerCookie,
        host: "localhost:3000",
        origin: "http://localhost:3000",
      },
    });

    const deleteRes = await deleteAdminMessage(deleteReq, {
      params: Promise.resolve({ id: createdMessageId }),
    });
    assert.equal(deleteRes.status, 200, "Deleting message must return 200");

    const all = await getContactMessages();
    assert.ok(!all.some((m) => m.id === createdMessageId), "Deleted message must no longer be in storage");
  });
});
