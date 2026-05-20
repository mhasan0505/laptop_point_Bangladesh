const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config({ path: ".env.local" });

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const productsRaw = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../app/data/products.json"), "utf8")
  );

  console.log(`Seeding inventory for ${productsRaw.length} products…`);
  const seenSkus = new Set();
  let skippedDuplicates = 0;

  for (const product of productsRaw) {
    if (seenSkus.has(product.sku)) {
      skippedDuplicates += 1;
      continue;
    }
    seenSkus.add(product.sku);

    await prisma.inventory.upsert({
      where: { productId: String(product.id) },
      update: {},
      create: {
        productId: String(product.id),
        sku: product.sku,
        name: product.name,
        quantity: product.stock?.quantity ?? 0,
        reserved: 0,
      },
    });
  }

  console.log("✓ Inventory seeded.");
  if (skippedDuplicates > 0) {
    console.log(`Skipped ${skippedDuplicates} duplicate SKU entries.`);
  }
  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
