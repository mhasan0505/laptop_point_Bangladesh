import { laptopData } from "@/app/data/data";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://laptop-point-bangladesh.vercel.app";

  const products = laptopData.laptops.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const routes = ["", "/shop", "/compare", "/wishlist", "/contact"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    })
  );

  return [...routes, ...products];
}
