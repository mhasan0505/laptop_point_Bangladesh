import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  isValidOrderStatus,
  STOCK_RELEASING_STATUSES,
  VALID_STATUSES,
} from "@/lib/orders";
import { NextRequest, NextResponse } from "next/server";

// ─── GET /api/orders/[id] ─────────────────────────────────────────────────────
// Accepts either the cuid `id` or the human-readable `orderNumber` (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
// Moving an order to Cancelled/Returned restores its stock (per-item),
// because stock is hard-decremented at order time.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    let body: { status?: unknown; note?: unknown; trackingNumber?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const status = typeof body.status === "string" ? body.status : "";
    const note = typeof body.note === "string" ? body.note.trim() : undefined;
    const trackingNumber =
      typeof body.trackingNumber === "string"
        ? body.trackingNumber.trim()
        : undefined;

    if (!isValidOrderStatus(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Accept both cuid and orderNumber.
      const existing = await tx.order.findFirst({
        where: { OR: [{ id }, { orderNumber: id }] },
        include: {
          items: {
            where: { inventoryDeducted: true },
            select: {
              id: true,
              productId: true,
              sku: true,
              name: true,
              quantity: true,
            },
          },
        },
      });
      if (!existing) return null;

      const previousStatus = existing.status;
      if (
        STOCK_RELEASING_STATUSES.has(previousStatus) &&
        !STOCK_RELEASING_STATUSES.has(status)
      ) {
        throw new Error(
          `Cannot reactivate a ${previousStatus} order — stock was already restored`,
        );
      }

      const releasingStock =
        STOCK_RELEASING_STATUSES.has(status) &&
        !STOCK_RELEASING_STATUSES.has(previousStatus);

      const result = await tx.order.update({
        where: { id: existing.id },
        data: {
          status,
          ...(trackingNumber ? { trackingNumber } : {}),
          ...(status === "Delivered"
            ? { deliveredAt: new Date() }
            : { deliveredAt: null }),
          statusHistory: {
            create: {
              status,
              note: note ?? `Status updated to ${status}`,
            },
          },
        },
      });

      // Restore stock for every line item that was deducted at order time.
      if (releasingStock) {
        for (const item of existing.items) {
          await tx.inventory.updateMany({
            where: { productId: item.productId },
            data: { quantity: { increment: item.quantity } },
          });
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              sku: item.sku,
              delta: item.quantity,
              reason: status === "Returned" ? "return" : "cancellation",
              orderId: existing.orderNumber,
              note: `Restocked ${item.quantity}× ${item.name} — order ${existing.orderNumber} (${status})`,
            },
          });
          await tx.orderItem.updateMany({
            where: { id: item.id },
            data: { inventoryDeducted: false },
          });
        }
      }

      return result;
    });

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Cannot reactivate")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[PATCH /api/orders/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
