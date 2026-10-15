import fs from "fs";
import path from "path";

// Load .env.local if present without logging any secrets
if (fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

import { prisma } from "../lib/prisma.ts";

async function run() {
  console.log("=== Read-Only Inventory Gaps Report ===\n");

  try {
    // 1. Fetch existing inventory rows
    const inventoryRows = await prisma.inventory.findMany({
      select: {
        productId: true,
        sku: true,
        quantity: true,
        reserved: true,
      },
    });

    const inventoryByProductId = new Set(inventoryRows.map((r) => String(r.productId)));
    const inventoryBySku = new Set(inventoryRows.map((r) => r.sku.toLowerCase().trim()));

    // 2. Load catalogue laptops from app/data/products.json
    const productsPath = path.resolve("app/data/products.json");
    let laptops = [];
    if (fs.existsSync(productsPath)) {
      laptops = JSON.parse(fs.readFileSync(productsPath, "utf8"));
    }

    // 3. Load accessories from app/data/accessories.json
    const accessoriesPath = path.resolve("app/data/accessories.json");
    let accessories = [];
    if (fs.existsSync(accessoriesPath)) {
      accessories = JSON.parse(fs.readFileSync(accessoriesPath, "utf8"));
    }

    // 4. Find laptop gaps
    const laptopGaps = [];
    for (const p of laptops) {
      const prodIdStr = String(p.id);
      const skuStr = (p.sku || "").trim();
      const hasRow =
        inventoryByProductId.has(prodIdStr) ||
        (skuStr && inventoryBySku.has(skuStr.toLowerCase()));

      if (!hasRow) {
        const stockQty = typeof p.stock === "number" ? p.stock : (p.stock?.quantity ?? 0);
        laptopGaps.push({
          id: prodIdStr,
          sku: skuStr || "MISSING-SKU",
          name: p.name || "Unnamed",
          catalogueStock: stockQty,
        });
      }
    }

    // 5. Find accessory gaps
    const accessoryGaps = [];
    for (const a of accessories) {
      const accIdStr = String(a.id);
      const skuStr = (a.sku || "").trim();
      const hasRow =
        inventoryByProductId.has(accIdStr) ||
        (skuStr && inventoryBySku.has(skuStr.toLowerCase()));

      if (!hasRow) {
        accessoryGaps.push({
          id: accIdStr,
          sku: skuStr || "MISSING-SKU",
          name: a.name || "Unnamed",
          catalogueStock: a.stock ?? 0,
        });
      }
    }

    console.log(`Total Inventory rows in DB: ${inventoryRows.length}`);
    console.log(`Total Laptops in catalogue: ${laptops.length}`);
    console.log(`Total Accessories in catalogue: ${accessories.length}\n`);

    console.log(`--- Laptop SKUs with NO Inventory row (${laptopGaps.length}) ---`);
    if (laptopGaps.length === 0) {
      console.log("None (all laptops have inventory rows).");
    } else {
      console.table(
        laptopGaps.map((g) => ({
          ID: g.id,
          SKU: g.SKU || g.sku,
          Name: g.name.slice(0, 35),
          "Catalogue Stock": g.catalogueStock,
        }))
      );
    }

    console.log(`\n--- Accessory SKUs with NO Inventory row (${accessoryGaps.length}) ---`);
    if (accessoryGaps.length === 0) {
      console.log("None (all accessories have inventory rows).");
    } else {
      console.table(
        accessoryGaps.map((g) => ({
          ID: g.id,
          SKU: g.sku,
          Name: g.name.slice(0, 35),
          "Catalogue Stock": g.catalogueStock,
        }))
      );
    }

    console.log("\nSummary:");
    console.log(`- Affected Laptop SKUs: ${laptopGaps.length} / ${laptops.length}`);
    console.log(`- Affected Accessory SKUs: ${accessoryGaps.length} / ${accessories.length}`);
  } catch (error) {
    console.error("Error generating inventory report:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
