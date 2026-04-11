import * as dotenv from "dotenv";
import "dotenv/config";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

// Dynamic import after env is loaded
const { prisma } = await import("../lib/prisma.ts");

// Show current status breakdown
const grouped = await prisma.product.groupBy({
  by: ["status"],
  _count: { _all: true },
});
console.log("Current product statuses:", JSON.stringify(grouped, null, 2));

// Publish everything that isn't archived
const result = await prisma.product.updateMany({
  where: { status: { not: "archived" } },
  data: { status: "published" },
});

console.log(`Updated ${result.count} products to published.`);
await prisma.$disconnect();
