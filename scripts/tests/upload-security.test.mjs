import test from "node:test";
import assert from "node:assert/strict";

// Register module alias loader
await import("../lib/register.mjs");

const { POST: postUpload } = await import("../../app/api/admin/upload/route.ts");
const { createAdminSession, ADMIN_SESSION_COOKIE } = await import("../../lib/admin-auth.ts");
const { storeMediaMeta, getMediaMeta, deleteMediaMeta } = await import("../../lib/media/storage.ts");

process.env.ADMIN_SESSION_SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef";

test("Upload Pipeline Security & Verification", async (t) => {
  const sessionToken = await createAdminSession({
    userId: "usr-owner-1",
    role: "owner",
    email: "admin@laptoppointbd.com",
    name: "Primary Store Owner",
  });
  const authCookie = `${ADMIN_SESSION_COOKIE}=${sessionToken}`;

  await t.test("1. Unauthenticated upload request is rejected with 401", async () => {
    const fd = new FormData();
    fd.append("file", new Blob([Buffer.from("fake")], { type: "image/png" }), "test.png");
    const req = new Request("http://localhost:3000/api/admin/upload", {
      method: "POST",
      body: fd,
    });

    const res = await postUpload(req);
    assert.equal(res.status, 401, "Unauthenticated uploads must be rejected");
  });

  await t.test("2. Rejects HTML/script payload disguised as an image (MIME sniffing check)", async () => {
    const htmlPayload = Buffer.from("<html><script>alert('xss')</script></html>");
    const fd = new FormData();
    fd.append("file", new Blob([htmlPayload], { type: "image/png" }), "malicious.png");

    const req = new Request("http://localhost:3000/api/admin/upload", {
      method: "POST",
      headers: { cookie: authCookie },
      body: fd,
    });

    const res = await postUpload(req);
    assert.equal(res.status, 415, "Non-image payload must be rejected with 415 Unsupported Media Type");
    const json = await res.json();
    assert.match(json.error, /unsupported file/i);
  });

  await t.test("3. Rejects SVG files to prevent stored XSS execution", async () => {
    const svgPayload = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    const fd = new FormData();
    fd.append("file", new Blob([svgPayload], { type: "image/svg+xml" }), "vector.svg");

    const req = new Request("http://localhost:3000/api/admin/upload", {
      method: "POST",
      headers: { cookie: authCookie },
      body: fd,
    });

    const res = await postUpload(req);
    assert.equal(res.status, 415, "SVG uploads must be rejected with 415");
  });

  await t.test("4. Rejects empty file with 400 Bad Request", async () => {
    const fd = new FormData();
    fd.append("file", new Blob([], { type: "image/png" }), "empty.png");

    const req = new Request("http://localhost:3000/api/admin/upload", {
      method: "POST",
      headers: { cookie: authCookie },
      body: fd,
    });

    const res = await postUpload(req);
    assert.equal(res.status, 400, "Empty upload must be rejected with 400");
  });

  await t.test("5. Media storage correctly persists and retrieves ImageKit fileId", async () => {
    const testUrl = "https://ik.imagekit.io/laptop-point/test-upload-verification.webp";
    const testMeta = {
      fileId: "file_test_ik_id_12345",
      url: testUrl,
      name: "test-upload-verification.webp",
      preset: "card",
      width: 800,
      height: 600,
      bytes: 45000,
      createdAt: new Date().toISOString(),
    };

    // Store in persistence layer
    await storeMediaMeta(testUrl, testMeta);

    // Retrieve and verify fileId matches
    const retrieved = await getMediaMeta(testUrl);
    assert.ok(retrieved, "Stored media metadata must be retrievable");
    assert.equal(retrieved.fileId, "file_test_ik_id_12345", "Must preserve ImageKit fileId for CDN deletion/management");
    assert.equal(retrieved.width, 800);
    assert.equal(retrieved.height, 600);

    // Cleanup test record
    await deleteMediaMeta(testUrl);
  });
});
