import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ─── GET /api/inventory ───────────────────────────────────────────────────────
// Returns all inventory records sorted by quantity asc (low stock first)
export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdminSession(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
