import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { prisma } from "../lib/prisma.ts";

async function runFunctionalTests() {
  console.log("=== BATCH 3 FUNCTIONAL VERIFICATION: PRISMA NEON ADAPTER ===");
  
  // 1. Test Read: Product Overrides
  console.log("\n1. Testing read on ProductOverride table...");
  const t0 = Date.now();
  const overrides = await prisma.productOverride.findMany({
    take: 5,
    select: { sku: true, isDeleted: true },
  });
  console.log(`✓ Read ${overrides.length} overrides in ${Date.now() - t0}ms`);

  // 2. Test Read: Inventory
  console.log("\n2. Testing read on Inventory table...");
  const t1 = Date.now();
  const inventory = await prisma.inventory.findMany({
    take: 5,
    select: { productId: true, sku: true, quantity: true },
  });
  console.log(`✓ Read ${inventory.length} inventory records in ${Date.now() - t1}ms`);
  if (inventory.length > 0) {
    console.log(`  Sample item: SKU=${inventory[0].sku}, Qty=${inventory[0].quantity}`);
  }

  // 3. Test Interactive Transaction & Write: Quantity Read-Modify-Write
  if (inventory.length > 0) {
    const testSku = inventory[0].sku;
    const initialQty = inventory[0].quantity;
    console.log(`\n3. Testing interactive transaction write on SKU: ${testSku} (Initial Qty: ${initialQty})...`);
    
    const t2 = Date.now();
    // Simulate stock update like in /api/inventory/[productId]
    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.inventory.update({
        where: { sku: testSku },
        data: { quantity: initialQty + 1 },
      });
      // Revert back immediately to keep state pristine
      const reverted = await tx.inventory.update({
        where: { sku: testSku },
        data: { quantity: initialQty },
      });
      return reverted;
    }, {
      maxWait: 15000,
      timeout: 15000,
    });
    console.log(`✓ Interactive transaction read-modify-revert succeeded in ${Date.now() - t2}ms`);
    console.log(`  Final Qty restored to: ${updated.quantity}`);
  }

  // 4. Test Orders Read
  console.log("\n4. Testing read on Orders table...");
  const t3 = Date.now();
  const ordersCount = await prisma.order.count();
  console.log(`✓ Orders count: ${ordersCount} in ${Date.now() - t3}ms`);

  console.log("\n=== ALL DATABASE OPERATIONS COMPLETED SUCCESSFULLY ON NEON ADAPTER ===");
}

runFunctionalTests()
  .catch((err) => {
    console.error("\n❌ Functional verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
