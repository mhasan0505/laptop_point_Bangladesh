import { AdminProduct } from "@/lib/admin-data";
import { prisma } from "@/lib/prisma";
import { RawProduct } from "@/types/raw-product";
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const productsFilePath = path.join(process.cwd(), "app", "data", "products.json");

async function loadProductsJson(): Promise<RawProduct[]> {
  try {
    const raw = await fs.readFile(productsFilePath, "utf-8");
    return JSON.parse(raw) as RawProduct[];
  } catch (error) {
    console.error("[loadProductsJson error]", error);
    return [];
  }
}

async function saveProductsJson(products: RawProduct[]): Promise<void> {
  const json = JSON.stringify(products, null, 2);
  await fs.writeFile(productsFilePath, json, "utf-8");
}

import imageManifest from "@/app/data/product-image-manifest.json";

const manifest = imageManifest as Record<string, string[]>;
const manifestFilePath = path.join(process.cwd(), "app", "data", "product-image-manifest.json");

export function resolveProductImages(raw: RawProduct): string[] {
  // 1. If raw.images has valid paths (not starting with broken /images/), use them
  const validRaw = (raw.images || []).filter(
    (img) => img && typeof img === "string" && !img.startsWith("/images/"),
  );
  if (validRaw.length > 0) {
    return validRaw;
  }
  // 2. Check manifest by SKU
  if (raw.sku && manifest[raw.sku] && manifest[raw.sku].length > 0) {
    return manifest[raw.sku];
  }
  // 3. Fallback to hero placeholder
  return ["/Hero_Image.png"];
}

export async function syncSkuToManifest(sku: string, images: string[]): Promise<void> {
  if (!sku || !images || images.length === 0) return;
  try {
    const raw = await fs.readFile(manifestFilePath, "utf-8");
    const data = JSON.parse(raw);
    data[sku] = images;
    await fs.writeFile(manifestFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[syncSkuToManifest warning]", err);
  }
}

export function rawToAdminProduct(raw: RawProduct, currentStock?: number): AdminProduct {
  const stock = currentStock !== undefined ? currentStock : (raw.stock?.quantity ?? 0);
  let status = "Active";
  if (stock === 0) status = "Out of Stock";
  else if (stock < 5) status = "Low Stock";

  const displayClause = [
    raw.specs?.display?.size,
    raw.specs?.display?.resolution,
    raw.specs?.display?.type,
    raw.specs?.display?.touchscreen ? "Touchscreen" : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: String(raw.id),
    name: raw.name || "",
    brand: raw.brand || "Unknown",
    model: raw.model || "",
    category: raw.category || "Laptop",
    condition: raw.condition || "Used",
    grade: raw.grade || "A",
    price: raw.pricing?.sale_price ?? 0,
    salePrice: raw.pricing?.market_price,
    currency: raw.pricing?.currency || "BDT",
    taxIncluded: raw.pricing?.tax_included ?? true,
    stock,
    stockStatus: raw.stock?.status || (stock > 0 ? "In Stock" : "Out of Stock"),
    lowStockThreshold: 10,
    status,
    statusValue: "active",
    featured: false,
    sku: raw.sku || String(raw.id),
    description: raw.description?.short || "",
    fullDescription: raw.description?.full || "",
    features: raw.features || [],
    specs: {
      processor: raw.specs?.processor || "",
      ram: raw.specs?.ram || "",
      storage: raw.specs?.storage || "",
      display: displayClause || undefined,
      displayDetails: raw.specs?.display
        ? {
            size: raw.specs.display.size || "",
            resolution: raw.specs.display.resolution || "",
            type: raw.specs.display.type || "",
            touchscreen: Boolean(raw.specs.display.touchscreen),
          }
        : undefined,
      graphics: raw.specs?.graphics || "",
      ports: raw.specs?.ports?.join(", ") || "",
      portsList: raw.specs?.ports || [],
      weight: raw.specs?.weight || "",
      dimensions: "",
      os: raw.specs?.os || "",
    },
    images: resolveProductImages(raw),
  };
}

export function adminToRawProduct(
  admin: Omit<AdminProduct, "id"> & { id?: string | number },
  numericId: number,
): RawProduct {
  const portsList =
    admin.specs?.portsList && admin.specs.portsList.length > 0
      ? admin.specs.portsList
      : admin.specs?.ports
        ? admin.specs.ports
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean)
        : [];

  const marketPrice =
    admin.salePrice !== undefined && admin.salePrice > 0
      ? admin.salePrice
      : admin.price;

  const discount =
    marketPrice > admin.price
      ? Math.round(((marketPrice - admin.price) / marketPrice) * 100)
      : 0;

  return {
    id: numericId,
    sku: admin.sku.trim(),
    name: admin.name.trim(),
    brand: admin.brand.trim(),
    model: admin.model?.trim() || "",
    category: admin.category?.trim() || "Laptop",
    condition: admin.condition?.trim() || "Used",
    grade: admin.grade?.trim() || "A",
    pricing: {
      currency: admin.currency?.trim() || "BDT",
      sale_price: Number(admin.price),
      market_price: Number(marketPrice),
      discount_percentage: discount,
      tax_included: admin.taxIncluded ?? true,
    },
    stock: {
      status: admin.stockStatus || (admin.stock > 0 ? "In Stock" : "Out of Stock"),
      quantity: Number(admin.stock) || 0,
    },
    specs: {
      processor: admin.specs?.processor?.trim() || "",
      ram: admin.specs?.ram?.trim() || "",
      storage: admin.specs?.storage?.trim() || "",
      display: {
        size: admin.specs?.displayDetails?.size?.trim() || "",
        resolution: admin.specs?.displayDetails?.resolution?.trim() || "",
        type: admin.specs?.displayDetails?.type?.trim() || "",
        touchscreen: Boolean(admin.specs?.displayDetails?.touchscreen),
      },
      graphics: admin.specs?.graphics?.trim() || "",
      ports: portsList,
      weight: admin.specs?.weight?.trim() || "",
      os: admin.specs?.os?.trim() || "",
    },
    description: {
      short: admin.description?.trim() || "",
      full: admin.fullDescription?.trim() || admin.description?.trim() || "",
    },
    features: admin.features || [],
    images: admin.images && admin.images.length > 0 ? admin.images : ["/Hero_Image.png"],
  };
}

// ─── GET /api/admin/products ──────────────────────────────────────────────────
export async function GET() {
  try {
    const rawProducts = await loadProductsJson();

    // Fetch live inventory overrides from Postgres if available
    let inventoryMap = new Map<string, number>();
    try {
      const invRecords = await prisma.inventory.findMany();
      for (const rec of invRecords) {
        inventoryMap.set(rec.sku, rec.quantity);
      }
    } catch {
      // Prisma offline or not reachable, fallback directly to JSON
    }

    const adminProducts = rawProducts.map((p) => {
      const stock = inventoryMap.has(p.sku)
        ? inventoryMap.get(p.sku)!
        : p.stock?.quantity;
      return rawToAdminProduct(p, stock);
    });

    return NextResponse.json(adminProducts);
  } catch (error) {
    console.error("[GET /api/admin/products]", error);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 },
    );
  }
}

// ─── POST /api/admin/products ─────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Omit<AdminProduct, "id">;

    if (!body.name || !body.sku || body.price === undefined) {
      return NextResponse.json(
        { error: "Product name, SKU, and price are required" },
        { status: 400 },
      );
    }

    const rawProducts = await loadProductsJson();

    // Check SKU collision
    const existingWithSku = rawProducts.find(
      (p) => p.sku.toLowerCase() === body.sku.trim().toLowerCase(),
    );
    if (existingWithSku) {
      return NextResponse.json(
        { error: `A product with SKU "${body.sku.trim()}" already exists` },
        { status: 409 },
      );
    }

    // Allocate next numeric ID
    const maxId = rawProducts.reduce((max, p) => {
      const num = typeof p.id === "number" ? p.id : Number(p.id);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newNumericId = maxId + 1;

    const newRawProduct = adminToRawProduct(body, newNumericId);

    // Save to products.json
    rawProducts.unshift(newRawProduct);
    await saveProductsJson(rawProducts);
    await syncSkuToManifest(newRawProduct.sku, newRawProduct.images);

    // Synchronize into Prisma Inventory table
    try {
      await prisma.inventory.upsert({
        where: { sku: newRawProduct.sku },
        update: {
          name: newRawProduct.name,
          quantity: newRawProduct.stock.quantity,
        },
        create: {
          productId: String(newNumericId),
          sku: newRawProduct.sku,
          name: newRawProduct.name,
          quantity: newRawProduct.stock.quantity,
        },
      });
    } catch (dbErr) {
      console.warn("[Prisma inventory sync warning]", dbErr);
    }

    const createdAdminProduct = rawToAdminProduct(newRawProduct);
    return NextResponse.json(createdAdminProduct, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/products]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 },
    );
  }
}
