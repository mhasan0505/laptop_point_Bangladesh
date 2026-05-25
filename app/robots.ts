import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/*.json$",
          "/*?*sort=",
          "/*?*filter=",
        ],
      },
    ],
    sitemap: "https://laptoppointbd.com/sitemap.xml",
    host: "https://laptoppointbd.com",
  };
}
