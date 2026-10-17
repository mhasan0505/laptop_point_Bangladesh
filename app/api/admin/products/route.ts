import { AdminProduct } from "@/lib/admin-data";
import {
  AccessoryConflictError,
  createAccessory,
  listAccessories,
  parseAccessoryInput,
} from "@/lib/accessories-storage";
import { accessoryToAdminProduct, adminToAccessoryInput } from "@/lib/accessory-bridge";
import { isAccessoryCategoryName } from "@/lib/accessory-types";
import { requireAdmin } from "@/lib/auth-guard";
import {
  flatToGroups,
  groupsToFlat,
  isGroupedSpecs,
  pruneGroups,
  type SpecGroups,
} from "@/lib/product-specs";
import {
  allocateProductId,
  loadMergedRawProducts,
  resolveProductImages,
  safeSyncManifest,
  saveRawProduct,
} from "@/lib/products-storage";
import { parseYoutubeId } from "@/lib/youtube";
import { RawProduct } from "@/types/raw-product";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export { resolveProductImages, safeSyncManifest as syncSkuToManifest };

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Visibility chosen in the form ("Active" | "Draft" | "Archived"). */
function parseVisibility(admin: { status?: string; statusValue?: string }): "active" | "draft" | "archived" {
  for (const candidate of [admin.status, admin.statusValue]) {
    const k = String(candidate ?? "").trim().toLowerCase();
    if (k === "active" || k === "draft" || k === "archived") return k;
  }
  return "active";
}

/** Pull only the grouped part out of an admin `specs` object (ignores legacy flat keys). */
function extractGroups(specs: AdminProduct["specs"]): SpecGroups | undefined {
  if (!isGroupedSpecs(specs)) return undefined;
  const groups: SpecGroups = {};
  for (const [key, value] of Object.entries(specs as Record<string, unknown>)) {
    if (key === "displayDetails") continue;
    if (isPlainObject(value)) groups[key] = value as Record<string, string>;
  }
  const pruned = pruneGroups(groups);
  return Object.keys(pruned).length > 0 ? pruned : undefined;
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

  const legacyRaw = raw as RawProduct & { price?: number; salePrice?: number };
  const salePrice = raw.pricing?.sale_price ?? legacyRaw.price ?? 0;
  const marketPrice = raw.pricing?.market_price ?? legacyRaw.salePrice ?? salePrice;

  // Always hand the form grouped specs, derived from legacy flat data when needed,
  // so editing an old product shows its real values instead of blank fields.
  const groups: SpecGroups =
    raw.specGroups && Object.keys(raw.specGroups).length > 0
      ? raw.specGroups
      : flatToGroups(raw.specs);

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
    marketPrice,
    regularPrice: marketPrice,
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
    statusValue: raw.statusValue ?? "active",
    featured: Boolean(raw.featured),
    sku: raw.sku || String(raw.id),
    description: typeof raw.description === "string" ? raw.description : (raw.description?.short || ""),
    fullDescription: typeof raw.description === "string" ? raw.description : (raw.description?.full || raw.description?.short || ""),
    tags: raw.tags ?? [],
    features: raw.features || [],
    youtubeUrl: raw.youtubeUrl,
    warranty: raw.warranty,
    variantOptions: raw.variantOptions,
    variants: raw.variants as AdminProduct["variants"],
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
      ...groups,
    },
    images: resolveProductImages(raw),
  };
}

export function adminToRawProduct(
  admin: Omit<AdminProduct, "id"> & { id?: string | number },
  numericId: number,
): RawProduct {
  const groups = extractGroups(admin.specs);

  // Grouped specs (new form) win; legacy flat keys are only used when no groups were sent.
  let flat: RawProduct["specs"];
  if (groups) {
    flat = groupsToFlat(groups);
  } else {
    const portsList =
      admin.specs?.portsList && admin.specs.portsList.length > 0
        ? admin.specs.portsList
        : admin.specs?.ports
          ? admin.specs.ports
              .split(",")
              .map((p: string) => p.trim())
              .filter(Boolean)
          : [];
    flat = {
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
    };
  }

  const marketPrice =
    admin.salePrice !== undefined && admin.salePrice > 0
      ? admin.salePrice
      : admin.marketPrice !== undefined && admin.marketPrice > 0
        ? admin.marketPrice
        : admin.price;

  const discount =
    marketPrice > admin.price
      ? Math.round(((marketPrice - admin.price) / marketPrice) * 100)
      : 0;

  const warranty = admin.warranty
    ? Object.fromEntries(
        Object.entries(admin.warranty).filter(([, v]) => typeof v === "string" && v.trim()),
      )
    : undefined;

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
    specs: flat,
    description: {
      short: admin.description?.trim() || "",
      full: admin.fullDescription?.trim() || admin.description?.trim() || "",
    },
    features: admin.features || [],
    images: admin.images && admin.images.length > 0 ? admin.images : ["/Hero_Image.png"],

    specGroups: groups,
    youtubeUrl: admin.youtubeUrl?.trim() || undefined,
    tags: admin.tags?.map((t) => t.trim()).filter(Boolean),
    featured: Boolean(admin.featured),
    statusValue: parseVisibility(admin),
    subCategory: groups?.General?.["Sub-Category"],
    warranty: warranty && Object.keys(warranty).length > 0 ? warranty : undefined,
    variantOptions: admin.variantOptions,
    variants: admin.variants as RawProduct["variants"],
  };
}

/** Returns an error message when the payload is unusable, otherwise null. */
export function validateAdminProductPayload(body: Partial<AdminProduct>): string | null {
  const price = Number(body.price);
  const stock = Number(body.stock ?? 0);
  if (!Number.isFinite(price) || price <= 0) return "Price must be a number greater than 0";
  if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
    return "Stock must be a whole number of 0 or more";
  }
  if (body.sku !== undefined && !/^[A-Za-z0-9][A-Za-z0-9._-]{1,63}$/.test(String(body.sku).trim())) {
    return "SKU must be 2–64 characters: letters, numbers, dot, dash or underscore";
  }
  const yt = body.youtubeUrl?.trim();
  if (yt && !parseYoutubeId(yt)) return "Enter a valid YouTube link (youtube.com or youtu.be)";
  return null;
}

// ─── GET /api/admin/products ──────────────────────────────────────────────────
export async function GET() {
  try {
    const [rawProducts, accessories] = await Promise.all([
      loadMergedRawProducts(),
      listAccessories().catch(() => []),
    ]);
    const adminProducts = [
      ...rawProducts.map((p) => rawToAdminProduct(p, p.stock?.quantity)),
      ...accessories.map(accessoryToAdminProduct),
    ];
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
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "marketing"] });
  if (auth.error) return auth.error;

  try {
    const body = (await request.json().catch(() => null)) as Omit<AdminProduct, "id"> | null;

    if (!body || !body.name || !body.sku || body.price === undefined) {
      return NextResponse.json(
        { error: "Product name, SKU, and price are required" },
        { status: 400 },
      );
    }

    const invalid = validateAdminProductPayload(body);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

    const sku = body.sku.trim();
    const [rawProducts, accessories] = await Promise.all([
      loadMergedRawProducts(),
      listAccessories().catch(() => []),
    ]);

    // SKUs are unique across laptops and accessories.
    const clash =
      rawProducts.some((p) => p.sku.toLowerCase() === sku.toLowerCase()) ||
      accessories.some((a) => a.sku.toLowerCase() === sku.toLowerCase());
    if (clash) {
      return NextResponse.json(
        { error: `A product with SKU "${sku}" already exists` },
        { status: 409 },
      );
    }

    // Accessories live in their own catalogue so they appear on /accessories.
    if (isAccessoryCategoryName(body.category)) {
      const parsed = parseAccessoryInput(adminToAccessoryInput(body), "create");
      if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
      try {
        const created = await createAccessory(parsed.data);
        logger.logAdminAudit({
          actorEmail: auth.user.email,
          actorRole: auth.user.role,
          action: "product_created",
          targetId: created.id,
          targetType: "product",
          details: { sku: created.sku, name: created.name, price: created.price, category: created.category },
        });
        return NextResponse.json(accessoryToAdminProduct(created), { status: 201 });
      } catch (err) {
        if (err instanceof AccessoryConflictError) {
          return NextResponse.json({ error: err.message }, { status: 409 });
        }
        throw err;
      }
    }

    // Allocate next numeric ID (never reuses an id that was deleted earlier)
    const newNumericId = await allocateProductId();

    const newRawProduct = adminToRawProduct(body, newNumericId);

    // Persist to PostgreSQL (ProductOverride and Inventory) + safe local sync
    await saveRawProduct(newRawProduct);

    const createdAdminProduct = rawToAdminProduct(newRawProduct);
    logger.logAdminAudit({
      actorEmail: auth.user.email,
      actorRole: auth.user.role,
      action: "product_created",
      targetId: createdAdminProduct.id,
      targetType: "product",
      details: { sku: newRawProduct.sku, name: newRawProduct.name, price: newRawProduct.pricing?.sale_price, category: newRawProduct.category },
    });
    return NextResponse.json(createdAdminProduct, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/products]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 },
    );
  }
}
