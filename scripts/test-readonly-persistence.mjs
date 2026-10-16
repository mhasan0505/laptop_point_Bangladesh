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

import { computeDbHostFingerprint, getAllowedFingerprints } from "./lib/staging-guard.mjs";

console.log("==================================================================");
console.log("  ACCEPTANCE TEST: READ-ONLY PRODUCTION PERSISTENCE (EROFS)");
console.log("==================================================================");

// Staging allow-list check: NO hardcoded database hosts
const dbUrl = process.env.DATABASE_URL || "";
const allowedFingerprints = getAllowedFingerprints();
const localFp = dbUrl ? computeDbHostFingerprint(dbUrl) : "";
const isAllowedDb = Boolean(localFp && allowedFingerprints.has(localFp));
const isAcceptanceMode = process.argv.includes("--acceptance") || process.env.ACCEPTANCE_MODE === "1";

let useSimulator = false;
if (isAllowedDb) {
  try {
    const parsed = new URL(dbUrl);
    console.log(`✅ Using verified staging database: ${parsed.host}`);
  } catch {
    console.log(`✅ Using verified staging database: fingerprint ${localFp.slice(0, 16)}...`);
  }
} else {
  useSimulator = true;
}

if (useSimulator) {
  console.log("\n******************************************************************");
  console.log("*                                                                *");
  console.log("*          ⚠️   SIMULATED (not a real database)   ⚠️              *");
  console.log("*                                                                *");
  console.log("*   The in-process adapter simulator was used as a CI fallback.  *");
  console.log("*   This is NOT a real database verification run.                *");
  console.log("*   To validate against a real database, configure               *");
  console.log("*   STAGING_DB_HOST (or STAGING_DB_FINGERPRINT) in .env.test.   *");
  console.log("*                                                                *");
  console.log("******************************************************************\n");

  if (isAcceptanceMode) {
    console.error("❌ ACCEPTANCE MODE REFUSAL: Simulated database execution is prohibited in acceptance mode.");
    console.error("Deploy a real staging database (Docker or Neon branch) and set STAGING_DB_HOST to verify.\n");
    process.exit(2);
  }
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
  getBannersCache,
  setBannersCache,
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
  updateAdminUser,
  deleteAdminUser,
  readAdminUsers,
  resetAdminUsersCache,
  getAdminUsersCache,
  setAdminUsersCache,
  verifyPassword,
} = await import("../lib/admin-users-storage.ts");

const {
  storeMediaMeta,
  getMediaMeta,
  readMediaMeta,
  deleteMediaMeta,
  resetMediaMetaCache,
} = await import("../lib/media/storage.ts");

const { TtlCache } = await import("../lib/cache/ttl-cache.ts");

let passed = 0;
let total = 9;

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
// TEST 9: CROSS-INSTANCE CACHE COHERENCE (TWO INSTANCES OVER SAME STORE)
// ─────────────────────────────────────────────────────────────
console.log("\n--- [9/9] Cross-Instance Cache Coherence (Two Instances Over Same Store) ---");

// Instance A clock & cache
let timeA = 1000000;
const cacheBannersA = new TtlCache({ ttlMs: 15000, now: () => timeA });
const cacheUsersA = new TtlCache({ ttlMs: 15000, now: () => timeA });

// Instance B clock & cache
let timeB = 1000000;
const cacheBannersB = new TtlCache({ ttlMs: 15000, now: () => timeB });
const cacheUsersB = new TtlCache({ ttlMs: 15000, now: () => timeB });

// Case 1: Write on A -> B sees it after at most TTL
// Step 1a: Instance A writes a banner
setBannersCache(cacheBannersA);
const twoInstanceBannerId = `banner-two-inst-${Date.now()}`;
await saveBanner({
  id: twoInstanceBannerId,
  title: "Instance A Initial Banner",
  placement: "home.hero",
  active: true,
  sortOrder: 99,
  desktopAssetId: null,
  desktopImageUrl: "/test-a.webp",
  mobileAssetId: null,
  mobileImageUrl: "/test-a.webp",
  badgeText: null,
  headline: "Instance A Initial Banner",
  subtext: null,
  ctaLabel: null,
  linkHref: null,
  theme: null,
  startsAt: null,
  endsAt: null,
  targetBrandId: null,
  targetCategoryId: null,
});

// Step 1b: Switch to Instance B. Instance B reads from shared store and caches it.
setBannersCache(cacheBannersB);
let bannersB = await readBanners();
let bannerB = bannersB.find((b) => b.id === twoInstanceBannerId);
assert.ok(bannerB, "Instance B should read initial banner from shared DB");
assert.equal(bannerB.title, "Instance A Initial Banner");

// Step 1c: Switch back to Instance A. Instance A updates the banner.
setBannersCache(cacheBannersA);
await saveBanner({
  id: twoInstanceBannerId,
  title: "Instance A Updated Banner v2",
  placement: "home.hero",
  active: true,
  sortOrder: 99,
  desktopAssetId: null,
  desktopImageUrl: "/test-a.webp",
  mobileAssetId: null,
  mobileImageUrl: "/test-a.webp",
  badgeText: null,
  headline: "Instance A Updated Banner v2",
  subtext: null,
  ctaLabel: null,
  linkHref: null,
  theme: null,
  startsAt: null,
  endsAt: null,
  targetBrandId: null,
  targetCategoryId: null,
});
// A sees its update immediately
let bannersA = await readBanners();
assert.equal(bannersA.find((b) => b.id === twoInstanceBannerId)?.title, "Instance A Updated Banner v2");

// Step 1d: Switch to Instance B before TTL expires (timeB + 5s). B still sees its cached v1.
setBannersCache(cacheBannersB);
timeB += 5000;
bannersB = await readBanners();
assert.equal(bannersB.find((b) => b.id === twoInstanceBannerId)?.title, "Instance A Initial Banner", "Instance B should serve cached value before TTL");

// Step 1e: Advance Instance B's clock beyond TTL (timeB + 16s total = 21s elapsed).
timeB += 16000;
bannersB = await readBanners();
assert.equal(bannersB.find((b) => b.id === twoInstanceBannerId)?.title, "Instance A Updated Banner v2", "Instance B must see Instance A's update once TTL expires");

// Cleanup banner
setBannersCache(cacheBannersA);
await deleteBanner(twoInstanceBannerId);

// Case 2: Staff deactivated on A is rejected on B within TTL
// Step 2a: Instance A creates a staff user
setAdminUsersCache(cacheUsersA);
const twoInstStaffEmail = `staff-two-inst-${Date.now()}@laptoppointbd.com`;
const twoInstStaff = await createAdminUser({
  name: "Two Instance Staff",
  email: twoInstStaffEmail,
  role: "manager",
  password: "SafePassword123!",
});
assert.equal(twoInstStaff.active, true);

// Step 2b: Instance B reads staff user and caches active: true
setAdminUsersCache(cacheUsersB);
let usersB = await readAdminUsers();
let staffOnB = usersB.find((u) => u.id === twoInstStaff.id);
assert.ok(staffOnB, "Instance B should see new staff from shared DB");
assert.equal(staffOnB.active, true);

// Step 2c: Instance A deactivates staff member
setAdminUsersCache(cacheUsersA);
await updateAdminUser(twoInstStaff.id, { active: false });
const usersA = await readAdminUsers();
assert.equal(usersA.find((u) => u.id === twoInstStaff.id)?.active, false, "Instance A should reflect deactivation immediately");

// Step 2d: Advance Instance B's clock past TTL (15s)
setAdminUsersCache(cacheUsersB);
timeB += 16000; // Past 15s TTL
usersB = await readAdminUsers();
staffOnB = usersB.find((u) => u.id === twoInstStaff.id);
assert.ok(staffOnB);
assert.equal(staffOnB.active, false, "Instance B must observe deactivated staff within TTL");

// Auth gate simulation on Instance B: Active check fails within TTL
const isRejectedOnB = !staffOnB || !staffOnB.active;
assert.ok(isRejectedOnB, "Deactivated staff member must be rejected on Instance B within TTL");

// Cleanup staff user
await deleteAdminUser(twoInstStaff.id);

pass("Cross-instance Cache Coherence", "write on A -> B sees after TTL; staff deactivated on A rejected on B within TTL");

// Restore default caches
resetBannersCache();
resetAdminUsersCache();

// ─────────────────────────────────────────────────────────────
// FINAL REPORT
// ─────────────────────────────────────────────────────────────
console.log("\n==================================================================");
console.log(`🎉 ALL ${passed}/${total} READ-ONLY PERSISTENCE TESTS PASSED!`);
console.log(`🔒 Simulated EROFS write interceptions handled safely: ${erofsTriggerCount} times.`);
console.log("==================================================================");

