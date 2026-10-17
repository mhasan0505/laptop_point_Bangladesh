import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Register @/ module alias loader
await import("../lib/register.mjs");

const { default: sitemap } = await import("../../app/sitemap.ts");
const { default: robots } = await import("../../app/robots.ts");

test("Phase 7: UX, Accessibility, Performance, and SEO Verification", async (t) => {
  await t.test("1. Sitemap covers all key pages with valid metadata", async () => {
    const entries = await sitemap();
    assert.ok(Array.isArray(entries), "Sitemap must return an array of entries");
    assert.ok(entries.length >= 10, "Sitemap must contain core static routes and products");

    const urls = new Set(entries.map((e) => e.url));
    const baseUrl = "https://laptoppointbd.com";

    const requiredUrls = [
      baseUrl,
      `${baseUrl}/shop`,
      `${baseUrl}/accessories`,
      `${baseUrl}/deals`,
      `${baseUrl}/power-deal`,
      `${baseUrl}/track-order`,
      `${baseUrl}/contact`,
      `${baseUrl}/terms`,
      `${baseUrl}/privacy`,
      `${baseUrl}/returns`,
      `${baseUrl}/shipping`,
      `${baseUrl}/EMI`,
    ];

    for (const req of requiredUrls) {
      assert.ok(urls.has(req), `Sitemap must include ${req}`);
    }

    // Verify changeFrequency and priority format
    for (const entry of entries) {
      assert.ok(entry.url.startsWith("https://laptoppointbd.com"), "Entry url must use canonical https protocol");
      assert.ok(entry.priority === undefined || (entry.priority >= 0 && entry.priority <= 1), "Priority must be 0.0 - 1.0");
      assert.ok(
        entry.changeFrequency === undefined ||
          ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].includes(entry.changeFrequency),
        "Change frequency must be valid sitemap enum"
      );
    }
  });

  await t.test("2. Robots.txt protects private and sensitive routes", () => {
    const robotsConfig = robots();
    assert.ok(robotsConfig.rules, "Robots rules must be defined");
    assert.equal(robotsConfig.sitemap, "https://laptoppointbd.com/sitemap.xml", "Sitemap URL must match canonical location");

    const rule = Array.isArray(robotsConfig.rules) ? robotsConfig.rules.find((r) => r.userAgent === "*") : robotsConfig.rules;
    assert.ok(rule, "Wildcard userAgent rule must be present");
    assert.ok(rule.disallow.includes("/admin/"), "Must disallow /admin/");
    assert.ok(rule.disallow.includes("/api/"), "Must disallow /api/");
    assert.ok(rule.disallow.includes("/cart/"), "Must disallow /cart/");
    assert.ok(rule.disallow.includes("/checkout/"), "Must disallow /checkout/");
  });

  await t.test("3. Skip to main content link and landmark id in layout", () => {
    const layoutContent = fs.readFileSync(path.join(process.cwd(), "app/(main)/layout.tsx"), "utf-8");
    assert.ok(layoutContent.includes('href="#main-content"'), "Layout must provide a skip to main content link");
    assert.ok(layoutContent.includes('id="main-content"'), "Layout must define id='main-content' on main element");
  });

  await t.test("4. Sticky mobile navigation has no broken customer links", () => {
    const mobileBarContent = fs.readFileSync(
      path.join(process.cwd(), "components/application/StickyMobileBar.tsx"),
      "utf-8"
    );
    assert.ok(!mobileBarContent.includes('href: "/login"'), "StickyMobileBar must not have dead /login link");
    assert.ok(mobileBarContent.includes('href: "/track-order"'), "StickyMobileBar must include /track-order link");
  });

  await t.test("5. Modal dialogs implement ARIA standards", () => {
    const pdClientContent = fs.readFileSync(
      path.join(process.cwd(), "components/product/ProductDetailsClient.tsx"),
      "utf-8"
    );
    assert.ok(pdClientContent.includes('role="dialog"'), "Review modal must have role='dialog'");
    assert.ok(pdClientContent.includes('aria-modal="true"'), "Review modal must have aria-modal='true'");
    assert.ok(pdClientContent.includes('aria-labelledby="review-modal-title"'), "Review modal must have aria-labelledby");
  });

  await t.test("6. Organization Schema has valid geo and brand asset paths", () => {
    const orgSchemaContent = fs.readFileSync(
      path.join(process.cwd(), "components/seo/OrganizationSchemaMeta.tsx"),
      "utf-8"
    );
    assert.ok(orgSchemaContent.includes("/Logo.webp"), "Organization schema must reference /Logo.webp");
    assert.ok(orgSchemaContent.includes("/Hero_Image.png"), "Organization schema must reference /Hero_Image.png");
    assert.ok(!orgSchemaContent.includes("/icons/logo.png"), "Organization schema must not reference legacy /icons/logo.png");
    assert.ok(orgSchemaContent.includes("GeoCoordinates"), "Organization schema must include GeoCoordinates");
  });
});
