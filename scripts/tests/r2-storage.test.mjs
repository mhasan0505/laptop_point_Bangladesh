import test from "node:test";
import assert from "node:assert/strict";

// Register module alias loader
await import("../lib/register.mjs");

const {
  isR2Configured,
  getR2PublicUrl,
} = await import("../../lib/media/r2.ts");

const { default: nextConfig } = await import("../../next.config.ts");

test("Cloudflare R2 Storage & Free Tier CDN Integration", async (t) => {
  const origEnv = { ...process.env };

  t.afterEach(() => {
    process.env = { ...origEnv };
  });

  await t.test("1. isR2Configured accurately detects presence of R2 credentials", () => {
    delete process.env.R2_ACCOUNT_ID;
    delete process.env.R2_ACCESS_KEY_ID;
    delete process.env.R2_SECRET_ACCESS_KEY;
    delete process.env.R2_BUCKET_NAME;

    assert.equal(isR2Configured(), false, "Must return false when credentials are empty");

    process.env.R2_ACCOUNT_ID = "acc-123456789";
    process.env.R2_ACCESS_KEY_ID = "key-123";
    process.env.R2_SECRET_ACCESS_KEY = "sec-456";
    process.env.R2_BUCKET_NAME = "laptoppoint-assets";

    assert.equal(isR2Configured(), true, "Must return true when all 4 credentials are set");
  });

  await t.test("2. getR2PublicUrl formats clean URLs with custom domain", () => {
    process.env.R2_PUBLIC_URL = "https://assets.laptoppoint.com.bd";
    const url = getR2PublicUrl("products/hp/laptop.webp");
    assert.equal(url, "https://assets.laptoppoint.com.bd/products/hp/laptop.webp");

    // Handles leading slashes and trailing slashes safely
    process.env.R2_PUBLIC_URL = "https://assets.laptoppoint.com.bd/";
    const url2 = getR2PublicUrl("/uploads/banner.webp");
    assert.equal(url2, "https://assets.laptoppoint.com.bd/uploads/banner.webp");
  });

  await t.test("3. next.config.ts rewrites seamlessly proxy /products and /uploads to R2", async () => {
    process.env.R2_PUBLIC_URL = "https://assets.laptoppoint.com.bd";
    assert.ok(typeof nextConfig.rewrites === "function", "nextConfig must define rewrites function");

    const rewrites = await nextConfig.rewrites();
    assert.ok(Array.isArray(rewrites), "rewrites must return an array");

    const productRewrite = rewrites.find((r) => r.source === "/products/:path*");
    assert.ok(productRewrite, "Must define rewrite rule for /products/:path*");
    assert.equal(productRewrite.destination, "https://assets.laptoppoint.com.bd/products/:path*");

    const uploadRewrite = rewrites.find((r) => r.source === "/uploads/:path*");
    assert.ok(uploadRewrite, "Must define rewrite rule for /uploads/:path*");
    assert.equal(uploadRewrite.destination, "https://assets.laptoppoint.com.bd/uploads/:path*");
  });

  await t.test("4. Cloudflare edge cache header (s-maxage) is present for all asset endpoints", async () => {
    const rules = await nextConfig.headers();
    const productRule = rules.find((r) => r.source === "/products/:path*");
    assert.ok(productRule, "Must have header rule for /products/:path*");

    const cacheHeader = productRule.headers.find((h) => h.key === "Cache-Control");
    assert.ok(cacheHeader, "Must define Cache-Control header");
    assert.ok(cacheHeader.value.includes("s-maxage="), "Cache-Control must specify s-maxage for Cloudflare edge CDN");
    assert.ok(cacheHeader.value.includes("immutable"), "Cache-Control must mark static media as immutable");
  });
});
