

import fs from "fs";
import path from "path";

// ── Accessory detection rules (aligned with lib/accessory-types.ts) ──────────
const ACCESSORY_KEYWORDS = [
  "accessories",
  "accessory",
  "chargers-adapters",
  "charger",
  "adapter",
  "power",
  "laptop-bags-sleeves",
  "bag",
  "backpack",
  "sleeve",
  "cooling-pads-stands",
  "stand",
  "cooling pad",
  "keyboards-mice",
  "keyboard",
  "mouse",
  "cables-converters",
  "cable",
  "converter",
  "hub",
  "dock",
  "headphones-headsets",
  "headphone",
  "headset",
  "earphone",
  "webcams",
  "webcam",
  "ram-storage",
  "ram",
  "ssd",
];

function looksLikeAccessoryCategory(category = "", name = "") {
  const cat = String(category).toLowerCase().trim();
  const title = String(name).toLowerCase().trim();
  if (ACCESSORY_KEYWORDS.some((kw) => cat.includes(kw))) return true;
  if (title.includes("stand") || title.includes("hub") || title.includes("charger") || title.includes("adapter")) {
    return true;
  }
  return false;
}

// ── Data loaders ─────────────────────────────────────────────────────────────
async function loadCatalogueFromDevServer(baseUrl) {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return null;
  }

  try {
    const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) return null;

    const cookie = loginRes.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .join("; ");

    const [prodRes, accRes] = await Promise.all([
      fetch(`${baseUrl}/api/admin/products`, { headers: { cookie } }),
      fetch(`${baseUrl}/api/admin/accessories`, { headers: { cookie } }),
    ]);

    if (!prodRes.ok) return null;

    const allProds = await prodRes.json();
    const accList = accRes.ok ? await accRes.json() : [];

    // Separate laptops from accessories
    const laptops = allProds.filter((p) => !String(p.id).startsWith("acc-"));
    const accessories = [
      ...accList,
      ...allProds.filter((p) => String(p.id).startsWith("acc-")),
    ];

    // Deduplicate accessories by id
    const accMap = new Map();
    for (const a of accessories) {
      accMap.set(String(a.id), a);
    }

    return {
      source: `Live server (${baseUrl})`,
      laptops,
      accessories: Array.from(accMap.values()),
    };
  } catch {
    return null;
  }
}

function loadCatalogueFromDisk() {
  const productsFile = path.resolve("app/data/products.json");
  const accessoriesFile = path.resolve("app/data/accessories.json");

  let laptops = [];
  let accessories = [];

  if (fs.existsSync(productsFile)) {
    try {
      laptops = JSON.parse(fs.readFileSync(productsFile, "utf-8"));
    } catch (e) {
      console.warn("Could not parse products.json:", e.message);
    }
  }

  if (fs.existsSync(accessoriesFile)) {
    try {
      accessories = JSON.parse(fs.readFileSync(accessoriesFile, "utf-8"));
    } catch (e) {
      console.warn("Could not parse accessories.json:", e.message);
    }
  }

  return {
    source: "Local JSON files (seed data)",
    laptops,
    accessories,
  };
}

// ── Helpers to inspect fields consistently ───────────────────────────────────
function getPrices(item) {
  let sale = item.price;
  let market = item.salePrice ?? item.marketPrice ?? item.regularPrice ?? item.originalPrice;

  if (item.pricing) {
    if (typeof item.pricing.sale_price === "number") sale = item.pricing.sale_price;
    if (typeof item.pricing.market_price === "number") market = item.pricing.market_price;
  }

  sale = Number(sale ?? 0);
  market = market !== undefined && market !== null ? Number(market) : sale;

  return { sale, market };
}

function getStock(item) {
  if (typeof item.stock === "number") return item.stock;
  if (item.stock && typeof item.stock.quantity === "number") return item.stock.quantity;
  return 0;
}

function getImages(item) {
  if (Array.isArray(item.images)) return item.images.filter(Boolean);
  if (typeof item.image === "string" && item.image) return [item.image];
  if (typeof item.imageUrl === "string" && item.imageUrl) return [item.imageUrl];
  return [];
}

function getLaptopSpecs(item) {
  let processor = "";
  let ram = "";
  let storage = "";

  if (item.specs) {
    if (typeof item.specs === "object") {
      processor = item.specs.processor || item.specs.Processor?.["Processor Model"] || "";
      ram = item.specs.ram || item.specs.Memory?.["RAM"] || "";
      storage = item.specs.storage || item.specs.Storage?.["Storage Capacity"] || "";
    }
  }

  if (item.specGroups) {
    if (!processor) processor = item.specGroups.Processor?.["Processor Model"] || "";
    if (!ram) ram = item.specGroups.Memory?.["RAM"] || "";
    if (!storage) storage = item.specGroups.Storage?.["Storage Capacity"] || "";
  }

  return {
    processor: String(processor || "").trim(),
    ram: String(ram || "").trim(),
    storage: String(storage || "").trim(),
  };
}

// ── Main Audit Function ───────────────────────────────────────────────────────
async function run() {
  const baseUrl = process.env.TEST_URL || "http://localhost:3000";

  console.log("==================================================================");
  console.log("   LAPTOP POINT BD — READ-ONLY CATALOGUE AUDIT");
  console.log("==================================================================");

  let data = await loadCatalogueFromDevServer(baseUrl);
  if (!data) {
    console.log(`(Dev server at ${baseUrl} not reachable or credentials missing; using disk files)\n`);
    data = loadCatalogueFromDisk();
  }

  console.log(`Source: ${data.source}`);
  console.log(`Found:  ${data.laptops.length} laptop records, ${data.accessories.length} accessory records\n`);

  const { laptops, accessories } = data;

  // Track findings
  const findings = {
    emptySpecs: [],
    misfiledAccessory: [],
    saleGeMarket: [],
    discountGt60: [],
    priceLe0: [],
    stockLt0: [],
    missingImages: [],
    missingGradeCondition: [],
    duplicateLaptops: [],
    duplicateAccessories: [],
    skuInBothCatalogues: [],
  };

  // 1. SKU index maps for cross-catalogue checks
  const laptopSkus = new Map();
  for (const item of laptops) {
    const sku = String(item.sku || "").trim().toLowerCase();
    if (!sku) continue;
    if (!laptopSkus.has(sku)) laptopSkus.set(sku, []);
    laptopSkus.get(sku).push(item);
  }

  const accessorySkus = new Map();
  for (const item of accessories) {
    const sku = String(item.sku || "").trim().toLowerCase();
    if (!sku) continue;
    if (!accessorySkus.has(sku)) accessorySkus.set(sku, []);
    accessorySkus.get(sku).push(item);
  }

  // Duplicate checks
  for (const [sku, items] of laptopSkus.entries()) {
    if (items.length > 1) {
      findings.duplicateLaptops.push({
        sku,
        ids: items.map((i) => i.id).join(", "),
        names: items.map((i) => i.name).join(" | "),
      });
    }
    if (accessorySkus.has(sku)) {
      const accItems = accessorySkus.get(sku);
      findings.skuInBothCatalogues.push({
        sku,
        laptopIds: items.map((i) => i.id).join(", "),
        accessoryIds: accItems.map((i) => i.id).join(", "),
        laptopNames: items.map((i) => i.name).join(" | "),
      });
    }
  }

  for (const [sku, items] of accessorySkus.entries()) {
    if (items.length > 1) {
      findings.duplicateAccessories.push({
        sku,
        ids: items.map((i) => i.id).join(", "),
        names: items.map((i) => i.name).join(" | "),
      });
    }
  }

  // Audit Laptops
  for (const p of laptops) {
    const id = p.id;
    const sku = p.sku || "(no-sku)";
    const name = p.name || "(unnamed)";
    const { sale, market } = getPrices(p);
    const stock = getStock(p);
    const images = getImages(p);
    const { processor, ram, storage } = getLaptopSpecs(p);

    // a) Empty processor / RAM / storage
    const missingSpecs = [];
    if (!processor) missingSpecs.push("Processor");
    if (!ram) missingSpecs.push("RAM");
    if (!storage) missingSpecs.push("Storage");
    if (missingSpecs.length > 0) {
      findings.emptySpecs.push({ id, sku, name, missing: missingSpecs.join(", ") });
    }

    // b) Accessory-looking category inside laptop catalogue
    if (looksLikeAccessoryCategory(p.category, p.name)) {
      findings.misfiledAccessory.push({ id, sku, name, category: p.category });
    }

    // c) Sale >= Market
    if (market > 0 && sale >= market) {
      findings.saleGeMarket.push({ id, sku, name, sale, market });
    }

    // d) Discount > 60%
    if (market > 0 && sale < market) {
      const disc = Math.round(((market - sale) / market) * 100);
      if (disc > 60) {
        findings.discountGt60.push({ id, sku, name, sale, market, discount: `${disc}%` });
      }
    }

    // e) Price <= 0
    if (sale <= 0) {
      findings.priceLe0.push({ id, sku, name, sale });
    }

    // f) Stock < 0
    if (stock < 0) {
      findings.stockLt0.push({ id, sku, name, stock });
    }

    // g) Missing / placeholder images
    const hasOnlyPlaceholder =
      images.length === 0 ||
      images.every(
        (img) =>
          img.includes("placeholder") ||
          img.includes("placeholder-laptop.png") ||
          img.includes("placeholder-accessory.png")
      );
    if (hasOnlyPlaceholder) {
      findings.missingImages.push({ id, sku, name, imagesCount: images.length });
    }

    // h) Missing grade or condition
    const cond = p.condition || "";
    const gr = p.grade || "";
    if (!cond || !gr) {
      findings.missingGradeCondition.push({ id, sku, name, condition: cond || "(missing)", grade: gr || "(missing)" });
    }
  }

  // Audit Accessories
  for (const a of accessories) {
    const id = a.id;
    const sku = a.sku || "(no-sku)";
    const name = a.name || "(unnamed)";
    const { sale, market } = getPrices(a);
    const stock = getStock(a);
    const images = getImages(a);

    // c) Sale >= Market
    if (market > 0 && sale >= market && a.originalPrice !== undefined) {
      findings.saleGeMarket.push({ id, sku, name, sale, market, type: "accessory" });
    }

    // d) Discount > 60%
    if (market > 0 && sale < market) {
      const disc = Math.round(((market - sale) / market) * 100);
      if (disc > 60) {
        findings.discountGt60.push({ id, sku, name, sale, market, discount: `${disc}%`, type: "accessory" });
      }
    }

    // e) Price <= 0
    if (sale <= 0) {
      findings.priceLe0.push({ id, sku, name, sale, type: "accessory" });
    }

    // f) Stock < 0
    if (stock < 0) {
      findings.stockLt0.push({ id, sku, name, stock, type: "accessory" });
    }

    // g) Missing / placeholder images
    const hasOnlyPlaceholder =
      images.length === 0 ||
      images.every(
        (img) =>
          img.includes("placeholder") ||
          img.includes("placeholder-laptop.png") ||
          img.includes("placeholder-accessory.png")
      );
    if (hasOnlyPlaceholder) {
      findings.missingImages.push({ id, sku, name, imagesCount: images.length, type: "accessory" });
    }

    // h) Missing condition
    if (!a.condition) {
      findings.missingGradeCondition.push({ id, sku, name, condition: "(missing)", grade: "N/A", type: "accessory" });
    }
  }

  // ── Print Report ────────────────────────────────────────────────────────────
  function printSection(title, list, formatter) {
    console.log(`\n------------------------------------------------------------------`);
    console.log(`▶ ${title} (${list.length})`);
    console.log(`------------------------------------------------------------------`);
    if (list.length === 0) {
      console.log(`  ✓ None found (OK)`);
      return;
    }
    for (const item of list) {
      console.log(`  • ${formatter(item)}`);
    }
  }

  printSection("1. Empty Processor / RAM / Storage (Laptops)", findings.emptySpecs, (i) =>
    `[ID: ${i.id}] SKU: ${i.sku} | Missing: ${i.missing} | "${i.name}"`
  );

  printSection("2. Accessory-Looking Category Inside Laptop Catalogue", findings.misfiledAccessory, (i) =>
    `[ID: ${i.id}] SKU: ${i.sku} | Category: "${i.category}" | "${i.name}"`
  );

  printSection("3. Inverted / Equivalent Pricing (Sale >= Market Price)", findings.saleGeMarket, (i) =>
    `[ID: ${i.id}] SKU: ${i.sku} | Sale: ৳${i.sale.toLocaleString()} | Market: ৳${i.market.toLocaleString()} | "${i.name}"`
  );

  printSection("4. Steep Discount (> 60%)", findings.discountGt60, (i) =>
    `[ID: ${i.id}] SKU: ${i.sku} | -${i.discount} (Sale: ৳${i.sale.toLocaleString()} vs Market: ৳${i.market.toLocaleString()}) | "${i.name}"`
  );

  printSection("5. Invalid Price (<= 0)", findings.priceLe0, (i) =>
    `[ID: ${i.id}] SKU: ${i.sku} | Price: ৳${i.sale} | "${i.name}"`
  );

  printSection("6. Negative Stock (< 0)", findings.stockLt0, (i) =>
    `[ID: ${i.id}] SKU: ${i.sku} | Stock: ${i.stock} | "${i.name}"`
  );

  printSection("7. Missing or Placeholder Images", findings.missingImages, (i) =>
    `[ID: ${i.id}] SKU: ${i.sku} | Images: ${i.imagesCount} | "${i.name}"`
  );

  printSection("8. Missing Grade or Condition", findings.missingGradeCondition, (i) =>
    `[ID: ${i.id}] SKU: ${i.sku} | Condition: ${i.condition}, Grade: ${i.grade} | "${i.name}"`
  );

  printSection("9. Duplicate SKUs Inside Same Catalogue", [...findings.duplicateLaptops, ...findings.duplicateAccessories], (i) =>
    `SKU: "${i.sku}" | IDs: [${i.ids}] | Names: ${i.names}`
  );

  printSection("10. SKUs Present in BOTH Catalogues (Laptops AND Accessories)", findings.skuInBothCatalogues, (i) =>
    `SKU: "${i.sku}" | Laptop ID: [${i.laptopIds}] vs Accessory ID: [${i.accessoryIds}] | Name: "${i.laptopNames}"`
  );

  console.log(`\n==================================================================`);
  console.log(`AUDIT COMPLETE: ${
    Object.values(findings).reduce((acc, curr) => acc + curr.length, 0)
  } total issues flagged across 10 checks.`);
  console.log(`(This script is read-only. No records were modified.)`);
  console.log(`==================================================================\n`);
}

run().catch((err) => {
  console.error("Audit script failed with error:", err);
  process.exit(1);
});
