/**
 * Repairs the DB: marks old ProductOverride rows with duplicate numeric IDs as deleted.
 * Only the "winning" SKU (the one also present in products.json) is kept active.
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

  // Build set of canonical SKUs (those in the clean products.json)
  const canonicalSkus = new Set(products.map(p => p.sku.toLowerCase()));
  console.log(`Canonical SKUs from products.json: ${canonicalSkus.size}`);

  // Get all active non-system overrides from DB
  const res = await pool.query(
    `SELECT id, sku FROM "ProductOverride" 
     WHERE "isDeleted" = false 
     AND sku NOT LIKE 'system:%' 
     AND sku NOT LIKE 'setting:%'`
  );

  // Group overrides by numeric ID to find conflicts
  const byNumericId = new Map();
  for (const row of res.rows) {
    const numId = String(row.id).replace(/\D/g, ''); // strip non-digits
    const id = isNaN(Number(row.id)) ? row.id : row.id; // use raw id
    
    if (!byNumericId.has(id)) byNumericId.set(id, []);
    byNumericId.get(id).push(row.sku);
  }

  // Find duplicate numeric IDs — those where same DB id has multiple SKU overrides
  // but since DB id is the string numeric id, let's check by numeric value
  const byNumId2 = new Map();
  for (const row of res.rows) {
    const numId = String(Number(row.id)); // normalize numeric id string
    if (isNaN(Number(row.id))) continue; // skip system rows
    if (!byNumId2.has(numId)) byNumId2.set(numId, []);
    byNumId2.get(numId).push(row.sku);
  }

  let fixCount = 0;
  for (const [numId, skus] of byNumId2) {
    if (skus.length <= 1) continue;
    
    console.log(`\nMultiple overrides for numeric id=${numId}: ${skus.join(', ')}`);
    
    // Keep the one in products.json (canonical); delete all others
    for (const sku of skus) {
      if (!canonicalSkus.has(sku.toLowerCase())) {
        console.log(`  → Marking as deleted (not in products.json): ${sku}`);
        await pool.query(
          'UPDATE "ProductOverride" SET "isDeleted" = true WHERE sku = $1',
          [sku]
        );
        fixCount++;
      } else {
        console.log(`  → Keeping (in products.json): ${sku}`);
      }
    }
  }

  if (fixCount === 0) {
    console.log('\n✅ No duplicate overrides found in DB');
  } else {
    console.log(`\n✅ Marked ${fixCount} ghost override(s) as deleted`);
  }

  await pool.end();
}

main().catch(err => {
  console.error(err);
  pool.end();
});
