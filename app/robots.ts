import { MetadataRoute } from "next";

// Toggle to disallow AI training scrapers (GPTBot, ClaudeBot, Google-Extended)
// while allowing AI search agents (OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot, Claude-User)
// and standard search bots (Googlebot, Bingbot) via the single '*' rule.
const BLOCK_AI_TRAINING = false;

export default function robots(): MetadataRoute.Robots {
  const disallowed = [
    "/admin/",
    "/api/",
    "/cart/",
    "/checkout/",
    "/wishlist/",
  ];

  const rules: MetadataRoute.Robots["rules"] = [];

  if (BLOCK_AI_TRAINING) {
    rules.push({
      userAgent: ["GPTBot", "ClaudeBot", "Google-Extended"],
      disallow: ["/"],
    });
  }

  rules.push({
    userAgent: "*",
    allow: "/",
    disallow: disallowed,
  });

  return {
    rules,
    sitemap: "https://laptoppointbd.com/sitemap.xml",
  };
}
