import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        crawlDelay: 1,
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/cart/",
          "/checkout/",
          "/wishlist/",
          "/compare/",
          "/*.json$",
          "/*?*sort=",
          "/*?*filter=",
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: [
      "https://laptop-point-bangladesh.vercel.app/sitemap.xml",
      "https://laptop-point-bangladesh.vercel.app/sitemap-products.xml",
      "https://laptop-point-bangladesh.vercel.app/sitemap-blog.xml",
    ],
    host: "https://laptop-point-bangladesh.vercel.app",
  };
}
