import { Prisma } from "@prisma/client";

export type ProductPayload = {
  sku?: string;
  slug?: string;
  name?: string;
  brand?: string;
  model?: string;
  category?: string;
  condition?: string;
  grade?: string;
  pricing?: {
    sale_price?: number;
    market_price?: number;
    discount_percentage?: number;
    tax_included?: boolean;
  };
  stock?: {
    quantity?: number;
  };
  specs?: {
    processor?: string;
    ram?: string;
    storage?: string;
    display?: {
      size?: string;
      resolution?: string;
      type?: string;
      touchscreen?: boolean;
    };
    graphics?: string;
    ports?: string[];
    weight?: string;
    os?: string;
  };
  description?: {
    short?: string;
    full?: string;
  };
  features?: string[];
  images?: string[];
  status?: "draft" | "review" | "published" | "archived";
};

type ParsedProductPayload = {
  productData: Prisma.ProductUncheckedCreateInput;
  inventoryQuantity: number;
  features: string[];
  images: string[];
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function parseProductPayload(
  payload: ProductPayload,
  mode: "create" | "update",
): { ok: true; value: ParsedProductPayload } | { ok: false; error: string } {
  const isCreate = mode === "create";

  if (isCreate) {
    const required = [
      ["sku", payload.sku],
      ["name", payload.name],
      ["brand", payload.brand],
      ["model", payload.model],
      ["category", payload.category],
      ["pricing.sale_price", payload.pricing?.sale_price],
      ["pricing.market_price", payload.pricing?.market_price],
      ["stock.quantity", payload.stock?.quantity],
    ] as const;

    for (const [key, value] of required) {
      if (value === undefined || value === null || value === "") {
        return { ok: false, error: `Missing required field: ${key}` };
      }
    }
  }

  const salePrice = payload.pricing?.sale_price ?? 0;
  const marketPrice = payload.pricing?.market_price ?? 0;
  const stockQuantity = payload.stock?.quantity ?? 0;

  if (payload.pricing?.sale_price !== undefined && salePrice < 0) {
    return { ok: false, error: "pricing.sale_price must be >= 0" };
  }
  if (payload.pricing?.market_price !== undefined && marketPrice < 0) {
    return { ok: false, error: "pricing.market_price must be >= 0" };
  }
  if (payload.stock?.quantity !== undefined && stockQuantity < 0) {
    return { ok: false, error: "stock.quantity must be >= 0" };
  }

  if (payload.features && !Array.isArray(payload.features)) {
    return { ok: false, error: "features must be an array of strings" };
  }
  if (payload.images && !Array.isArray(payload.images)) {
    return { ok: false, error: "images must be an array of strings" };
  }
  if (payload.specs?.ports && !Array.isArray(payload.specs.ports)) {
    return { ok: false, error: "specs.ports must be an array of strings" };
  }

  const sku = payload.sku?.trim() || "";
  const name = payload.name?.trim() || "";
  const brand = payload.brand?.trim() || "";
  const model = payload.model?.trim() || "";
  const computedSlug = payload.slug?.trim() || slugify(`${name}-${sku}`);

  const productData: Prisma.ProductUncheckedCreateInput = {
    sku,
    slug: computedSlug,
    name,
    brand,
    model,
    category: payload.category?.trim() || "Laptop",
    condition: payload.condition?.trim() || "Used",
    grade: payload.grade?.trim() || null,
    salePrice,
    marketPrice,
    discountPercentage: payload.pricing?.discount_percentage ?? 0,
    taxIncluded: payload.pricing?.tax_included ?? true,
    processor: payload.specs?.processor?.trim() || null,
    ram: payload.specs?.ram?.trim() || null,
    storage: payload.specs?.storage?.trim() || null,
    displaySize: payload.specs?.display?.size?.trim() || null,
    displayResolution: payload.specs?.display?.resolution?.trim() || null,
    displayType: payload.specs?.display?.type?.trim() || null,
    touchscreen: payload.specs?.display?.touchscreen ?? false,
    graphics: payload.specs?.graphics?.trim() || null,
    ports: payload.specs?.ports ?? [],
    weight: payload.specs?.weight?.trim() || null,
    os: payload.specs?.os?.trim() || null,
    descriptionShort: payload.description?.short?.trim() || null,
    descriptionFull: payload.description?.full || null,
    status: payload.status ?? "published",
  };

  return {
    ok: true,
    value: {
      productData,
      inventoryQuantity: stockQuantity,
      features: (payload.features ?? []).map((f) => f.trim()).filter(Boolean),
      images: (payload.images ?? []).map((i) => i.trim()).filter(Boolean),
    },
  };
}

export function buildProductApiResponse(product: {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  condition: string;
  grade: string | null;
  salePrice: number;
  marketPrice: number;
  discountPercentage: number;
  taxIncluded: boolean;
  processor: string | null;
  ram: string | null;
  storage: string | null;
  displaySize: string | null;
  displayResolution: string | null;
  displayType: string | null;
  touchscreen: boolean;
  graphics: string | null;
  ports: string[];
  weight: string | null;
  os: string | null;
  descriptionShort: string | null;
  descriptionFull: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  images: Array<{ url: string; position: number }>;
  features: Array<{ label: string; position: number }>;
  inventory: { quantity: number; reserved: number } | null;
}) {
  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    model: product.model,
    category: product.category,
    condition: product.condition,
    grade: product.grade,
    pricing: {
      currency: "BDT",
      sale_price: product.salePrice,
      market_price: product.marketPrice,
      discount_percentage: product.discountPercentage,
      tax_included: product.taxIncluded,
    },
    stock: {
      status:
        product.inventory && product.inventory.quantity > 0
          ? "In Stock"
          : "Out of Stock",
      quantity: product.inventory?.quantity ?? 0,
      reserved: product.inventory?.reserved ?? 0,
    },
    specs: {
      processor: product.processor,
      ram: product.ram,
      storage: product.storage,
      display: {
        size: product.displaySize,
        resolution: product.displayResolution,
        type: product.displayType,
        touchscreen: product.touchscreen,
      },
      graphics: product.graphics,
      ports: product.ports,
      weight: product.weight,
      os: product.os,
    },
    description: {
      short: product.descriptionShort,
      full: product.descriptionFull,
    },
    features: product.features
      .sort((a, b) => a.position - b.position)
      .map((feature) => feature.label),
    images: product.images
      .sort((a, b) => a.position - b.position)
      .map((img) => img.url),
    status: product.status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
