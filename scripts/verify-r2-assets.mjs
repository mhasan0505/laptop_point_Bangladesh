import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const manifestPath = path.join(projectRoot, "app", "data", "r2-migration-manifest.json");

if (!fs.existsSync(manifestPath)) {
  console.error("❌ Manifest file not found:", manifestPath);
  console.error("Run `node scripts/migrate-assets-to-r2.mjs` first.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
const entries = Object.entries(manifest);

console.log("==================================================");
console.log("🔍 CLOUDFLARE R2 ASSETS HEALTH VERIFICATION");
console.log("==================================================");
console.log(`Checking ${entries.length} assets against remote Cloudflare R2 CDN...\n`);

let passed = 0;
let failed = 0;
const CONCURRENCY = 8;

async function checkUrl(key, item) {
  try {
    const res = await fetch(item.publicUrl, { method: "HEAD", signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      passed++;
      return { ok: true, key, url: item.publicUrl };
    } else {
      failed++;
      return { ok: false, key, url: item.publicUrl, status: res.status };
    }
  } catch (err) {
    failed++;
    return { ok: false, key, url: item.publicUrl, error: err?.message || String(err) };
  }
}

async function run() {
  const queue = [...entries];
  const results = [];

  async function worker() {
    while (queue.length > 0) {
      const [key, item] = queue.shift();
      const r = await checkUrl(key, item);
      results.push(r);
      if (!r.ok) {
        console.error(`  ❌ Failed: ${r.url} (${r.status || r.error})`);
      }
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, entries.length) }, () => worker());
  await Promise.all(workers);

  console.log("\n==================================================");
  console.log("📊 VERIFICATION SUMMARY");
  console.log("==================================================");
  console.log(`  Total Checked: ${entries.length}`);
  console.log(`  Passed (200 OK): ${passed}`);
  console.log(`  Failed:          ${failed}`);

  if (failed === 0) {
    console.log("\n✅ All assets are accessible and healthy on Cloudflare R2!");
  } else {
    console.error(`\n⚠️  ${failed} assets failed verification. Do NOT delete local copies yet.`);
    process.exit(1);
  }
}

run();
