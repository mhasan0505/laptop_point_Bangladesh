import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";

// ─── GET /api/inventory ───────────────────────────────────────────────────────
// Returns all inventory records sorted by quantity asc (low stock first)
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
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
