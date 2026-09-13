import { AdminProduct } from "@/lib/admin-data";
import {
  loadMergedRawProducts,
  resolveProductImages,
  safeSyncManifest,
  saveRawProduct,
} from "@/lib/products-storage";
import { RawProduct } from "@/types/raw-product";
import { NextRequest, NextResponse } from "next/server";

export { resolveProductImages, safeSyncManifest as syncSkuToManifest };


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

  const salePrice = raw.pricing?.sale_price ?? (raw as any).price ?? 0;
  const marketPrice = raw.pricing?.market_price ?? (raw as any).salePrice ?? salePrice;

  return {
    id: String(raw.id),
    name: raw.name || "",
    brand: raw.brand || "Unknown",
    model: raw.model || "",
    category: raw.category || "Laptop",
    condition: raw.condition || "Used",
    grade: raw.grade || "A",
    price: salePrice,
    salePrice: marketPrice,
    pricing: {
      currency: raw.pricing?.currency || "BDT",
      sale_price: salePrice,
      market_price: marketPrice,
      discount_percentage: raw.pricing?.discount_percentage ?? 0,
      tax_included: raw.pricing?.tax_included ?? true,
    },
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
    const rawProducts = await loadMergedRawProducts();
    const adminProducts = rawProducts.map((p) => rawToAdminProduct(p, p.stock?.quantity));
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

    const rawProducts = await loadMergedRawProducts();

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

    // Persist to PostgreSQL (ProductOverride and Inventory) + safe local sync
    await saveRawProduct(newRawProduct);

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

