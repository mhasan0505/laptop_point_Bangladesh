// Upload pipeline smoke test. Run it yourself against a LOCAL dev server:
//
//   node --env-file=.env.local scripts/test-uploads.mjs
//
// Needs ADMIN_EMAIL / ADMIN_PASSWORD in the environment (never hard-code them).
// What it checks (all through the real HTTP API):
//   1. unauthenticated upload is rejected (401)
//   2. a real PNG uploads, returns a URL that actually loads as an image
//   3. a non-image disguised as .png is rejected (415)
//   4. an HTML/SVG payload is rejected (415)
//   5. an oversized file is rejected (413)
//   6. a request without a file is rejected (400)
//   7. the asset shows up in /api/admin/media (local storage only)
//   8. delete removes the local file
//
// NOTE: when IMAGEKIT_PRIVATE_KEY is set, step 2 uploads one tiny test image
// to ImageKit (folder /laptop-point/card). It can't be deleted from here; remove
// it in the ImageKit dashboard if you care.

import { assertStagingDatabase } from "./lib/staging-guard.mjs";

const BASE = process.env.TEST_URL || "http://localhost:3000";
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

// Staging database safety guard: refuse if server DB does not match allow-list
await assertStagingDatabase({ serverUrl: BASE });

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("ERROR: ADMIN_EMAIL / ADMIN_PASSWORD are not set in the environment.");
  process.exit(1);
}
if (!/localhost|127\.0\.0\.1/.test(BASE)) {
  console.error(`Refusing to run against non-local URL: ${BASE}`);
  process.exit(1);
}


const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

let passed = 0;
let failed = 0;
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? `  — ${extra}` : ""}`);
  ok ? passed++ : failed++;
};

function form(buffer, filename, type, preset) {
  const fd = new FormData();
  if (buffer) fd.append("file", new Blob([buffer], { type }), filename);
  if (preset) fd.append("preset", preset);
  return fd;
}

const post = (fd, cookie) =>
  fetch(`${BASE}/api/admin/upload`, {
    method: "POST",
    body: fd,
    headers: cookie ? { cookie } : {},
    redirect: "manual",
  });

// 0. login
const loginRes = await fetch(`${BASE}/api/admin/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
});
if (!loginRes.ok) {
  console.error(`Login failed (${loginRes.status}). Aborting.`);
  process.exit(1);
}
const cookie = loginRes.headers
  .getSetCookie()
  .map((c) => c.split(";")[0])
  .join("; ");

// 1. unauthenticated
{
  const r = await post(form(PNG_1x1, "t.png", "image/png"));
  check("unauthenticated upload rejected", r.status === 401, `status ${r.status}`);
}

// 2. valid PNG
let uploaded;
{
  const r = await post(form(PNG_1x1, "smoke-test.png", "image/png", "card"), cookie);
  const j = await r.json().catch(() => ({}));
  check("valid PNG accepted", r.status === 200 && typeof j.url === "string", `status ${r.status}, storage ${j.storage}`);
  uploaded = j;
  if (j.url) {
    const abs = j.url.startsWith("http") ? j.url : `${BASE}${j.url}`;
    const img = await fetch(abs);
    const ct = img.headers.get("content-type") || "";
    check("uploaded URL serves an image", img.ok && ct.startsWith("image/"), `${img.status} ${ct}`);
  }
}

// 3. text disguised as PNG
{
  const r = await post(form(Buffer.from("this is not an image"), "evil.png", "image/png"), cookie);
  check("fake image rejected", r.status === 415, `status ${r.status}`);
}

// 4. html / svg payloads
{
  const html = await post(form(Buffer.from("<html><script>alert(1)</script></html>"), "x.html", "text/html"), cookie);
  check("HTML rejected", html.status === 415, `status ${html.status}`);
  const svg = await post(
    form(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'), "x.svg", "image/svg+xml"),
    cookie,
  );
  check("SVG rejected", svg.status === 415, `status ${svg.status}`);
}

// 5. oversized
{
  const big = Buffer.alloc(17 * 1024 * 1024, 0);
  PNG_1x1.copy(big, 0);
  const r = await post(form(big, "big.png", "image/png"), cookie);
  check("oversized file rejected", r.status === 413, `status ${r.status}`);
}

// 6. no file
{
  const r = await post(new FormData(), cookie);
  check("missing file rejected", r.status === 400, `status ${r.status}`);
}

// 7 + 8. local-only checks
if (uploaded?.storage === "local" && uploaded.url) {
  const list = await fetch(`${BASE}/api/admin/media`, { headers: { cookie } });
  const data = await list.json().catch(() => ({ assets: [] }));
  const name = uploaded.url.split("/").pop();
  const found = (data.assets || []).some((a) => a.id === name);
  const variantNoise = (data.assets || []).some((a) => /-\d+w\.(webp|avif)$/i.test(a.id));
  check("asset listed in media library", found);
  check("variants hidden from media library", !variantNoise);

  const del = await fetch(`${BASE}/api/admin/upload?url=${encodeURIComponent(uploaded.url)}`, {
    method: "DELETE",
    headers: { cookie },
  });
  const delJson = await del.json().catch(() => ({}));
  check("delete succeeded", del.ok && delJson.deleted === true, `status ${del.status}`);
  const after = await fetch(`${BASE}${uploaded.url}`);
  check("file gone after delete", after.status === 404, `status ${after.status}`);
} else {
  console.log("SKIP  local-storage checks (upload went to ImageKit or failed)");
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
