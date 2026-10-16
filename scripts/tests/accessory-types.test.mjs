import test from "node:test";
import assert from "node:assert/strict";
import {
  ACCESSORY_CATEGORIES,
  resolveAccessoryCategorySlug,
  isAccessoryCategoryName,
} from "../../lib/accessory-types.ts";

// Names directly from lib/navigation.ts ACCESSORY_CATEGORIES
const NAVIGATION_ACCESSORY_CATEGORIES = [
  "Laptop Bag",
  "Charger & Adapter",
  "Cooling Pad",
  "Laptop Stand",
  "Laptop Skin",
  "Keyboard",
  "Mouse",
  "Monitor",
  "Webcam",
  "Audio",
  "Networking",
  "Chargers & Adapters",
  "Routers",
  "Mouse & Keyboards",
  "Laptop Bags & Sleeves",
  "Headphones & Audio",
  "Cables & Docks",
  "Stands & Cooling Pads",
  "Accessories",
];

test("isAccessoryCategoryName - every name in lib/navigation.ts ACCESSORY_CATEGORIES returns true", () => {
  for (const name of NAVIGATION_ACCESSORY_CATEGORIES) {
    const isAcc = isAccessoryCategoryName(name);
    assert.equal(
      isAcc,
      true,
      `Expected "${name}" to be recognized as an accessory category`
    );
  }
});

test("resolveAccessoryCategorySlug - every name in lib/navigation.ts resolves to a valid slug", () => {
  const validSlugs = new Set(ACCESSORY_CATEGORIES.map((c) => c.slug));

  for (const name of NAVIGATION_ACCESSORY_CATEGORIES) {
    const resolvedSlug = resolveAccessoryCategorySlug(name);
    assert.ok(
      resolvedSlug !== null,
      `Expected "${name}" to resolve to an accessory category slug`
    );
    assert.ok(
      validSlugs.has(resolvedSlug),
      `Resolved slug "${resolvedSlug}" for "${name}" must be in ACCESSORY_CATEGORIES`
    );
  }
});

test("resolveAccessoryCategorySlug - resolution precedence and trimming", () => {
  // Direct slug match
  assert.equal(resolveAccessoryCategorySlug("chargers-adapters"), "chargers-adapters");
  assert.equal(resolveAccessoryCategorySlug("batteries"), "batteries");
  assert.equal(resolveAccessoryCategorySlug("keyboards-mice"), "keyboards-mice");

  // Direct category name match
  assert.equal(resolveAccessoryCategorySlug("Chargers & Adapters"), "chargers-adapters");
  assert.equal(resolveAccessoryCategorySlug("Keyboards & Mice"), "keyboards-mice");

  // Aliases
  assert.equal(resolveAccessoryCategorySlug("Laptop Bag"), "bags-sleeves");
  assert.equal(resolveAccessoryCategorySlug("Mouse & Keyboards"), "keyboards-mice");
  assert.equal(resolveAccessoryCategorySlug("Routers"), "routers-networking");

  // Sub-category precedence over category
  assert.equal(
    resolveAccessoryCategorySlug("Accessories", "Chargers & Adapters"),
    "chargers-adapters"
  );

  // Case-insensitivity and whitespace trimming
  assert.equal(resolveAccessoryCategorySlug("   CHARGERS-ADAPTERS  "), "chargers-adapters");
  assert.equal(resolveAccessoryCategorySlug("  laptop stand  "), "other");
});

test("isAccessoryCategoryName - distinguishes laptops from accessories", () => {
  // Common laptop categories must return false
  const laptopCategories = [
    "Laptop",
    "Gaming Laptop",
    "Ultrabook",
    "Business Laptop",
    "Student Laptop",
    "Workstation",
    "2-in-1 Laptop",
    "Convertible",
  ];

  for (const lapCat of laptopCategories) {
    assert.equal(
      isAccessoryCategoryName(lapCat),
      false,
      `Laptop category "${lapCat}" should NOT be flagged as an accessory`
    );
  }

  // Edge cases
  assert.equal(isAccessoryCategoryName(""), false);
  assert.equal(isAccessoryCategoryName(null), false);
  assert.equal(isAccessoryCategoryName(undefined), false);
});
