/**
 * Prisma seed script — populates the Inventory table from products.json.
 * Run once after your first migration:
 *   pnpm prisma:seed
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { prisma } from "../lib/prisma";
import productsRaw from "../app/data/products.json";

interface RawProduct {
  id: number;
  sku: string;
  name: string;
  stock: { quantity: number };
}

async function main() {
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
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
