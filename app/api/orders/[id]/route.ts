import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const VALID_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

// ─── GET /api/orders/[id] ─────────────────────────────────────────────────────
// Accepts either the cuid `id` or the human-readable `orderNumber`
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error("[GET /api/orders/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}

// ─── PATCH /api/orders/[id] ───────────────────────────────────────────────────
// Body: { status, note?, trackingNumber? }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      status: string;
      note?: string;
      trackingNumber?: string;
    };
    const { status, note, trackingNumber } = body;

    if (!status || !(VALID_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Accept both cuid and orderNumber
    const existing = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: {
        status,
        ...(trackingNumber ? { trackingNumber } : {}),
        ...(status === "Delivered" ? { deliveredAt: new Date() } : {}),
        statusHistory: {
          create: {
            status,
            note: note ?? `Status updated to ${status}`,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/orders/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
