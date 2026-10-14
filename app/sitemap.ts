import { getLiveLaptops } from "@/app/data/data";
import { listPublicAccessories } from "@/lib/accessories-storage";
import { ACCESSORY_CATEGORIES } from "@/lib/accessory-types";
import { SEO_CONFIG } from "@/lib/seo-config";
import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://laptoppointbd.com";
  const [laptops, accessories] = await Promise.all([
    getLiveLaptops(),
    listPublicAccessories(),
  ]);

  // Stable file modification timestamp for static routes
  let catalogDate = new Date("2025-01-01T00:00:00.000Z");
  try {
    const filePath = path.join(process.cwd(), "app", "data", "products.json");
    if (fs.existsSync(filePath)) {
      catalogDate = fs.statSync(filePath).mtime;
    }
  } catch {
    // fallback remains stable date
  }

  // 1. In-stock products only
  const inStockProducts = laptops.filter(
    (product) =>
      product.inStock !== false &&
      (product.stockQty === undefined || product.stockQty > 0)
  );

  // Per instruction: Use each product's own updated/created timestamp for lastModified.
  // If no per-product timestamp exists, omit lastModified for products rather than using file mtime.
  const productRoutes = inStockProducts.map((product) => {
    const rawUpdated =
      typeof product.updated_at === "string" || product.updated_at instanceof Date
        ? product.updated_at
        : typeof product.updatedAt === "string" || product.updatedAt instanceof Date
        ? product.updatedAt
        : typeof product.created_at === "string" || product.created_at instanceof Date
        ? product.created_at
        : typeof product.createdAt === "string" || product.createdAt instanceof Date
        ? product.createdAt
        : undefined;
    const lastModified = rawUpdated ? new Date(rawUpdated) : undefined;

    return {
      url: `${baseUrl}/product/${product.slug}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    };
  });

  // 1b. Self-canonical single-filter brand and category routes
  const brands = Array.from(
    new Set(
      inStockProducts
        .map((p) => p.brand?.trim())
        .filter((b): b is string => Boolean(b))
    )
  ).sort();

  const brandRoutes = brands.map((brand) => ({
    url: `${baseUrl}/shop?brand=${encodeURIComponent(brand)}`,
    lastModified: catalogDate,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const shopCategoryCounts = new Map<string, number>();
  for (const p of inStockProducts) {
    const cat = p.category?.trim();
    if (cat) {
      shopCategoryCounts.set(cat, (shopCategoryCounts.get(cat) ?? 0) + 1);
    }
  }

  const categories = Array.from(shopCategoryCounts.keys())
    .filter((cat) => (shopCategoryCounts.get(cat) ?? 0) > 0)
    .sort();

  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/shop?category=${encodeURIComponent(category)}`,
    lastModified: catalogDate,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const accessoryCategoryCounts = new Map<string, number>();
  for (const a of accessories) {
    if (!a.category) continue;
    const norm = a.category.toLowerCase().trim();
    accessoryCategoryCounts.set(norm, (accessoryCategoryCounts.get(norm) ?? 0) + 1);
  }

  const accessoryCategoryRoutes = ACCESSORY_CATEGORIES
    .filter((category) => (accessoryCategoryCounts.get(category.slug.toLowerCase().trim()) ?? 0) > 0)
    .map((category) => ({
      url: `${baseUrl}/accessories?category=${encodeURIComponent(category.slug)}`,
      lastModified: catalogDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // 2. Allowed static content routes (Excludes disallowed /admin/, /api/, /cart/, /checkout/, /wishlist/)
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: catalogDate,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: catalogDate,
      changeFrequency: "daily" as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/accessories`,
      lastModified: catalogDate,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: catalogDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: catalogDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: catalogDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/EMI`,
      lastModified: catalogDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: catalogDate,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: catalogDate,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
  ];

  // 3. Blog content topic routes
  const blogRoutes = (SEO_CONFIG.contentTopics || []).map((topic) => ({
    url: `${baseUrl}/blog/${topic.slug}`,
    lastModified: catalogDate,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...brandRoutes,
    ...categoryRoutes,
    ...accessoryCategoryRoutes,
    ...productRoutes,
    ...blogRoutes,
  ];
}
