import { Product } from "@/types/product";
import { RawProduct } from "@/types/raw-product";
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

// Map each product
const laptops: Product[] = (productsRaw as RawProduct[]).map((p) => {
  const description = p.description;
  const mappedImages = resolveProductImages(p);
  const mainImage = mappedImages[0] ?? "/placeholder.png";

  return {
    id: p.id,
    name: p.name,
    slug: slugify(p.name),
    brand: p.brand,
    price: p.pricing.sale_price,
    originalPrice: p.pricing.market_price,
    discount:
      p.pricing.market_price > 0
        ? Math.round((1 - p.pricing.sale_price / p.pricing.market_price) * 100)
        : 0,
    rating: 4.5 + Math.random() * 0.5, // Simulate rating
    reviews: Math.floor(Math.random() * 500) + 50, // Simulate reviews
    inStock: p.stock.quantity > 0,
    condition: p.condition ? [p.condition] : [],
    color: ["Silver", "Black"], // Default colors
    image: mainImage,
    images: mappedImages,
    specs: {
      processor: p.specs.processor,
      ram: p.specs.ram,
      storage: p.specs.storage,
      display: `${p.specs.display.size} ${p.specs.display.resolution}`,
      graphics: p.specs.graphics,
      battery: "Up to 4 hours",
      weight: p.specs.weight,
    },
    features: p.features,
    category: p.category,
    description: description,
    sku: p.sku,
  };
});

export const laptopData = {
  laptops,
};
