import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/cart/", "/checkout/"],
    },
    sitemap: "https://laptop-point-bangladesh.vercel.app/sitemap.xml",
  };
}
