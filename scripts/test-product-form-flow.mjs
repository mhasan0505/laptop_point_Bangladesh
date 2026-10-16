// End-to-end test of what the admin "Add Product" form actually sends.
// Run yourself against a LOCAL dev server:
//
//   node --env-file=.env.local scripts/test-product-form-flow.mjs
//
// Covers:
//   - accessory created from the product form lands in the accessories catalogue
//     (visible on /api/accessories and /accessories?category=…)
//   - laptop created with grouped specs keeps them (flat fields derived, edit round-trips)
//   - YouTube link is saved, rejected when invalid, and rendered on the product page
//   - Draft products are hidden from the storefront
//   - changing a laptop's category to an accessory category moves it
// All records use throwaway SKUs and are deleted at the end. No orders are placed.

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
const pub = async (path) => (await fetch(`${BASE}${path}`)).json();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const stamp = Date.now().toString(36).toUpperCase();
const YT_ID = "dQw4w9WgXcQ";
const created = [];

const baseForm = {
  brand: "TestBrand",
  model: "T-1",
  currency: "BDT",
  taxIncluded: true,
  stockStatus: "In Stock",
  lowStockThreshold: 5,
  status: "Active",
  featured: false,
  tags: ["test"],
  features: [],
  images: ["/Hero_Image.png"],
};

// ── 1. Accessory via the product form ───────────────────────────────────────
const accSku = `TEST-FORM-ACC-${stamp}`;
const accName = `Form Charger ${stamp}`;
{
  const r = await api("/api/admin/products", {
    method: "POST",
    body: JSON.stringify({
      ...baseForm,
      name: accName,
      sku: accSku,
      category: "Accessories",
      condition: "New",
      price: 1800,
      salePrice: 2400,
      stock: 4,
      specs: {
        General: { "Sub-Category": "Chargers & Adapters" },
        "Peripherals & Accessories": {
          "Connectivity & Interface": "USB Type-C",
          "Key Specifications / Layout": "65W, GaN",
          "Compatible With": "Dell Latitude 5420\nHP EliteBook 840 G8",
        },
      },
      warranty: { period: "6 Months" },
      youtubeUrl: `https://youtu.be/${YT_ID}`,
    }),
  });
  const j = await r.json().catch(() => ({}));
  check("accessory created from product form", r.status === 201 && String(j.id).startsWith("acc-"), `status ${r.status} id ${j.id}`);
  if (j.id) created.push(j.id);

  await sleep(500);
  const list = await pub("/api/accessories");
  const found = Array.isArray(list) ? list.find((a) => a.sku === accSku) : null;
  check("accessory appears in public /api/accessories", Boolean(found));
  check("accessory is in the 'Chargers & Adapters' category", found?.category === "chargers-adapters", found?.category);
  check("accessory keeps compatibility list", found?.compatibility?.length === 2);
  check("accessory keeps YouTube link", Boolean(found?.youtubeUrl));
  check("accessory keeps 6 Months warranty", found?.warranty === "6 Months", found?.warranty);

  const page = await (await fetch(`${BASE}/accessories?category=chargers-adapters&q=${encodeURIComponent(accName)}`)).text();
  check("accessory listed on /accessories?category=chargers-adapters", page.includes(accName));

  const detail = found ? await (await fetch(`${BASE}/accessories/${found.slug}`)).text() : "";
  check("accessory page shows the video", detail.includes(YT_ID));

  // Not in the laptop catalogue
  const laptops = await pub("/api/products");
  check("accessory is NOT in the laptop catalogue", !laptops.some((p) => p.sku === accSku));

  // Edit round trip
  if (j.id) {
    const back = await (await api(`/api/admin/products/${encodeURIComponent(j.id)}`)).json();
    check(
      "accessory edit form gets its fields back",
      back?.specs?.["Peripherals & Accessories"]?.["Compatible With"]?.includes("Dell Latitude 5420") &&
        back?.specs?.General?.["Sub-Category"] === "Chargers & Adapters",
    );
  }
}

// ── 2. Laptop with grouped specs + YouTube ──────────────────────────────────
const lapSku = `TEST-FORM-LAP-${stamp}`;
const lapName = `Form Laptop ${stamp}`;
let lap;
{
  const specs = {
    Processor: { "Processor Brand": "Intel", "Processor Model": "Core i7-1165G7" },
    Memory: { RAM: "16GB", "RAM Type": "DDR4" },
    Storage: { "Storage Capacity": "512GB", "Storage Type": "NVMe SSD" },
    Display: { "Display Size": "14 inch", "Display Resolution": "1920 x 1080" },
    General: { "Sub-Category": "Business", Series: "TestSeries" },
  };
  const payload = {
    ...baseForm,
    name: lapName,
    sku: lapSku,
    category: "Laptop",
    condition: "Used",
    grade: "A",
    price: 42000,
    salePrice: 50000,
    stock: 3,
    specs,
    youtubeUrl: `https://www.youtube.com/watch?v=${YT_ID}&t=30s`,
    warranty: { period: "1 Year", type: "Shop warranty" },
  };

  const bad = await api("/api/admin/products", {
    method: "POST",
    body: JSON.stringify({ ...payload, sku: `${lapSku}-BAD`, youtubeUrl: "https://example.com/not-youtube" }),
  });
  check("invalid YouTube link rejected (400)", bad.status === 400, `status ${bad.status}`);

  const r = await api("/api/admin/products", { method: "POST", body: JSON.stringify(payload) });
  lap = await r.json().catch(() => ({}));
  check("laptop created from product form", r.status === 201 && lap.id, `status ${r.status}${lap.error ? " " + lap.error : ""}`);
  if (lap.id) created.push(String(lap.id));

  await sleep(500);
  const products = await pub("/api/products");
  const found = products.find((p) => p.sku === lapSku);
  check("laptop visible in public catalogue", Boolean(found));
  check("flat specs derived from grouped specs (card chips)", found?.specs?.processor?.includes("i7") && found?.specs?.ram?.includes("16GB"), JSON.stringify(found?.specs && { p: found.specs.processor, r: found.specs.ram, s: found.specs.storage }));
  check("grouped specs reach the storefront", found?.specGroups?.Processor?.["Processor Model"] === "Core i7-1165G7");
  check("YouTube link reaches the storefront", Boolean(found?.youtubeUrl));
  check("warranty reaches the storefront", found?.warranty === "1 Year Shop warranty", found?.warranty);

  if (found?.slug) {
    const html = await (await fetch(`${BASE}/product/${found.slug}`)).text();
    check("product page renders the video section", html.includes("Product Video") && html.includes(YT_ID));
    check("product page shows entered specs, not invented ones", html.includes("Core i7-1165G7"));
  }

  const back = await (await api(`/api/admin/products/${lap.id}`)).json();
  check("edit form gets grouped specs back", back?.specs?.Memory?.RAM === "16GB" && back?.specs?.Processor?.["Processor Model"] === "Core i7-1165G7");
  check("edit form gets YouTube link back", Boolean(back?.youtubeUrl));
  check("edit form gets tags and warranty back", back?.tags?.includes("test") && back?.warranty?.period === "1 Year");
}

// ── 3. Draft is hidden ──────────────────────────────────────────────────────
if (lap?.id) {
  const r = await api(`/api/admin/products/${lap.id}`, { method: "PUT", body: JSON.stringify({ status: "Draft" }) });
  check("laptop can be set to Draft", r.ok, `status ${r.status}`);
  await sleep(500);
  const products = await pub("/api/products");
  check("Draft laptop hidden from storefront", !products.some((p) => p.sku === lapSku));
  await api(`/api/admin/products/${lap.id}`, { method: "PUT", body: JSON.stringify({ status: "Active" }) });
}

// ── 4. Category change moves it between catalogues ──────────────────────────
if (lap?.id) {
  const r = await api(`/api/admin/products/${lap.id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...(await (await api(`/api/admin/products/${lap.id}`)).json()),
      category: "Accessories",
      specs: { General: { "Sub-Category": "Keyboards & Mice" } },
    }),
  });
  const j = await r.json().catch(() => ({}));
  check("laptop moved to accessories when category changes", r.ok && String(j.id).startsWith("acc-"), `status ${r.status} id ${j.id}`);
  if (j.id) {
    created.splice(created.indexOf(String(lap.id)), 1);
    created.push(j.id);
  }
  await sleep(500);
  const products = await pub("/api/products");
  check("moved item left the laptop catalogue", !products.some((p) => p.sku === lapSku));
}

// ── Cleanup ─────────────────────────────────────────────────────────────────
for (const id of created) {
  const r = await api(`/api/admin/products/${encodeURIComponent(id)}`, { method: "DELETE" });
  check(`cleanup: deleted ${id}`, r.ok, `status ${r.status}`);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
