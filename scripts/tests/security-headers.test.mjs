import test from "node:test";
import assert from "node:assert/strict";

// Register module alias loader
await import("../lib/register.mjs");

const { default: nextConfig } = await import("../../next.config.ts");

test("Security Headers in next.config.ts", async (t) => {
  assert.ok(typeof nextConfig.headers === "function", "nextConfig must define a headers function");

  const headerRules = await nextConfig.headers();
  const globalRule = headerRules.find((r) => r.source === "/:path*");

  assert.ok(globalRule, "Must define a global header rule matching /:path*");
  const headers = new Map(globalRule.headers.map((h) => [h.key, h.value]));

  await t.test("1. Content-Security-Policy-Report-Only is configured with required allow-lists", () => {
    const csp = headers.get("Content-Security-Policy-Report-Only");
    assert.ok(csp, "CSP report-only header must be present");
    assert.ok(csp.includes("https://ik.imagekit.io"), "CSP must allow ImageKit");
    assert.ok(csp.includes("https://www.youtube-nocookie.com"), "CSP must allow YouTube nocookie");
    assert.ok(csp.includes("https://www.googletagmanager.com"), "CSP must allow GTM");
    assert.ok(csp.includes("https://www.google-analytics.com"), "CSP must allow GA4");
    assert.ok(csp.includes("https://connect.facebook.net"), "CSP must allow Meta Pixel");
    assert.ok(csp.includes("*.tile.openstreetmap.org"), "CSP must allow Leaflet OSM tiles");
    assert.ok(csp.includes("frame-ancestors 'self'"), "CSP must restrict frame-ancestors to self");
  });

  await t.test("2. Strict-Transport-Security (HSTS) is enabled", () => {
    const hsts = headers.get("Strict-Transport-Security");
    assert.ok(hsts, "HSTS must be present");
    assert.ok(hsts.includes("max-age="), "HSTS must specify max-age");
    assert.ok(hsts.includes("includeSubDomains"), "HSTS must include subdomains");
  });

  await t.test("3. MIME sniffing and clickjacking defenses are active", () => {
    assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
    assert.equal(headers.get("X-Frame-Options"), "SAMEORIGIN");
    assert.equal(headers.get("Referrer-Policy"), "strict-origin-when-cross-origin");
  });

  await t.test("4. Permissions-Policy restricts sensitive device APIs", () => {
    const pp = headers.get("Permissions-Policy");
    assert.ok(pp, "Permissions-Policy must be set");
    assert.ok(pp.includes("camera=()"));
    assert.ok(pp.includes("microphone=()"));
    assert.ok(pp.includes("browsing-topics=()"));
  });
});
