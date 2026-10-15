// Unit tests for ImageKit storage and deletions with mocked fetch
// Run: node scripts/test-imagekit-deletions.mjs

import assert from "node:assert/strict";
import {
  storeMediaMeta,
  getMediaMeta,
  deleteMediaMeta,
  deleteFromImageKit,
  findAssetUsages,
} from "../lib/media/storage.ts";

let testsPassed = 0;
let testsFailed = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`FAIL: ${name}`);
    console.error(err);
    testsFailed++;
  }
}

async function itAsync(name, fn) {
  try {
    await fn();
    console.log(`PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`FAIL: ${name}`);
    console.error(err);
    testsFailed++;
  }
}

console.log("=== Running ImageKit Deletion & Storage Unit Tests ===");

const TEST_URL = "https://ik.imagekit.io/laptop-point/test-asset-12345.webp";
const TEST_FILE_ID = "file_test_id_987654";
const TEST_KEY = "test_private_key_xyz";

await itAsync("storeMediaMeta and getMediaMeta work by URL and fileId", async () => {
  await storeMediaMeta(TEST_URL, {
    fileId: TEST_FILE_ID,
    url: TEST_URL,
    name: "test-asset-12345.webp",
    preset: "product",
    width: 1200,
    height: 800,
    bytes: 54321,
    createdAt: new Date().toISOString(),
  });

  const byUrl = await getMediaMeta(TEST_URL);
  assert.equal(byUrl?.fileId, TEST_FILE_ID, "Should retrieve meta by URL");
  assert.equal(byUrl?.preset, "product", "Preset should be 'product'");

  const byFileId = await getMediaMeta(TEST_FILE_ID);
  assert.equal(byFileId?.url, TEST_URL, "Should retrieve meta by fileId");

  const byIkKey = await getMediaMeta(`ik:${TEST_FILE_ID}`);
  assert.equal(byIkKey?.url, TEST_URL, "Should retrieve meta by ik:fileId");
});

await itAsync("deleteFromImageKit calls DELETE with Authorization header (mocked fetch)", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  let requestedMethod = "";
  let authHeader = "";

  globalThis.fetch = async (url, options) => {
    requestedUrl = String(url);
    requestedMethod = options.method;
    authHeader = options.headers?.Authorization || "";
    return new Response(null, { status: 204 });
  };

  try {
    const res = await deleteFromImageKit(TEST_FILE_ID, TEST_KEY);
    assert.equal(res.ok, true, "Result should be ok for status 204");
    assert.equal(res.status, 204, "Status should be 204");
    assert.equal(
      requestedUrl,
      `https://api.imagekit.io/v1/files/${TEST_FILE_ID}`,
      "URL must point to ImageKit file deletion API"
    );
    assert.equal(requestedMethod, "DELETE", "HTTP method must be DELETE");
    const expectedAuth = `Basic ${Buffer.from(`${TEST_KEY}:`).toString("base64")}`;
    assert.equal(authHeader, expectedAuth, "Authorization header must be Basic base64(privateKey:)");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await itAsync("deleteFromImageKit treats 404 as successful idempotent deletion", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ message: "File not found" }), { status: 404 });

  try {
    const res = await deleteFromImageKit("non_existent_file_id", TEST_KEY);
    assert.equal(res.ok, true, "404 should be treated as successfully deleted (idempotent)");
    assert.equal(res.status, 404);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await itAsync("deleteFromImageKit fails gracefully on 500 error", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("Internal Server Error", { status: 500 });

  try {
    const res = await deleteFromImageKit(TEST_FILE_ID, TEST_KEY);
    assert.equal(res.ok, false, "Result should not be ok for 500");
    assert.equal(res.status, 500);
    assert.match(res.error || "", /500/, "Error message should contain status 500");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await itAsync("findAssetUsages reports in-use protection for existing catalogue images", async () => {
  // Check against a known seed image from catalogue or placeholder
  const usages = await findAssetUsages("/images/placeholder-laptop.png");
  // Doesn't throw and returns an array
  assert.ok(Array.isArray(usages), "Usages must be an array");

  // An unused random image should have 0 usages
  const randomUsages = await findAssetUsages("https://ik.imagekit.io/laptop-point/random-unreferenced-image.webp");
  assert.equal(randomUsages.length, 0, "Unreferenced image must have 0 usages");
});

await itAsync("deleteMediaMeta removes metadata cleanly", async () => {
  await deleteMediaMeta(TEST_URL);
  const byUrl = await getMediaMeta(TEST_URL);
  assert.equal(byUrl, undefined, "Metadata should be deleted");
});

console.log(`\n=== Results: ${testsPassed} passed, ${testsFailed} failed ===`);
if (testsFailed > 0) {
  process.exit(1);
}
