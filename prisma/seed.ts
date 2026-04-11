/**
 * Prisma seed script — populates Product catalog + Inventory from products.json.
 * Run once after your first migration:
 *   pnpm prisma:seed
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { Pool } from "pg";
import productsRaw from "../app/data/products.json";
import type { RawProduct } from "../types/raw-product";

dotenv.config({ path: ".env.local" });

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
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

  console.log(`Seeding catalog for ${products.length} products…`);

  for (const product of products) {
    if (seenSkus.has(product.sku)) {
      skippedDuplicates += 1;
      console.warn(`Skipping duplicate SKU in products.json: ${product.sku}`);
      continue;
    }

    seenSkus.add(product.sku);

    await prisma.$transaction(async (tx) => {
      const createdOrUpdated = await tx.product.upsert({
        where: { sku: product.sku },
        update: {
          legacyId: String(product.id),
          slug: slugify(`${product.name}-${product.sku}`),
          name: product.name,
          brand: product.brand,
          model: product.model,
          category: product.category,
          condition: product.condition,
          grade: product.grade,
          salePrice: product.pricing.sale_price,
          marketPrice: product.pricing.market_price,
          discountPercentage: product.pricing.discount_percentage ?? 0,
          taxIncluded: product.pricing.tax_included,
          processor: product.specs.processor,
          ram: product.specs.ram,
          storage: product.specs.storage,
          displaySize: product.specs.display.size,
          displayResolution: product.specs.display.resolution,
          displayType: product.specs.display.type,
          touchscreen: product.specs.display.touchscreen,
          graphics: product.specs.graphics,
          ports: product.specs.ports,
          weight: product.specs.weight,
          os: product.specs.os,
          descriptionShort: product.description.short,
          descriptionFull: product.description.full,
          status: "published",
        },
        create: {
          legacyId: String(product.id),
          sku: product.sku,
          slug: slugify(`${product.name}-${product.sku}`),
          name: product.name,
          brand: product.brand,
          model: product.model,
          category: product.category,
          condition: product.condition,
          grade: product.grade,
          salePrice: product.pricing.sale_price,
          marketPrice: product.pricing.market_price,
          discountPercentage: product.pricing.discount_percentage ?? 0,
          taxIncluded: product.pricing.tax_included,
          processor: product.specs.processor,
          ram: product.specs.ram,
          storage: product.specs.storage,
          displaySize: product.specs.display.size,
          displayResolution: product.specs.display.resolution,
          displayType: product.specs.display.type,
          touchscreen: product.specs.display.touchscreen,
          graphics: product.specs.graphics,
          ports: product.specs.ports,
          weight: product.specs.weight,
          os: product.specs.os,
          descriptionShort: product.description.short,
          descriptionFull: product.description.full,
          status: "published",
        },
      });

      await tx.productFeature.deleteMany({
        where: { productId: createdOrUpdated.id },
      });
      if (product.features.length > 0) {
        await tx.productFeature.createMany({
          data: product.features.map((label, index) => ({
            productId: createdOrUpdated.id,
            label,
            position: index,
          })),
        });
      }

      await tx.productImage.deleteMany({
        where: { productId: createdOrUpdated.id },
      });
      if (product.images.length > 0) {
        await tx.productImage.createMany({
          data: product.images.map((url, index) => ({
            productId: createdOrUpdated.id,
            url,
            position: index,
          })),
        });
      }

      await tx.inventory.upsert({
        where: { sku: product.sku },
        update: {
          productId: createdOrUpdated.id,
          name: product.name,
          quantity: product.stock?.quantity ?? 0,
        },
        create: {
          productId: createdOrUpdated.id,
          sku: product.sku,
          name: product.name,
          quantity: product.stock?.quantity ?? 0,
          reserved: 0,
        },
      });
    });
  }

  console.log("✓ Product catalog + inventory seeded.");
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
