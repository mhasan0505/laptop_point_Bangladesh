import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.TEST_SERVER_URL || "http://localhost:3005";
const VIEWPORTS = [375, 768, 1280, 1536];

const PAGES = [
  { name: "home", path: "/" },
  { name: "shop", path: "/shop" },
  { name: "deals", path: "/deals" },
  { name: "accessories", path: "/accessories" },
  { name: "accessory-detail", path: "/accessories/hp-65w-usb-c-charger" },
  { name: "product-detail", path: "/product/hp-probook-440-g3-business-laptop" },
  { name: "compare", path: "/compare" },
  { name: "wishlist", path: "/wishlist" },
  { name: "cart", path: "/cart" },
  { name: "checkout", path: "/checkout" },
  { name: "contact", path: "/contact" },
  { name: "track-order", path: "/track-order" },
  { name: "privacy", path: "/privacy" },
  { name: "terms", path: "/terms" },
  { name: "returns", path: "/returns" },
  { name: "shipping", path: "/shipping" },
  { name: "admin-login", path: "/admin/login" },
];

async function runLayoutAudits() {
  console.log(`=== Running Playwright Responsive Layout & Tap Target Scans ===\n`);

  const screenshotDir = path.join(process.cwd(), "artifacts", "phase7_screenshots");
  await fs.mkdir(screenshotDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const results = {
    overflows: [],
    smallTapTargets: [],
    screenshots: [],
  };

  // Helper to audit a single page at a viewport
  async function auditPage(page, pageName, pagePath, width) {
    const height = width < 768 ? 667 : width < 1280 ? 1024 : 900;
    await page.setViewportSize({ width, height });

    await page.goto(`${BASE_URL}${pagePath}`, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });
    await page.waitForTimeout(1000);

    // 1. Check Horizontal Overflow
    const overflowInfo = await page.evaluate(() => {
      const doc = document.documentElement;
      const scrollWidth = doc.scrollWidth;
      const innerWidth = window.innerWidth;
      const hasOverflow = scrollWidth > innerWidth + 1; // 1px threshold for subpixel rounding

      let offendingElements = [];
      if (hasOverflow) {
        const all = document.querySelectorAll("*");
        for (const el of all) {
          const rect = el.getBoundingClientRect();
          if (rect.right > innerWidth + 2) {
            offendingElements.push({
              tag: el.tagName,
              className: el.className?.toString?.().slice(0, 50) || "",
              right: Math.round(rect.right),
              width: Math.round(rect.width),
            });
            if (offendingElements.length >= 3) break;
          }
        }
      }

      return { hasOverflow, scrollWidth, innerWidth, offendingElements };
    });

    if (overflowInfo.hasOverflow) {
      console.log(
        `  ⚠️ [OVERFLOW] ${pageName} @ ${width}px: scrollWidth=${overflowInfo.scrollWidth} > innerWidth=${overflowInfo.innerWidth}`
      );
      results.overflows.push({
        page: pageName,
        path: pagePath,
        width,
        scrollWidth: overflowInfo.scrollWidth,
        innerWidth: overflowInfo.innerWidth,
        offending: overflowInfo.offendingElements,
      });
    }

    // 2. Check Tap Targets < 44px
    const smallTargets = await page.evaluate(() => {
      const interactive = document.querySelectorAll(
        "a, button, input:not([type='hidden']), select, textarea, [role='button'], [tabindex='0']"
      );
      const small = [];

      for (const el of interactive) {
        // Skip hidden or collapsed elements
        const style = window.getComputedStyle(el);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.opacity === "0"
        ) {
          continue;
        }

        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.bottom < 0 || rect.top > window.innerHeight) continue; // outside initial viewport view

        if (rect.width < 44 || rect.height < 44) {
          const text = (el.innerText || el.getAttribute("aria-label") || el.getAttribute("title") || "").trim().slice(0, 30);
          small.push({
            tag: el.tagName.toLowerCase(),
            text,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            selector: el.className?.toString?.().slice(0, 40) || "",
          });
        }
      }
      return small.slice(0, 10); // keep top 10
    });

    if (smallTargets.length > 0) {
      results.smallTapTargets.push({
        page: pageName,
        path: pagePath,
        width,
        count: smallTargets.length,
        targets: smallTargets,
      });
    }

    // 3. Capture Screenshot
    const screenshotName = `${pageName}_${width}px.png`;
    const screenshotPath = path.join(screenshotDir, screenshotName);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    results.screenshots.push(screenshotName);
  }

  const context = await browser.newContext();
  const page = await context.newPage();

  // Audit public pages across all 4 viewports
  for (const p of PAGES) {
    console.log(`Auditing ${p.name} (${p.path})...`);
    for (const width of VIEWPORTS) {
      await auditPage(page, p.name, p.path, width);
    }
  }

  // Audit Admin Add Product Form (Laptop and Accessory mode)
  console.log(`Auditing Admin Add Product Form...`);
  // Log into admin via API
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@laptoppointbd.com",
      password: "StrongTestPassword123!",
    }),
  });

  const cookies = loginRes.headers.getSetCookie?.() || [];
  for (const cookieStr of cookies) {
    const [nameVal] = cookieStr.split(";");
    const [name, value] = nameVal.split("=");
    if (name && value) {
      await context.addCookies([
        {
          name: name.trim(),
          value: value.trim(),
          domain: "localhost",
          path: "/",
        },
      ]);
    }
  }

  for (const width of VIEWPORTS) {
    await auditPage(page, "admin-add-product-laptop", "/admin/products/new", width);
  }

  await browser.close();

  const reportPath = path.join(process.cwd(), "artifacts", "phase7-layout-report.json");
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log(`\n=== Responsive Layout Audit Complete ===`);
  console.log(`• Total Overflows Detected: ${results.overflows.length}`);
  console.log(`• Total Small Tap Target Warnings: ${results.smallTapTargets.length}`);
  console.log(`• Total Screenshots Captured: ${results.screenshots.length}`);
  console.log(`Report saved to ${reportPath}`);
}

runLayoutAudits().catch((err) => {
  console.error("Layout audit failed:", err);
  process.exit(1);
});
