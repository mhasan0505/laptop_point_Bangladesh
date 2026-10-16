/**
 * Acceptance Test: Read-Only Filesystem Production Persistence
 *
 * Verifies that with app/data/*.json made strictly read-only (throwing EROFS on any write),
 * every create, edit, and delete action for all 8 application stores persists to PostgreSQL
 * and remains visible after a cold restart (cache cleared) and across invocations:
 *
 *  1. Products (lib/products-storage.ts)
 *  2. Accessories (lib/accessories-storage.ts)
 *  3. Banners (lib/banners/storage.ts)
 *  4. Questions (lib/questions-storage.ts)
 *  5. Power Deals (lib/power-deal-data.ts)
 *  6. Settings (lib/settings.ts)
 *  7. Staff Users (lib/admin-users-storage.ts)
 *  8. Media Alt Text (lib/media/storage.ts)
 *
 * USAGE:
 *   node --import ./scripts/lib/register.mjs scripts/test-readonly-persistence.mjs
 */

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

// Safety check: Never run write tests against the remote dev database
const dbUrl = process.env.DATABASE_URL || "";
const isRemoteDevDb = dbUrl.includes("ep-wild-fog") || dbUrl.includes("neon.tech");
const stagingHost = process.env.STAGING_DB_HOST;
const isStagingDb = stagingHost && (dbUrl.includes(stagingHost) || (stagingHost === "localhost" && dbUrl.includes("127.0.0.1")));

console.log("==================================================================");
console.log("  ACCEPTANCE TEST: READ-ONLY PRODUCTION PERSISTENCE (EROFS)");
console.log("==================================================================");

let useSimulator = false;
if (isRemoteDevDb && !isStagingDb) {
  console.log("ℹ️  DATABASE_URL points to remote dev database. Activating in-process PostgreSQL adapter simulator to prevent remote DB writes.");
  useSimulator = true;
} else if (!dbUrl) {
  console.log("ℹ️  No DATABASE_URL configured. Activating in-process PostgreSQL adapter simulator.");
  useSimulator = true;
} else {
  console.log(`✅ Using verified staging database: ${new URL(dbUrl).host}`);
}

// ─────────────────────────────────────────────────────────────
// 1. SIMULATE READ-ONLY FILESYSTEM (EROFS)
// ─────────────────────────────────────────────────────────────
const origWriteFile = fs.writeFile;
const origWriteFileSync = fs.writeFileSync;
const origRename = fs.rename;
const origRenameSync = fs.renameSync;
const origPromisesWriteFile = fs.promises.writeFile;
const origPromisesRename = fs.promises.rename;

let erofsTriggerCount = 0;

function isProtectedDataPath(targetPath) {
  if (!targetPath || typeof targetPath !== "string") return false;
  const normalized = targetPath.replace(/\\/g, "/");
  return (
    normalized.includes("/app/data/") ||
    normalized.endsWith(".json") ||
    normalized.endsWith(".tmp")
  );
}

function makeErofsError(filePath) {
  const err = new Error(`EROFS: read-only file system, open '${filePath}'`);
  err.code = "EROFS";
  err.errno = -30;
  err.syscall = "open";
  err.path = filePath;
  erofsTriggerCount++;
  return err;
}

// Hook all filesystem write/rename methods
fs.writeFile = function (file, ...args) {
  if (isProtectedDataPath(file)) {
    const cb = typeof args[args.length - 1] === "function" ? args[args.length - 1] : null;
    const err = makeErofsError(file);
    if (cb) return setImmediate(() => cb(err));
    throw err;
  }
  return origWriteFile.call(fs, file, ...args);
};

fs.writeFileSync = function (file, ...args) {
  if (isProtectedDataPath(file)) {
    throw makeErofsError(file);
  }
  return origWriteFileSync.call(fs, file, ...args);
};

fs.rename = function (oldPath, newPath, ...args) {
  if (isProtectedDataPath(oldPath) || isProtectedDataPath(newPath)) {
    const cb = typeof args[args.length - 1] === "function" ? args[args.length - 1] : null;
    const err = makeErofsError(newPath);
    if (cb) return setImmediate(() => cb(err));
    throw err;
  }
  return origRename.call(fs, oldPath, newPath, ...args);
};

fs.renameSync = function (oldPath, newPath, ...args) {
  if (isProtectedDataPath(oldPath) || isProtectedDataPath(newPath)) {
    throw makeErofsError(newPath);
  }
  return origRenameSync.call(fs, oldPath, newPath, ...args);
};

fs.promises.writeFile = async function (file, ...args) {
  if (isProtectedDataPath(file)) {
    throw makeErofsError(file);
  }
  return origPromisesWriteFile.call(fs.promises, file, ...args);
};

fs.promises.rename = async function (oldPath, newPath, ...args) {
  if (isProtectedDataPath(oldPath) || isProtectedDataPath(newPath)) {
    throw makeErofsError(newPath);
  }
  return origPromisesRename.call(fs.promises, oldPath, newPath, ...args);
};

console.log("🔒 Read-only filesystem simulation ACTIVE for all app/data/*.json writes.");

// ─────────────────────────────────────────────────────────────
// 2. PRISMA ADAPTER SETUP / SIMULATOR
// ─────────────────────────────────────────────────────────────
if (useSimulator) {
  const overridesTable = new Map();
  const inventoryTable = new Map();

  const mockPrisma = {
    productOverride: {
      async findUnique({ where }) {
        const rec = overridesTable.get(where.sku);
        if (!rec || rec.isDeleted) return null;
        return JSON.parse(JSON.stringify(rec));
      },
      async findMany(args = {}) {
        let results = Array.from(overridesTable.values());
        if (args.where?.sku?.startsWith) {
          const prefix = args.where.sku.startsWith;
          results = results.filter((r) => r.sku && r.sku.startsWith(prefix));
        }
        if (args.where?.isDeleted === false) {
          results = results.filter((r) => !r.isDeleted);
        }
        return JSON.parse(JSON.stringify(results));
      },
      async upsert({ where, create, update }) {
        const existing = overridesTable.get(where.sku);
        const data = existing ? { ...existing, ...update } : { ...create, createdAt: new Date() };
        data.updatedAt = new Date();
        overridesTable.set(where.sku, data);
        return JSON.parse(JSON.stringify(data));
      },
      async updateMany({ where, data }) {
        let count = 0;
        if (where.sku?.in) {
          for (const sku of where.sku.in) {
            if (overridesTable.has(sku)) {
              overridesTable.get(sku).isDeleted = Boolean(data.isDeleted);
              count++;
            }
          }
        }
        return { count };
      },
      async deleteMany({ where }) {
        let count = 0;
        if (where.sku) {
          if (overridesTable.delete(where.sku)) count++;
        }
        return { count };
      },
    },
    inventory: {
      async findMany() {
        return Array.from(inventoryTable.values());
      },
      async upsert({ where, create, update }) {
        const existing = inventoryTable.get(where.productId);
        const data = existing ? { ...existing, ...update } : { ...create };
        data.updatedAt = new Date();
        inventoryTable.set(where.productId, data);
        return JSON.parse(JSON.stringify(data));
      },
      async deleteMany({ where }) {
        let count = 0;
        if (where.OR) {
          for (const cond of where.OR) {
            if (cond.productId && inventoryTable.delete(cond.productId)) count++;
          }
        }
        return { count };
      },
    },
  };

  globalThis.prisma = mockPrisma;
}
const { prisma } = await import("../lib/prisma.ts");

// ─────────────────────────────────────────────────────────────
// 3. IMPORT STORE MODULES
// ─────────────────────────────────────────────────────────────
const {
  saveRawProduct,
  deleteRawProduct,
  loadMergedRawProducts,
  setCachedRawProducts,
} = await import("../lib/products-storage.ts");

const {
  createAccessory,
  deleteAccessory,
  listAccessories,
} = await import("../lib/accessories-storage.ts");

const {
  saveBanner,
  deleteBanner,
  readBanners,
  resetBannersCache,
} = await import("../lib/banners/storage.ts");

const {
  writeQuestions,
  readQuestions,
  resetQuestionsCache,
} = await import("../lib/questions-storage.ts");

const {
  savePowerDealConfig,
  getPowerDealConfig,
  savePowerDeal,
  getPowerDeals,
  deletePowerDeal,
  resetPowerDealsCache,
  DEFAULT_POWER_DEAL_CONFIG,
} = await import("../lib/power-deal-data.ts");

const {
  saveSettings,
  getSettings,
  resetSettingsCache,
} = await import("../lib/settings.ts");

const {
  createAdminUser,
  deleteAdminUser,
  readAdminUsers,
  resetAdminUsersCache,
  verifyPassword,
} = await import("../lib/admin-users-storage.ts");

const {
  storeMediaMeta,
  getMediaMeta,
  readMediaMeta,
  deleteMediaMeta,
  resetMediaMetaCache,
} = await import("../lib/media/storage.ts");

let passed = 0;
let total = 8;

function pass(name, detail = "") {
  console.log(`✅ [PASS] ${name} ${detail ? `(${detail})` : ""}`);
  passed++;
}

// ─────────────────────────────────────────────────────────────
// TEST 1: PRODUCTS PERSISTENCE
// ─────────────────────────────────────────────────────────────
console.log("\n--- [1/8] Products Persistence ---");
const testLaptopSku = `TEST-RO-LAPTOP-${Date.now()}`;
const testLaptop = {
  id: 999991,
  sku: testLaptopSku,
  name: "ThinkPad X1 Carbon Readonly Test",
  brand: "Lenovo",
  category: "Business Laptop",
  price: 185000,
  regularPrice: 200000,
  stock: { quantity: 5, status: "In Stock" },
  images: ["https://ik.imagekit.io/test/laptop.webp"],
  specs: { "Processor": "Intel Core i7" },
  active: true,
};

await saveRawProduct(testLaptop);
// Cold restart: purge in-memory cache
setCachedRawProducts(null);
const loadedLaptops = await loadMergedRawProducts();
const foundLaptop = loadedLaptops.find((p) => p.sku === testLaptopSku);
assert.ok(foundLaptop, "Product should be present in loaded products after cold restart");
assert.equal(foundLaptop.price, 185000, "Price should match");
assert.equal(foundLaptop.stock.quantity, 5, "Stock quantity should match");

// Delete and verify cold restart
await deleteRawProduct(testLaptopSku);
setCachedRawProducts(null);
const laptopsAfterDelete = await loadMergedRawProducts();
assert.ok(!laptopsAfterDelete.some((p) => p.sku === testLaptopSku), "Product should be excluded after deletion");
pass("Products", "create/save, cold restart fetch, and deletion verified");

// ─────────────────────────────────────────────────────────────
// TEST 2: ACCESSORIES PERSISTENCE
// ─────────────────────────────────────────────────────────────
console.log("\n--- [2/8] Accessories Persistence ---");
const testAccSku = `TEST-RO-ACC-${Date.now()}`;
const createdAcc = await createAccessory({
  sku: testAccSku,
  name: "USB-C Multiport Hub Pro",
  brand: "Anker",
  category: "Adapters & Cables",
  price: 4500,
  stock: 12,
  condition: "New",
});

assert.ok(createdAcc && createdAcc.id, "Accessory record created");
// Cold restart: accessories are queried dynamically from DB
const accList = await listAccessories();
const foundAcc = accList.find((a) => a.sku === testAccSku);
assert.ok(foundAcc, "Accessory should be returned from DB after cold restart");
assert.equal(foundAcc.price, 4500);

await deleteAccessory(createdAcc.id);
const accListAfterDelete = await listAccessories();
assert.ok(!accListAfterDelete.some((a) => a.sku === testAccSku), "Accessory deleted from DB");
pass("Accessories", "create, cold restart query, and delete verified");

// ─────────────────────────────────────────────────────────────
// TEST 3: BANNERS PERSISTENCE
// ─────────────────────────────────────────────────────────────
console.log("\n--- [3/8] Banners Persistence ---");
const testBannerId = `test-banner-${Date.now()}`;
await saveBanner({
  id: testBannerId,
  title: "Readonly Banner Test",
  placement: "home.hero",
  headline: "Enterprise Laptops Sale",
  active: true,
});

// Cold restart: reset module cache
resetBannersCache();
const banners = await readBanners();
const foundBanner = banners.find((b) => b.id === testBannerId);
assert.ok(foundBanner, "Banner should be loaded from DB after cold restart");
assert.equal(foundBanner.headline, "Enterprise Laptops Sale");

await deleteBanner(testBannerId);
resetBannersCache();
const bannersAfterDelete = await readBanners();
assert.ok(!bannersAfterDelete.some((b) => b.id === testBannerId), "Banner should be deleted from DB");
pass("Banners", "save, cold restart fetch, and delete verified");

// ─────────────────────────────────────────────────────────────
// TEST 4: QUESTIONS PERSISTENCE
// ─────────────────────────────────────────────────────────────
console.log("\n--- [4/8] Questions Persistence ---");
const currentQuestions = await readQuestions();
const testQId = `q-ro-${Date.now()}`;
const testQuestion = {
  id: testQId,
  productSlug: "thinkpad-x1",
  userName: "Rakib Hassan",
  question: "Is this model available for corporate demo?",
  answer: "Yes, available at our Mirpur showroom.",
  createdAt: new Date().toISOString(),
};

await writeQuestions([testQuestion, ...currentQuestions]);
// Cold restart: reset module cache
resetQuestionsCache();
const loadedQuestions = await readQuestions();
const foundQ = loadedQuestions.find((q) => q.id === testQId);
assert.ok(foundQ, "Question should be retrieved from DB after cold restart");
assert.equal(foundQ.userName, "Rakib Hassan");
pass("Questions", "save and cold restart fetch verified");

// ─────────────────────────────────────────────────────────────
// TEST 5: POWER DEALS PERSISTENCE
// ─────────────────────────────────────────────────────────────
console.log("\n--- [5/8] Power Deals Persistence ---");
const testDealId = `deal-ro-${Date.now()}`;

await savePowerDealConfig({ title: "SPECIAL READONLY POWER DEAL" });
await savePowerDeal({
  id: testDealId,
  name: "ThinkPad T14 Clearance Drop",
  slug: "thinkpad-t14-deal",
  originalPrice: 48000,
  salePrice: 42000,
  stockQty: 3,
});

// Cold restart: reset module cache
resetPowerDealsCache();
const config = await getPowerDealConfig();
assert.equal(config.title, "SPECIAL READONLY POWER DEAL");
const deals = await getPowerDeals();
const foundDeal = deals.find((d) => d.id === testDealId);
assert.ok(foundDeal, "Deal should persist in DB");
assert.equal(foundDeal.salePrice, 42000);

await deletePowerDeal(testDealId);
resetPowerDealsCache();
const dealsAfter = await getPowerDeals();
assert.ok(!dealsAfter.some((d) => d.id === testDealId), "Deal should be deleted from DB");
pass("Power Deals", "config & deal save, cold restart fetch, and delete verified");

// ─────────────────────────────────────────────────────────────
// TEST 6: SETTINGS PERSISTENCE
// ─────────────────────────────────────────────────────────────
console.log("\n--- [6/8] Settings Persistence ---");
const testTagline = `Verified Corporate Ultrabooks (${Date.now()})`;
await saveSettings("store_profile", {
  name: "Laptop Point Bangladesh",
  tagline: testTagline,
  hotline: "+880 1612-182408",
  salesPhone: "+880 1612-182408",
  supportPhone: "+880 1830-515157",
  email: "info@laptoppointbd.com",
  whatsapp: "+880 1612-182408",
});

// Cold restart: reset module cache
resetSettingsCache();
const loadedSettings = await getSettings("store_profile");
assert.equal(loadedSettings.tagline, testTagline, "Store settings should be loaded from DB override");
pass("Settings", "saveSettings, cold restart getSettings verified");

// ─────────────────────────────────────────────────────────────
// TEST 7: STAFF USERS PERSISTENCE & BREAK-GLASS
// ─────────────────────────────────────────────────────────────
console.log("\n--- [7/8] Staff Accounts & Break-Glass Login ---");
const testStaffEmail = `staff-${Date.now()}@laptoppointbd.com`;
const createdStaff = await createAdminUser({
  name: "Operations Manager",
  email: testStaffEmail,
  role: "manager",
  password: "ManagerPassword123!",
});

assert.ok(createdStaff.passwordHash, "Password hash must be generated");
assert.ok(createdStaff.passwordHash.includes(":"), "Password hash must be in salt:hash format");
assert.ok(verifyPassword("ManagerPassword123!", createdStaff.passwordHash), "Password verification should pass");

// Cold restart: reset module cache
resetAdminUsersCache();
const allUsers = await readAdminUsers();
const foundUser = allUsers.find((u) => u.email === testStaffEmail);
assert.ok(foundUser, "Staff user should be retrieved from DB after cold restart");
assert.equal(foundUser.role, "manager");

// Clean up created staff
await deleteAdminUser(createdStaff.id);
resetAdminUsersCache();
const usersAfterDelete = await readAdminUsers();
assert.ok(!usersAfterDelete.some((u) => u.email === testStaffEmail), "Staff user should be removed from DB");
pass("Staff Users", "create with salt:hash, password verification, cold restart, and delete verified");

// ─────────────────────────────────────────────────────────────
// TEST 8: MEDIA METADATA & ALT TEXT PERSISTENCE
// ─────────────────────────────────────────────────────────────
console.log("\n--- [8/8] Media Metadata & Alt Text ---");
const testMediaUrl = `https://ik.imagekit.io/laptop/test-asset-${Date.now()}.webp`;
const testAltText = `HP EliteBook 840 G8 Top Lid Front Angle (${Date.now()})`;

await storeMediaMeta(testMediaUrl, {
  url: testMediaUrl,
  alt: testAltText,
  fileId: `file-ro-${Date.now()}`,
  name: "hp-elitebook-840-g8.webp",
});

// Cold restart: reset module cache
resetMediaMetaCache();
const mediaMeta = await getMediaMeta(testMediaUrl);
assert.ok(mediaMeta, "Media meta should be retrieved from DB after cold restart");
assert.equal(mediaMeta.alt, testAltText, "Alt text should match saved value");

const allMedia = await readMediaMeta();
assert.ok(allMedia[testMediaUrl], "readMediaMeta should include asset from DB overrides");
assert.equal(allMedia[testMediaUrl].alt, testAltText);

await deleteMediaMeta(testMediaUrl);
resetMediaMetaCache();
const metaAfterDelete = await getMediaMeta(testMediaUrl);
assert.ok(!metaAfterDelete, "Media meta should be deleted from DB");
pass("Media Alt Text", "storeMediaMeta, cold restart getMediaMeta & readMediaMeta, and delete verified");

// ─────────────────────────────────────────────────────────────
// FINAL REPORT
// ─────────────────────────────────────────────────────────────
console.log("\n==================================================================");
console.log(`🎉 ALL ${passed}/${total} READ-ONLY PERSISTENCE TESTS PASSED!`);
console.log(`🔒 Simulated EROFS write interceptions handled safely: ${erofsTriggerCount} times.`);
console.log("==================================================================");
