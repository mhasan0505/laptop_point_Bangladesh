import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ─── GET /api/inventory ───────────────────────────────────────────────────────
// Returns all inventory records sorted by quantity asc (low stock first)
export async function GET() {
  try {
    const inventory = await prisma.inventory.findMany({
      orderBy: { quantity: "asc" },
    });
    return NextResponse.json(inventory);
  } catch (error) {
    console.error("[GET /api/inventory]", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 },
    );
  }
}
