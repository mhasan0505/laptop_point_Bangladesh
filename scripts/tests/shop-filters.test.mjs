import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  canonicalizeBrand,
  computeFilterFacets,
  EMPTY_FILTERS,
  filterProducts,
  getActiveFilterCount,
  matchesCategory,
  normalizeSortBy,
} from "../../lib/product-filter.ts";
import { resolveAccessoryCategorySlug } from "../../lib/accessory-types.ts";

const productsPath = path.join(process.cwd(), "app", "data", "products.json");
const rawProducts = JSON.parse(fs.readFileSync(productsPath, "utf8"));
const asText = (v) =>
  typeof v === "string"
    ? v
    : v && typeof v === "object"
      ? Object.values(v).filter(Boolean).join(" ")
      : "";

const products = rawProducts.map((item, idx) => ({
  id: item.id ?? idx + 1,
  name: item.name ?? "",
  brand: item.brand ?? "",
  price: Number(item.sale_price ?? item.price ?? 0),
  originalPrice: Number(item.market_price ?? item.originalPrice ?? 0),
  discount: Number(item.discount ?? 0),
  rating: Number(item.rating ?? 0),
  reviews: Number(item.reviews ?? 0),
  inStock: item.inStock ?? true,
  category: item.category ?? "",
  slug: item.slug ?? `laptop-${idx}`,
  image: item.image ?? "",
  specs: {
    processor: asText(item.specs?.processor ?? item.processor),
    ram: asText(item.specs?.ram ?? item.ram),
    storage: asText(item.specs?.storage ?? item.storage),
    display: asText(item.specs?.display ?? item.display),
    graphics: asText(item.specs?.graphics ?? item.graphics),
    os: asText(item.specs?.os ?? item.os),
  },
  features: item.features ?? [],
  description: item.description ?? { short: "", full: "" },
}));

test("canonicalizeBrand maps mixed-case URL params to sidebar brand labels", () => {
  assert.equal(canonicalizeBrand("Asus"), "ASUS");
  assert.equal(canonicalizeBrand("asus"), "ASUS");
  assert.equal(canonicalizeBrand("hp"), "HP");
  assert.equal(canonicalizeBrand("dell"), "Dell");
  assert.equal(canonicalizeBrand("Lenovo"), "Lenovo");
  assert.equal(canonicalizeBrand("microsoft"), "Microsoft");
  assert.equal(canonicalizeBrand("acer"), "Acer");
});

test("normalizeSortBy maps nav aliases to supported sort values", () => {
  assert.equal(normalizeSortBy("new"), "newest");
  assert.equal(normalizeSortBy("newest"), "newest");
  assert.equal(normalizeSortBy("best-selling"), "best-selling");
  assert.equal(normalizeSortBy("discount"), "discount");
  assert.equal(normalizeSortBy("price-asc"), "price-asc");
  assert.equal(normalizeSortBy("price-desc"), "price-desc");
  assert.equal(normalizeSortBy("unknown"), "featured");
});

test("matchesCategory resolves Laptop, Ultrabook, Workstation, Convertible 2-in-1, Gaming, and budget", () => {
  const allLaptops = filterProducts(products, {
    ...EMPTY_FILTERS,
    categories: ["Laptop"],
  });
  assert.equal(allLaptops.length, products.length);

  const lowerLaptops = filterProducts(products, {
    ...EMPTY_FILTERS,
    categories: ["laptop"],
  });
  assert.equal(lowerLaptops.length, products.length);

  const ultrabooks = filterProducts(products, {
    ...EMPTY_FILTERS,
    categories: ["Ultrabook"],
  });
  assert.ok(ultrabooks.length > 0);

  const workstations = filterProducts(products, {
    ...EMPTY_FILTERS,
    categories: ["Workstation"],
  });
  assert.ok(workstations.length > 0);

  const convertibles = filterProducts(products, {
    ...EMPTY_FILTERS,
    categories: ["Convertible 2-in-1"],
  });
  assert.ok(convertibles.length > 0);

  const gaming = filterProducts(products, {
    ...EMPTY_FILTERS,
    categories: ["Gaming"],
  });
  const gamingSlug = filterProducts(products, {
    ...EMPTY_FILTERS,
    categories: ["gaming-laptops"],
  });
  assert.ok(gaming.length > 0);
  assert.equal(gaming.length, gamingSlug.length);

  const budget = filterProducts(products, {
    ...EMPTY_FILTERS,
    categories: ["budget"],
  });
  assert.ok(budget.length > 0);
  assert.ok(budget.every((p) => p.price <= 35000));

  assert.equal(
    products.some((p) => matchesCategory(p, "tablets")),
    false,
  );
});

test("brand filters match catalog brands case-insensitively", () => {
  const hp = filterProducts(products, { ...EMPTY_FILTERS, brands: ["HP"] });
  const hpLower = filterProducts(products, { ...EMPTY_FILTERS, brands: ["hp"] });
  const dell = filterProducts(products, { ...EMPTY_FILTERS, brands: ["Dell"] });
  assert.ok(hp.length > 0);
  assert.equal(hp.length, hpLower.length);
  assert.ok(dell.length > 0);
});

test("getActiveFilterCount and computeFilterFacets account for categories", () => {
  assert.equal(
    getActiveFilterCount({ ...EMPTY_FILTERS, categories: ["Workstation"] }),
    1,
  );

  const facets = computeFilterFacets(products, {
    ...EMPTY_FILTERS,
    categories: ["Workstation"],
  });
  const brandTotal = facets.brands.reduce((sum, b) => sum + b.count, 0);
  assert.ok(brandTotal > 0 && brandTotal < products.length);
});

test("accessory category alias links resolve to canonical slugs", () => {
  assert.equal(resolveAccessoryCategorySlug("chargers-adapters"), "chargers-adapters");
  assert.equal(resolveAccessoryCategorySlug("Charger & Adapter"), "chargers-adapters");
  assert.equal(resolveAccessoryCategorySlug("Keyboard"), "keyboards-mice");
  assert.equal(resolveAccessoryCategorySlug("Mouse"), "keyboards-mice");
  assert.equal(resolveAccessoryCategorySlug("Laptop Bag"), "bags-sleeves");
  assert.equal(resolveAccessoryCategorySlug("Monitor"), "other");
  assert.equal(resolveAccessoryCategorySlug("Audio"), "other");
  assert.equal(resolveAccessoryCategorySlug("Laptop Stand"), "other");
});
