import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Register @/ module alias loader
await import("../lib/register.mjs");

const { default: nextConfig } = await import("../../next.config.ts");
const { getStorefrontContact, getStorefrontCommerce } = await import("../../lib/public-content.ts");
const { StoreProfileSchema, SeoSchema } = await import("../../lib/settings-base.ts");

test("Phase 6: Content, Legal, and Brand Readiness Verification", async (t) => {
  await t.test("1. Store Profile single source of truth & defaults", async () => {
    const contact = await getStorefrontContact();
    assert.ok(contact.name, "Store name should be present");
    assert.ok(contact.hotline.includes("1612-182408"), "Hotline should contain official store number");
    assert.ok(contact.address.includes("Mirpur-10"), "Showroom address should be in Mirpur-10");
    assert.ok(contact.social.facebook.includes("facebook.com"), "Facebook URL present");
    assert.ok(contact.social.youtube.includes("youtube.com"), "YouTube URL present");

    // Test Schema defaults
    const profileDefaults = StoreProfileSchema.parse({});
    assert.equal(profileDefaults.logo, "/Logo.webp", "Logo default must be /Logo.webp");
    assert.equal(profileDefaults.favicon, "/favicon.ico", "Favicon default must be /favicon.ico");

    const seoDefaults = SeoSchema.parse({});
    assert.equal(seoDefaults.defaultShareImage, "/Hero_Image.png", "Share image default must be /Hero_Image.png");
  });

  await t.test("2. Physical public asset files exist on filesystem", () => {
    const publicDir = path.join(process.cwd(), "public");
    const requiredAssets = [
      "Logo.webp",
      "favicon.ico",
      "Hero_Image.png",
      "Logo-admin.webp",
      "Logo_icon.webp",
    ];

    for (const asset of requiredAssets) {
      const fullPath = path.join(publicDir, asset);
      assert.ok(fs.existsSync(fullPath), `Asset public/${asset} must exist on disk`);
      const stat = fs.statSync(fullPath);
      assert.ok(stat.size > 0, `Asset public/${asset} must not be empty`);
    }

    // Verify nonexistent legacy paths are NOT present
    const legacyLogo = path.join(publicDir, "icons", "logo.png");
    assert.equal(fs.existsSync(legacyLogo), false, "Legacy public/icons/logo.png should not exist");
  });

  await t.test("3. Legal policy pages do not use dynamic new Date().toLocaleDateString()", () => {
    const legalPages = [
      "app/(main)/privacy/page.tsx",
      "app/(main)/terms/page.tsx",
      "app/(main)/returns/page.tsx",
      "app/(main)/shipping/page.tsx",
    ];

    for (const relPath of legalPages) {
      const content = fs.readFileSync(path.join(process.cwd(), relPath), "utf-8");
      assert.ok(
        !content.includes("toLocaleDateString()"),
        `File ${relPath} must not use dynamic toLocaleDateString() to prevent hydration mismatches`
      );
      assert.ok(
        content.includes("Last updated:"),
        `File ${relPath} must include a stable Last updated disclosure`
      );
    }
  });

  await t.test("4. Legal and navigation convenience redirects in next.config.ts", async () => {
    assert.ok(typeof nextConfig.redirects === "function", "nextConfig must define redirects");
    const redirects = await nextConfig.redirects();

    const checkRedirect = (src, dest) => {
      const found = redirects.find((r) => r.source === src);
      assert.ok(found, `Redirect from ${src} must be defined`);
      assert.equal(found.destination, dest, `Redirect for ${src} must point to ${dest}`);
      assert.equal(found.permanent, true, `Redirect for ${src} must be permanent (301)`);
    };

    checkRedirect("/payment-methods", "/EMI");
    checkRedirect("/warranty", "/returns");
    checkRedirect("/delivery", "/shipping");
    checkRedirect("/about", "/contact");
    checkRedirect("/contact-us", "/contact");
    checkRedirect("/privacy-policy", "/privacy");
    checkRedirect("/terms-of-service", "/terms");
    checkRedirect("/order-tracking", "/track-order");
  });

  await t.test("5. Commerce policies binding support", async () => {
    const commerce = await getStorefrontCommerce();
    assert.ok(commerce.currencySymbol === "৳" || commerce.currency === "BDT");
    assert.ok(Array.isArray(commerce.deliveryZones));
    assert.ok(commerce.deliveryZones.length >= 2);
  });
});
