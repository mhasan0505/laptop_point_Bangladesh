import { chromium } from "playwright";
import lighthouse from "lighthouse";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.TEST_SERVER_URL || "http://localhost:3005";

const PAGES = [
  { name: "home", url: `${BASE_URL}/` },
  { name: "shop", url: `${BASE_URL}/shop` },
  { name: "product", url: `${BASE_URL}/product/hp-probook-440-g3-business-laptop` },
  { name: "accessories", url: `${BASE_URL}/accessories` },
];

async function runLighthouseAudits() {
  console.log(`=== Running Lighthouse Mobile Audits against ${BASE_URL} ===\n`);

  const results = [];

  for (const page of PAGES) {
    console.log(`Auditing ${page.name} (${page.url}) ...`);
    // Launch Chrome with a clean debugging port for each run
    const browser = await chromium.launch({
      args: ["--remote-debugging-port=9222"],
      headless: true,
    });

    try {
      const runnerResult = await lighthouse(page.url, {
        port: 9222,
        output: "json",
        logLevel: "error",
        formFactor: "mobile",
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
          disabled: false,
        },
        throttlingMethod: "simulate",
      });

      const categories = runnerResult.lhr.categories;
      const audits = runnerResult.lhr.audits;

      const perf = Math.round((categories.performance?.score || 0) * 100);
      const a11y = Math.round((categories.accessibility?.score || 0) * 100);
      const bp = Math.round((categories["best-practices"]?.score || 0) * 100);
      const seo = Math.round((categories.seo?.score || 0) * 100);

      const lcp = audits["largest-contentful-paint"]?.displayValue || "N/A";
      const cls = audits["cumulative-layout-shift"]?.displayValue || "0";

      console.log(`✓ ${page.name}:`);
      console.log(`   Performance: ${perf}/100 (Target: >= 85)`);
      console.log(`   Accessibility: ${a11y}/100 (Target: >= 95)`);
      console.log(`   Best Practices: ${bp}/100 (Target: >= 95)`);
      console.log(`   SEO: ${seo}/100 (Target: >= 95)`);
      console.log(`   LCP: ${lcp} (Target: < 2.5s)`);
      console.log(`   CLS: ${cls} (Target: < 0.05)`);

      results.push({
        name: page.name,
        url: page.url,
        scores: {
          performance: perf,
          accessibility: a11y,
          bestPractices: bp,
          seo: seo,
        },
        metrics: {
          lcp,
          cls,
          fcp: audits["first-contentful-paint"]?.displayValue,
          speedIndex: audits["speed-index"]?.displayValue,
          tbt: audits["total-blocking-time"]?.displayValue,
        },
      });
    } catch (err) {
      console.error(`❌ Lighthouse failed on ${page.name}:`, err.message);
      results.push({
        name: page.name,
        url: page.url,
        error: err.message,
      });
    } finally {
      await browser.close();
      // wait 2 seconds between runs
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  const reportPath = path.join(process.cwd(), "artifacts", "phase7-lighthouse-report.json");
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

  console.log(`\nLighthouse report written to ${reportPath}`);
}

runLighthouseAudits().catch((err) => {
  console.error("Lighthouse suite error:", err);
  process.exit(1);
});
