require('dotenv').config({ path: './.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  // The DB has id=3 -> sku=HP-ELITEBOOK-840-G6 (old SKU from a rename)
  // products.json has id=3 -> sku=HP-840G6-003 (the canonical one)
  // Mark the ghost override as deleted
  const result = await pool.query(
    'UPDATE "ProductOverride" SET "isDeleted" = true WHERE id = \'3\' AND sku = \'HP-ELITEBOOK-840-G6\'',
  );
  console.log(`Updated ${result.rowCount} row(s) for HP-ELITEBOOK-840-G6 ghost override`);

  // Also fix id=32 -> MS-SL3-I5-021 in DB is wrong (should be LEN-T490S-I5-032 for id=32)
  // Actually MS-SL3-I5-021 is a different product: the Microsoft Surface Laptop 3 i5
  // Let's check what the actual ID of MS-SL3 should be
  const res32 = await pool.query(
    'SELECT id, sku FROM "ProductOverride" WHERE id = \'32\''
  );
  console.log('id=32 override:', res32.rows);

  await pool.end();
}

main().catch(err => {
  console.error(err);
  pool.end();
});
