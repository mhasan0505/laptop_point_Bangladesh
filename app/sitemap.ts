import { getLiveProducts } from "@/lib/products";
import { SEO_CONFIG } from "@/lib/seo-config";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://laptoppointbd.com";

  // Product pages from admin-uploaded Sanity products only
  const liveProducts = await getLiveProducts();
  const products = liveProducts
    .filter((p) => p.slug)
    .map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

  // Main static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
  ];

  // Blog routes based on SEO_CONFIG
  const blogRoutes = SEO_CONFIG.contentTopics.map((topic) => ({
    url: `${baseUrl}/blog/${topic.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Local pages by district
  const localRoutes = SEO_CONFIG.locations.map((location) => ({
    url: `${baseUrl}/shop?location=${location.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...products, ...blogRoutes, ...localRoutes];
}
