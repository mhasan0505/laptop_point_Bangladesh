import productsRaw from "@/app/data/products.json";
import imageManifest from "@/app/data/product-image-manifest.json";
import { prisma } from "@/lib/prisma";
import type { RawProduct } from "@/types/raw-product";
import { promises as fs } from "fs";
import path from "path";

const productsFilePath = path.join(process.cwd(), "app", "data", "products.json");
const manifestFilePath = path.join(process.cwd(), "app", "data", "product-image-manifest.json");
const manifest = imageManifest as Record<string, string[]>;

/**
 * Load raw products from local JSON file if possible, falling back to bundled JSON.
 */
export async function loadBaseProductsJson(): Promise<RawProduct[]> {
  try {
    const raw = await fs.readFile(productsFilePath, "utf-8");
    return JSON.parse(raw) as RawProduct[];
  } catch (error) {
    return (productsRaw as RawProduct[]) || [];
  }
}

/**
 * Write JSON via temp file + rename so concurrent readers (and the dev
 * bundler, which imports products.json) never observe a half-written file.
 */
async function writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
  const tmp = `${filePath}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tmp, filePath);
}

import { TtlCache } from "@/lib/cache/ttl-cache";

const productsCache = new TtlCache<RawProduct[]>();

export function getCachedRawProducts(): RawProduct[] | null {
  return productsCache.get();
}

export function setCachedRawProducts(products: RawProduct[]): void {
  productsCache.set(products);
}

export function resetCachedRawProducts(): void {
  productsCache.invalidate();
}


/**
 * Load products with PostgreSQL overrides applied (merged with live Inventory stock).
 */
export async function loadMergedRawProducts(): Promise<RawProduct[]> {
  const baseProducts = await loadBaseProductsJson();
  const productMap = new Map<string, RawProduct>();

  // Initialize with base products (keyed by SKU lowercased)
  for (const product of baseProducts) {
    const skuKey = (product.sku || String(product.id || "")).toLowerCase();
    if (skuKey) {
      productMap.set(skuKey, { ...product });
    }
  }

  // Fetch overrides from PostgreSQL
  try {
    const overrides = await prisma.productOverride.findMany();
    for (const item of overrides) {
      if (!item.sku || item.sku.startsWith("system:") || item.sku.startsWith("setting:")) {
        continue;
      }
      const key = item.sku.toLowerCase();
      if (item.isDeleted) {
        productMap.delete(key);
      } else if (item.data) {
        productMap.set(key, item.data as unknown as RawProduct);
      }
    }
  } catch (dbErr) {
    console.warn("[loadMergedRawProducts] Database override fetch warning:", dbErr);
  }

  // Fetch live inventory overrides from PostgreSQL
  try {
    const invRecords = await prisma.inventory.findMany();
    for (const inv of invRecords) {
      if (!inv.sku) continue;
      const key = inv.sku.toLowerCase();
      const existing = productMap.get(key);
      if (existing) {
        existing.stock = {
          ...existing.stock,
          quantity: inv.quantity,
          status: inv.quantity > 0 ? "In Stock" : "Out of Stock",
        };
      }
    }
  } catch (dbErr) {
    console.warn("[loadMergedRawProducts] Inventory stock fetch warning:", dbErr);
  }

  const merged = Array.from(productMap.values());
  setCachedRawProducts(merged);

  return merged;
}


/**
 * Next free numeric product id. Considers soft-deleted overrides and inventory
 * rows too, so an id that was once used (and may be referenced by past orders
 * or a unique DB key) is never handed out again.
 */
export async function allocateProductId(): Promise<number> {
  const toNum = (v: unknown) => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  let max = 0;

  for (const p of await loadMergedRawProducts()) max = Math.max(max, toNum(p.id));
  for (const p of await loadBaseProductsJson()) max = Math.max(max, toNum(p.id));

  try {
    const overrides = await prisma.productOverride.findMany({ select: { id: true, sku: true } });
    for (const o of overrides) {
      if (o.sku.startsWith("system:") || o.sku.startsWith("setting:")) continue;
      max = Math.max(max, toNum(o.id));
    }
  } catch {
    // DB unavailable: fall back to what we have
  }
  try {
    const inv = await prisma.inventory.findMany({ select: { productId: true } });
    for (const i of inv) max = Math.max(max, toNum(i.productId));
  } catch {
    // ignore
  }
  return max + 1;
}

/**
 * Find a specific product by its ID or SKU with live stock.
 */
export async function findRawProductByIdOrSku(idOrSku: string): Promise<RawProduct | null> {
  const products = await loadMergedRawProducts();
  const target = products.find(
    (p) => String(p.id) === idOrSku || (p.sku && p.sku.toLowerCase() === idOrSku.toLowerCase()),
  );

  if (!target) return null;

  try {
    const inv = await prisma.inventory.findFirst({
      where: { OR: [{ productId: String(target.id) }, { sku: target.sku }] },
    });
    if (inv) {
      target.stock = {
        ...target.stock,
        quantity: inv.quantity,
        status: inv.quantity > 0 ? "In Stock" : "Out of Stock",
      };
    }
  } catch {
    // Ignore DB error
  }

  return target;
}

/**
 * Persist product changes to PostgreSQL (ProductOverride and Inventory)
 * and safely update local JSON files if the filesystem is writable.
 */
export async function saveRawProduct(raw: RawProduct): Promise<void> {
  const numericId = typeof raw.id === "number" ? raw.id : Number(raw.id) || 1;

  let dbPersisted = false;
  let filePersisted = false;

  // 1. Persist to PostgreSQL ProductOverride table
  try {
    await prisma.productOverride.upsert({
      where: { sku: raw.sku },
      update: {
        id: String(numericId),
        data: raw as any,
        isDeleted: false,
      },
      create: {
        id: String(numericId),
        sku: raw.sku,
        data: raw as any,
        isDeleted: false,
      },
    });
    dbPersisted = true;
  } catch (err) {
    console.error("[saveRawProduct] PostgreSQL ProductOverride upsert error:", err);
  }

  // 2. Persist to PostgreSQL Inventory table
  try {
    await prisma.inventory.upsert({
      where: { sku: raw.sku },
      update: {
        name: raw.name,
        quantity: raw.stock.quantity,
      },
      create: {
        productId: String(numericId),
        sku: raw.sku,
        name: raw.name,
        quantity: raw.stock.quantity,
      },
    });
  } catch (dbErr) {
    console.warn("[saveRawProduct] Prisma inventory sync warning:", dbErr);
  }

  // 3. Update local products.json (local dev environment only)
  try {
    const baseList = await loadBaseProductsJson();
    // Remove ALL existing entries that share the same numeric id OR the new SKU.
    // A plain findIndex + splice would miss cases where the same id appears under a
    // different (old) SKU after a SKU rename, which is exactly what causes duplicates.
    const filtered = baseList.filter(
      (p) => String(p.id) !== String(numericId) && p.sku.toLowerCase() !== raw.sku.toLowerCase(),
    );
    filtered.unshift(raw);
    await writeJsonAtomic(productsFilePath, filtered);
    filePersisted = true;
  } catch (fsErr: any) {
    // In serverless / read-only environments (e.g. Vercel / AWS Lambda), the filesystem is immutable
    if (fsErr.code === "EROFS" || fsErr.message?.includes("read-only file system")) {
      console.info(
        "[saveRawProduct] Read-only filesystem detected; product safely persisted to PostgreSQL.",
      );
    } else {
      console.warn("[saveRawProduct] Local JSON file update warning:", fsErr);
    }
  }

  // Never report success when nothing was actually saved.
  if (!dbPersisted && !filePersisted) {
    throw new Error(
      "Could not save the product: the database and the local data file are both unavailable.",
    );
  }

  // 4. Update manifest if possible
  await safeSyncManifest(raw.sku, raw.images);

  // 5. Immediately re-prime in-memory cache with the fresh merged list
  await loadMergedRawProducts();

  // 6. Trigger Next.js revalidation so static/cached routes update instantly
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { revalidatePath } = require("next/cache");
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/deals");
    revalidatePath("/api/products");
  } catch {
    // Ignore in non-request contexts
  }
}


/**
 * Delete a product by setting isDeleted = true in PostgreSQL
 * and removing from Inventory and local JSON if writable.
 */
export async function deleteRawProduct(idOrSku: string): Promise<boolean> {
  const product = await findRawProductByIdOrSku(idOrSku);
  if (!product) return false;

  // 1. Mark as deleted in PostgreSQL
  try {
    await prisma.productOverride.upsert({
      where: { sku: product.sku },
      update: {
        isDeleted: true,
      },
      create: {
        id: String(product.id),
        sku: product.sku,
        data: product as any,
        isDeleted: true,
      },
    });
  } catch (err) {
    console.error("[deleteRawProduct] Database delete error:", err);
  }

  // 2. Remove from inventory table
  try {
    await prisma.inventory.deleteMany({
      where: { OR: [{ productId: String(product.id) }, { sku: product.sku }] },
    });
  } catch (err) {
    console.warn("[deleteRawProduct] Inventory delete warning:", err);
  }

  // 3. Remove from local JSON if writable
  try {
    const baseList = await loadBaseProductsJson();
    const index = baseList.findIndex(
      (p) => String(p.id) === String(product.id) || p.sku.toLowerCase() === product.sku.toLowerCase(),
    );
    if (index !== -1) {
      baseList.splice(index, 1);
      await writeJsonAtomic(productsFilePath, baseList);
    }
  } catch (fsErr: any) {
    if (fsErr.code !== "EROFS" && !fsErr.message?.includes("read-only file system")) {
      console.warn("[deleteRawProduct] Local JSON delete warning:", fsErr);
    }
  }

  // Re-prime in-memory cache
  await loadMergedRawProducts();

  // Trigger Next.js revalidation so static/cached routes update instantly
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { revalidatePath } = require("next/cache");
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/deals");
    revalidatePath("/api/products");
  } catch {
    // Ignore in non-request contexts
  }

  return true;
}


/**
 * Safely synchronize SKU image paths to the manifest without crashing on EROFS.
 */
export async function safeSyncManifest(sku: string, images: string[]): Promise<void> {
  if (!sku || !images || images.length === 0) return;
  try {
    const raw = await fs.readFile(manifestFilePath, "utf-8");
    const data = JSON.parse(raw);
    data[sku] = images;
    await writeJsonAtomic(manifestFilePath, data);
  } catch (err: any) {
    if (err.code === "EROFS" || err.message?.includes("read-only file system")) {
      // Safely ignore on read-only environments
      return;
    }
    console.warn("[safeSyncManifest warning]", err);
  }
}

/**
 * Resolves images for a product, prioritizing valid raw.images, then manifest, then fallback.
 */
export function resolveProductImages(raw: RawProduct): string[] {
  const validRaw = (raw.images || []).filter(
    (img) => img && typeof img === "string" && !img.startsWith("/images/"),
  );
  if (validRaw.length > 0) {
    return validRaw;
  }
  if (raw.sku && manifest[raw.sku] && manifest[raw.sku].length > 0) {
    return manifest[raw.sku];
  }
  return ["/Hero_Image.png"];
}
