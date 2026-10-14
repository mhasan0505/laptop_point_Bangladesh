// Catalogue creation smoke test. Run it yourself against a LOCAL dev server:
//
//   node --env-file=.env.local scripts/test-catalog-create.mjs
//
// Needs ADMIN_EMAIL / ADMIN_PASSWORD in the environment.
// It creates ONE accessory and ONE laptop with throwaway SKUs, checks that they
// appear on the storefront, exercises validation (duplicate SKU, bad price),
// then deletes both. It never places an order.
//
// Side effect to know about: deleting a laptop leaves a soft-deleted override
// row, so its numeric id is consumed (this is intentional; ids are not reused).

const BASE = process.env.TEST_URL || "http://localhost:3000";
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("ERROR: ADMIN_EMAIL / ADMIN_PASSWORD are not set in the environment.");
  process.exit(1);
}
if (!/localhost|127\.0\.0\.1/.test(BASE)) {
  console.error(`Refusing to run against non-local URL: ${BASE}`);
  process.exit(1);
}

let passed = 0;
let failed = 0;
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? `  — ${extra}` : ""}`);
  ok ? passed++ : failed++;
};

const login = await fetch(`${BASE}/api/admin/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
});
if (!login.ok) {
  console.error(`Login failed (${login.status}). Aborting.`);
  process.exit(1);
}
const cookie = login.headers
  .getSetCookie()
  .map((c) => c.split(";")[0])
  .join("; ");

const api = (path, init = {}) =>
  fetch(`${BASE}${path}`, {
    ...init,
    headers: { "content-type": "application/json", cookie, ...(init.headers || {}) },
  });

const stamp = Date.now().toString(36).toUpperCase();

// ── Accessory ───────────────────────────────────────────────────────────────
const accSku = `TEST-ACC-${stamp}`;
const accBody = {
  name: `Test Charger ${stamp}`,
  sku: accSku,
  brand: "TestBrand",
  category: "chargers-adapters",
  price: 1500,
  originalPrice: 2000,
  stock: 3,
  compatibility: "Test Laptop A\nTest Laptop B",
  specs: "65W\nUSB-C",
  active: true,
};

let acc;
{
  const r = await api("/api/admin/accessories", { method: "POST", body: JSON.stringify(accBody) });
  acc = await r.json().catch(() => ({}));
  check("accessory created", r.status === 201 && acc.id, `status ${r.status}`);
}
{
  const r = await api("/api/admin/accessories", { method: "POST", body: JSON.stringify(accBody) });
  check("duplicate accessory SKU rejected (409)", r.status === 409, `status ${r.status}`);
}
{
  const r = await api("/api/admin/accessories", {
    method: "POST",
    body: JSON.stringify({ ...accBody, sku: `${accSku}-B`, price: -5 }),
  });
  check("negative price rejected (400)", r.status === 400, `status ${r.status}`);
}
{
  const list = await (await fetch(`${BASE}/api/accessories`)).json();
  check("accessory visible in public API", Array.isArray(list) && list.some((a) => a.sku === accSku));
  const page = await fetch(`${BASE}/accessories/${acc.slug}`);
  check("accessory detail page renders", page.status === 200, `status ${page.status}`);
  const hub = await (await fetch(`${BASE}/accessories?q=${encodeURIComponent(accBody.name)}`)).text();
  check("accessory listed on /accessories", hub.includes(accBody.name));
}
{
  const r = await api(`/api/admin/accessories/${acc.id}`, {
    method: "PUT",
    body: JSON.stringify({ active: false }),
  });
  check("accessory can be hidden", r.ok, `status ${r.status}`);
  const list = await (await fetch(`${BASE}/api/accessories`)).json();
  check("hidden accessory not in public API", !list.some((a) => a.sku === accSku));
}

// ── Laptop ──────────────────────────────────────────────────────────────────
const lapSku = `TEST-LAP-${stamp}`;
const lapBody = {
  name: `Test Laptop ${stamp}`,
  sku: lapSku,
  brand: "TestBrand",
  model: "T-1",
  category: "Laptop",
  condition: "Used",
  grade: "A",
  price: 30000,
  salePrice: 35000,
  stock: 2,
  stockStatus: "In Stock",
  status: "Active",
  specs: { processor: "Core i5", ram: "8GB", storage: "256GB SSD" },
  images: ["/Hero_Image.png"],
};
let lap;
{
  const r = await api("/api/admin/products", { method: "POST", body: JSON.stringify(lapBody) });
  lap = await r.json().catch(() => ({}));
  check("laptop created", r.status === 201 && lap.id, `status ${r.status}${lap.error ? " " + lap.error : ""}`);
}
{
  const r = await api("/api/admin/products", { method: "POST", body: JSON.stringify(lapBody) });
  check("duplicate laptop SKU rejected (409)", r.status === 409, `status ${r.status}`);
  const bad = await api("/api/admin/products", {
    method: "POST",
    body: JSON.stringify({ ...lapBody, sku: `${lapSku}-B`, price: 0 }),
  });
  check("zero price rejected (400)", bad.status === 400, `status ${bad.status}`);
}
{
  const list = await (await fetch(`${BASE}/api/products`)).json();
  check("laptop visible in public API", Array.isArray(list) && list.some((p) => p.sku === lapSku));
}

// ── Cleanup ─────────────────────────────────────────────────────────────────
if (acc?.id) {
  const r = await api(`/api/admin/accessories/${acc.id}`, { method: "DELETE" });
  check("accessory deleted", r.ok, `status ${r.status}`);
}
if (lap?.id) {
  const r = await api(`/api/admin/products/${lap.id}`, { method: "DELETE" });
  check("laptop deleted", r.ok, `status ${r.status}`);
  const list = await (await fetch(`${BASE}/api/products`)).json();
  check("deleted laptop gone from public API", !list.some((p) => p.sku === lapSku));
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
