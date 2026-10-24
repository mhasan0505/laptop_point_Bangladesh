import type { Product } from "@/types/product";
export type { Product } from "@/types/product";
import type { RawProduct } from "@/types/raw-product";
import productsRaw from "./products.json";
import imageManifest from "./product-image-manifest.json";

const productImageManifest = imageManifest as Record<string, string[]>;

const normalizeImagePath = (path: string): string => {
  const trimmed = path.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const resolveProductImages = (product: RawProduct): string[] => {
  const fromManifest = productImageManifest[product.sku] ?? [];
  if (fromManifest.length > 0) {
    return fromManifest.map(normalizeImagePath).filter(Boolean);
  }

  const fromProductData = (product.images ?? [])
    .map(normalizeImagePath)
    .filter(Boolean);
  if (fromProductData.length > 0) {
    return fromProductData;
  }

  return ["/placeholder.png"];
};

// Helper to generate slugs
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};

/** Draft and archived products stay in the admin but are never shown to customers. */
export const isPublicRaw = (p: RawProduct): boolean =>
  !p.statusValue || p.statusValue === "active";

const warrantyLabel = (w: RawProduct["warranty"]): string | undefined => {
  if (!w) return undefined;
  const label = [w.period, w.type].filter(Boolean).join(" ").trim();
  return label || w.details?.trim() || undefined;
};

export function mapRawToProduct(p: RawProduct): Product {
  const description = p.description;
  const mappedImages = resolveProductImages(p);
  const mainImage = mappedImages[0] ?? "/Hero_Image.png";

  const salePrice = p.pricing?.sale_price ?? (p as any).price ?? 0;
  const marketPrice = p.pricing?.market_price ?? (p as any).salePrice ?? salePrice;
  const discount =
    marketPrice > 0
      ? Math.round((1 - salePrice / marketPrice) * 100)
      : 0;

  const stockCount =
    typeof p.stock === "number"
      ? p.stock
      : typeof p.stock === "object" && p.stock !== null
        ? p.stock.quantity ?? 0
        : (p as any).stockQuantity ?? 0;

  const displayStr = p.specs?.display
    ? typeof p.specs.display === "string"
      ? p.specs.display
      : `${p.specs.display.size || ""} ${p.specs.display.resolution || ""}`.trim()
    : "";

  return {
    id: p.id,
    name: p.name || "",
    slug: slugify(p.name || String(p.id)),
    brand: p.brand || "Unknown",
    price: salePrice,
    originalPrice: marketPrice,
    discount,
    inStock: stockCount > 0,
    stockQty: stockCount,
    condition: p.condition ? [p.condition] : [],
    grade: p.grade || "",
    image: mainImage,
    images: mappedImages,
    specs: {
      processor: p.specs?.processor || "",
      ram: p.specs?.ram || "",
      storage: p.specs?.storage || "",
      display: displayStr,
      graphics: p.specs?.graphics || "",
      battery: "Up to 4 hours",
      weight: p.specs?.weight || "",
      touchscreen:
        typeof p.specs?.display === "object" && p.specs?.display !== null
          ? Boolean(p.specs.display.touchscreen)
          : false,
      displayType:
        typeof p.specs?.display === "object" && p.specs?.display !== null
          ? p.specs.display.type || ""
          : "",
      os: p.specs?.os || "",
      ports: p.specs?.ports || [],
    },
    features: p.features || [],
    category: p.category || "Laptop",
    description: description,
    sku: p.sku || String(p.id),
    youtubeUrl: p.youtubeUrl || undefined,
    tags: p.tags && p.tags.length > 0 ? p.tags : undefined,
    specGroups: p.specGroups && Object.keys(p.specGroups).length > 0 ? p.specGroups : undefined,
    warranty: warrantyLabel(p.warranty),
    variantOptions: p.variantOptions && p.variantOptions.length > 0 ? p.variantOptions : undefined,
    variants: Array.isArray(p.variants) && p.variants.length > 0
      ? (p.variants as any[]).map((v) => ({
          id: v.id ? String(v.id) : undefined,
          sku: v.sku ? String(v.sku) : undefined,
          options: v.options && typeof v.options === "object" ? v.options : {},
          price: typeof v.price === "number" ? v.price : Number(v.price) || salePrice,
          marketPrice: typeof v.marketPrice === "number" ? v.marketPrice : Number(v.marketPrice) || marketPrice,
          stockQty: typeof v.stockQty === "number" ? v.stockQty : Number(v.stockQty) || 0,
          stockStatus: v.stockStatus || undefined,
          imageUrl: v.imageUrl || undefined,
          active: v.active !== false,
        }))
      : undefined,
  };
}


function getLaptops(): Product[] {
  if (typeof window === "undefined") {
    try {
      // Check in-memory database-merged cache first
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getCachedRawProducts } = require("@/lib/products-storage");
      const cached = getCachedRawProducts();
      if (cached && cached.length > 0) {
        return cached.filter(isPublicRaw).map(mapRawToProduct);
      }
    } catch {
      // Ignore module loading errors if in edge or client runtime
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require("path");
      const filePath = path.join(process.cwd(), "app", "data", "products.json");
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw) as RawProduct[];
        return parsed.filter(isPublicRaw).map(mapRawToProduct);
      }
    } catch {
      // fallback
    }
  }
  return (productsRaw as RawProduct[]).filter(isPublicRaw).map(mapRawToProduct);
}


export async function getLiveLaptops(): Promise<Product[]> {
  if (typeof window === "undefined") {
    try {
      const { loadMergedRawProducts } = await import("@/lib/products-storage");
      const raw = await loadMergedRawProducts();
      return raw.filter(isPublicRaw).map(mapRawToProduct);
    } catch (err) {
      console.warn("[getLiveLaptops] Database load fallback:", err);
    }
  }
  return getLaptops();
}

export const laptopData = {
  get laptops(): Product[] {
    return getLaptops();
  },
};
