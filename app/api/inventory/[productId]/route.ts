import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ─── GET /api/inventory/[productId] ──────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const { productId } = await params;
    const record = await prisma.inventory.findUnique({ where: { productId } });
    if (!record) {
      return NextResponse.json(
        { error: "Inventory record not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(record);
  } catch (error) {
    console.error("[GET /api/inventory/[productId]]", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 },
    );
  }
}

// ─── PATCH /api/inventory/[productId] ────────────────────────────────────────
// Body: { quantity?: number } — set absolute stock level
//    OR { delta?: number }   — relative adjust (positive = restock, negative = shrink)
// Optional: { reason?: string, note?: string }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const { productId } = await params;
    const body = (await request.json()) as {
      quantity?: number;
      delta?: number;
      reason?: string;
      note?: string;
    };
    const { quantity, delta, reason = "adjustment", note } = body;

    if (quantity === undefined && delta === undefined) {
      return NextResponse.json(
        {
          error:
            "Provide either 'quantity' (absolute set) or 'delta' (relative adjustment)",
        },
        { status: 400 },
      );
    }

    const existing = await prisma.inventory.findUnique({
      where: { productId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Inventory record not found" },
        { status: 404 },
      );
    }

    const newQuantity =
      quantity !== undefined ? quantity : existing.quantity + delta!;

    if (newQuantity < 0) {
      return NextResponse.json(
        { error: "Stock cannot go below 0" },
        { status: 400 },
      );
    }

    const [updated] = await prisma.$transaction([
      prisma.inventory.update({
        where: { productId },
        data: { quantity: newQuantity },
      }),
      prisma.inventoryLog.create({
        data: {
          productId,
          sku: existing.sku,
          delta: newQuantity - existing.quantity,
          reason,
          note: note ?? `Stock adjusted: ${existing.quantity} → ${newQuantity}`,
        },
      }),
    ]);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/inventory/[productId]]", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 },
    );
  }
}
