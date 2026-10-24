/**
 * Cleans up products.json by removing all duplicate entries.
 * Rules:
 *   - If the SAME ID appears more than once, keep only the entry saved in the DB
 *     (i.e. the one whose SKU exists as a non-deleted ProductOverride).
 *     If no DB override exists for any, keep the LAST occurrence (newest edit).
 *   - If the SAME SKU appears more than once, keep only the first.
 */
require('dotenv').config({ path: './.env.local' });
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const filePath = 'd:/ARTYX DIGITAL/lp-new-version/app/data/products.json';
  const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Fetch all non-deleted product overrides from DB
  const res = await pool.query(
    'SELECT sku, id FROM "ProductOverride" WHERE "isDeleted" = false AND sku NOT LIKE \'system:%\' AND sku NOT LIKE \'setting:%\''
  );
  const dbSkuSet = new Set(res.rows.map(r => r.sku.toLowerCase()));
  console.log(`DB has ${dbSkuSet.size} active product overrides`);

  // Group by ID
  const byId = new Map();
  for (const p of products) {
    const id = String(p.id);
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(p);
  }

  const cleaned = [];
  const seenSkus = new Set();
  const seenIds = new Set();

  for (const [id, group] of byId) {
    if (group.length === 1) {
      // No duplicate ID
      const p = group[0];
      if (!seenSkus.has(p.sku.toLowerCase())) {
        seenSkus.add(p.sku.toLowerCase());
        seenIds.add(id);
        cleaned.push(p);
      }
    } else {
      // Multiple products share the same ID - pick the DB-backed one
      console.log(`\nDuplicate ID ${id} found with ${group.length} entries:`);
      group.forEach(g => console.log(`  sku: ${g.sku}, name: ${g.name.slice(0, 60)}`));
      
      // Prefer the one that exists in DB
      const dbBacked = group.find(p => dbSkuSet.has(p.sku.toLowerCase()));
      const winner = dbBacked || group[group.length - 1]; // fallback to last = newest edit
      
      console.log(`  → Keeping: sku=${winner.sku}`);
      
      if (!seenSkus.has(winner.sku.toLowerCase())) {
        seenSkus.add(winner.sku.toLowerCase());
        seenIds.add(id);
        cleaned.push(winner);
      }
    }
  }

  // Sort by numeric ID to keep things orderly
  cleaned.sort((a, b) => Number(a.id) - Number(b.id));

  const before = products.length;
  const after = cleaned.length;
  console.log(`\n✅ Cleaned: ${before} → ${after} products (removed ${before - after} duplicates)`);

  // Write back
  fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2), 'utf8');
  console.log('✅ products.json updated');

  await pool.end();
}

main().catch(err => {
  console.error(err);
  pool.end();
});
