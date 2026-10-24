require('dotenv').config({ path: './.env.local' });
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const baseProducts = JSON.parse(fs.readFileSync('./app/data/products.json', 'utf8'));
  const productMap = new Map();

  for (const product of baseProducts) {
    const skuKey = (product.sku || String(product.id || '')).toLowerCase();
    if (skuKey) {
      productMap.set(skuKey, { ...product });
    }
  }

  const overrides = await pool.query('SELECT sku, "isDeleted", data FROM "ProductOverride"');
  for (const item of overrides.rows) {
    if (!item.sku || item.sku.startsWith('system:') || item.sku.startsWith('setting:')) {
      continue;
    }
    const key = item.sku.toLowerCase();
    if (item.isDeleted) {
      productMap.delete(key);
    } else if (item.data) {
      productMap.set(key, item.data);
    }
  }

  const merged = Array.from(productMap.values());
  console.log(`Total merged products: ${merged.length}`);

  const idMap = new Map();
  const nameMap = new Map();
  const duplicates = [];

  for (const p of merged) {
    const idStr = String(p.id);
    if (idMap.has(idStr)) {
      duplicates.push({
        reason: 'Duplicate ID',
        id: p.id,
        first: { sku: idMap.get(idStr).sku, name: idMap.get(idStr).name },
        second: { sku: p.sku, name: p.name }
      });
    } else {
      idMap.set(idStr, p);
    }

    const cleanName = (p.name || '').trim().toLowerCase();
    if (cleanName && nameMap.has(cleanName)) {
      duplicates.push({
        reason: 'Duplicate Name',
        first: { id: nameMap.get(cleanName).id, sku: nameMap.get(cleanName).sku, name: nameMap.get(cleanName).name },
        second: { id: p.id, sku: p.sku, name: p.name }
      });
    } else if (cleanName) {
      nameMap.set(cleanName, p);
    }
  }

  console.log('Duplicates in merged products:');
  console.log(JSON.stringify(duplicates, null, 2));

  await pool.end();
}

main().catch(err => {
  console.error(err);
  pool.end();
});
