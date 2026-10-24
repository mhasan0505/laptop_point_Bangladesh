import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.TEST_SERVER_URL || "http://localhost:3005";

const PAGES_TO_AUDIT = [
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

async function runAxeAudits() {
  console.log(`=== Running Real Axe-Core Accessibility Audits against ${BASE_URL} ===\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const auditReport = [];

  for (const item of PAGES_TO_AUDIT) {
    const url = `${BASE_URL}${item.path}`;
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
      // Wait for any client-side hydrated content
      await page.waitForTimeout(1000);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const violations = accessibilityScanResults.violations;
      const critical = violations.filter((v) => v.impact === "critical");
      const serious = violations.filter((v) => v.impact === "serious");
      const moderate = violations.filter((v) => v.impact === "moderate");
      const minor = violations.filter((v) => v.impact === "minor");

      console.log(
        `• ${item.name} (${item.path}): ${violations.length} violation(s) [Critical: ${critical.length}, Serious: ${serious.length}, Moderate: ${moderate.length}, Minor: ${minor.length}]`
      );

      if (violations.length > 0) {
        for (const v of violations) {
          console.log(`    - [${v.impact?.toUpperCase()}] ${v.id}: ${v.description} (${v.nodes.length} occurrences)`);
        }
      }

      auditReport.push({
        name: item.name,
        path: item.path,
        url,
        violationsCount: violations.length,
        critical: critical.length,
        serious: serious.length,
        moderate: moderate.length,
        minor: minor.length,
        violations: violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          help: v.help,
          nodes: v.nodes.length,
          selector: v.nodes[0]?.target?.join(", "),
        })),
      });
    } catch (err) {
      console.error(`❌ Failed auditing ${item.name} (${item.path}):`, err.message);
      auditReport.push({
        name: item.name,
        path: item.path,
        error: err.message,
      });
    }
  }

  await browser.close();

  const reportPath = path.join(process.cwd(), "artifacts", "phase7-axe-report.json");
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(auditReport, null, 2), "utf8");

  console.log(`\n✓ Axe report saved to ${reportPath}`);
  return auditReport;
}

runAxeAudits().catch((err) => {
  console.error("Axe audit error:", err);
  process.exit(1);
});
