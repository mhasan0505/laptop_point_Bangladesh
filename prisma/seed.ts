/**
 * Prisma seed script — populates the Inventory table from products.json.
 * Run once after your first migration:
 *   pnpm prisma:seed
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { Pool } from "pg";
import productsRaw from "../app/data/products.json";

dotenv.config({ path: ".env.local" });

interface RawProduct {
  id: number;
  sku: string;
  name: string;
  stock: { quantity: number };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

  const products = productsRaw as RawProduct[];
  const seenSkus = new Set<string>();
  let skippedDuplicates = 0;

  console.log(`Seeding inventory for ${products.length} products…`);

  for (const product of products) {
    if (seenSkus.has(product.sku)) {
      skippedDuplicates += 1;
      console.warn(`Skipping duplicate SKU in products.json: ${product.sku}`);
      continue;
    }

    seenSkus.add(product.sku);

    await prisma.inventory.upsert({
      where: { productId: String(product.id) },
      update: {}, // Don't overwrite existing stock levels
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
    console.log(
      `Skipped ${skippedDuplicates} duplicate SKU entr${skippedDuplicates === 1 ? "y" : "ies"}.`,
    );
  }
  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
