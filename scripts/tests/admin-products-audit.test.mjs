import test from "node:test";
import assert from "node:assert/strict";

await import("../lib/register.mjs");

const {
  rawToAdminProduct,
  adminToRawProduct,
  validateAdminProductPayload,
} = await import("../../app/api/admin/products/route.ts");
const { mapRawToProduct } = await import("../../app/data/data.ts");
const { resolveProductImages } = await import("../../lib/products-storage.ts");

test("rawToAdminProduct omits marketPrice/salePrice when there is no active discount", () => {
  const admin = rawToAdminProduct({
    id: 1,
    sku: "HP-440G3-001",
    name: "HP ProBook 440 G3",
    brand: "HP",
    pricing: {
      currency: "BDT",
      sale_price: 45000,
      market_price: 45000,
      discount_percentage: 0,
      tax_included: true,
    },
    stock: { status: "In Stock", quantity: 5 },
    specs: {
      processor: "i5",
      ram: "8GB",
      storage: "256GB",
      display: { size: "14", resolution: "HD", type: "LED", touchscreen: false },
      graphics: "Intel HD",
      ports: [],
      weight: "1.6kg",
      os: "Windows 10",
    },
    description: { short: "Short", full: "Full" },
    features: [],
    images: ["/uploads/new.webp"],
  });

  assert.equal(admin.price, 45000);
  assert.equal(admin.marketPrice, undefined);
  assert.equal(admin.regularPrice, undefined);
  assert.equal(admin.salePrice, undefined);
});

test("rawToAdminProduct preserves marketPrice when there is an active discount", () => {
  const admin = rawToAdminProduct({
    id: 2,
    sku: "HP-840G6-001",
    name: "HP EliteBook 840 G6",
    brand: "HP",
    pricing: {
      currency: "BDT",
      sale_price: 40000,
      market_price: 48000,
      discount_percentage: 17,
      tax_included: true,
    },
    stock: { status: "In Stock", quantity: 5 },
    specs: {
      processor: "i5",
      ram: "8GB",
      storage: "256GB",
      display: { size: "14", resolution: "FHD", type: "IPS", touchscreen: false },
      graphics: "Intel UHD",
      ports: [],
      weight: "1.5kg",
      os: "Windows 11",
    },
    description: { short: "Short", full: "Full" },
    features: [],
    images: ["/uploads/new.webp"],
  });

  assert.equal(admin.price, 40000);
  assert.equal(admin.marketPrice, 48000);
  assert.equal(admin.regularPrice, 48000);
  assert.equal(admin.salePrice, 48000);
});

test("adminToRawProduct clears market_price to sale_price when marketPrice is null", () => {
  const raw = adminToRawProduct(
    {
      name: "Test Laptop",
      brand: "Dell",
      category: "Laptop",
      sku: "DELL-TEST-1",
      price: 42000,
      marketPrice: null,
      regularPrice: null,
      salePrice: null,
      stock: 3,
      status: "Active",
      images: ["https://ik.imagekit.io/demo/updated.webp"],
    },
    999,
  );

  assert.equal(raw.pricing.sale_price, 42000);
  assert.equal(raw.pricing.market_price, 42000);
  assert.equal(raw.pricing.discount_percentage, 0);
});

test("validateAdminProductPayload allows price 0 (Call For Price) and rejects negative price", () => {
  assert.equal(validateAdminProductPayload({ price: 0, stock: 1, sku: "TEST-SKU-1" }), null);
  assert.match(
    validateAdminProductPayload({ price: -100, stock: 1, sku: "TEST-SKU-1" }) ?? "",
    /non-negative/i,
  );
});

test("mapRawToProduct prioritizes updated raw.images over static product-image-manifest.json", () => {
  const mapped = mapRawToProduct({
    id: 1,
    sku: "HP-440G3-001",
    name: "HP ProBook 440 G3",
    brand: "HP",
    pricing: {
      currency: "BDT",
      sale_price: 21000,
      market_price: 21000,
      discount_percentage: 0,
      tax_included: true,
    },
    stock: { status: "In Stock", quantity: 7 },
    specs: {
      processor: "i5",
      ram: "8GB",
      storage: "256GB",
      display: { size: "14", resolution: "HD", type: "LED", touchscreen: false },
      graphics: "Intel HD",
      ports: [],
      weight: "1.68kg",
      os: "Windows 10",
    },
    description: { short: "Short", full: "Full" },
    features: [],
    images: ["https://ik.imagekit.io/demo/custom-1.webp", "https://ik.imagekit.io/demo/custom-2.webp"],
  });

  assert.deepEqual(mapped.images, [
    "https://ik.imagekit.io/demo/custom-1.webp",
    "https://ik.imagekit.io/demo/custom-2.webp",
  ]);
  assert.equal(mapped.image, "https://ik.imagekit.io/demo/custom-1.webp");
});

test("resolveProductImages keeps non-placeholder /images/ paths and skips placeholder paths", () => {
  const withCustom = resolveProductImages({
    id: 1,
    sku: "HP-440G3-001",
    name: "HP",
    brand: "HP",
    pricing: { currency: "BDT", sale_price: 21000, market_price: 21000, discount_percentage: 0, tax_included: true },
    stock: { status: "In Stock", quantity: 1 },
    specs: { processor: "", ram: "", storage: "", display: { size: "", resolution: "", type: "", touchscreen: false }, graphics: "", ports: [], weight: "", os: "" },
    description: { short: "", full: "" },
    features: [],
    images: ["/images/custom-laptop.webp"],
  });
  assert.deepEqual(withCustom, ["/images/custom-laptop.webp"]);

  const withOnlyPlaceholder = resolveProductImages({
    id: 1,
    sku: "HP-440G3-001",
    name: "HP",
    brand: "HP",
    pricing: { currency: "BDT", sale_price: 21000, market_price: 21000, discount_percentage: 0, tax_included: true },
    stock: { status: "In Stock", quantity: 1 },
    specs: { processor: "", ram: "", storage: "", display: { size: "", resolution: "", type: "", touchscreen: false }, graphics: "", ports: [], weight: "", os: "" },
    description: { short: "", full: "" },
    features: [],
    images: ["/images/placeholder-laptop.png"],
  });
  assert.notDeepEqual(withOnlyPlaceholder, ["/images/placeholder-laptop.png"]);
});
