import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type TransactionClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$extends" | "$on" | "$use"
>;

function generateOrderNumber(): string {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD-${ts}-${rand}`;
}

// ─── GET /api/orders ──────────────────────────────────────────────────────────
// Query params: ?status=Pending&search=john
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const orders = await prisma.order.findMany({
      where: {
        ...(status && status !== "All" ? { status } : {}),
        ...(search
          ? {
              OR: [
                { orderNumber: { contains: search, mode: "insensitive" } },
                { customerName: { contains: search, mode: "insensitive" } },
                { customerPhone: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[GET /api/orders]", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

// ─── POST /api/orders ─────────────────────────────────────────────────────────
// Body: { customerName, customerPhone, customerEmail?, address?, city?,
//         district?, postalCode?, paymentMethod, notes?,
//         items: [{ productId, sku, name, unitPrice, quantity }],
//         subtotal, shippingCost, totalAmount }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      address,
      city,
      district,
      postalCode,
      paymentMethod = "cod",
      notes,
      items,
      subtotal = 0,
      shippingCost = 100,
      totalAmount,
    } = body as {
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      address?: string;
      city?: string;
      district?: string;
      postalCode?: string;
      paymentMethod?: string;
      notes?: string;
      items: Array<{
        productId: string;
        sku: string;
        name: string;
        unitPrice: number;
        quantity: number;
      }>;
      subtotal?: number;
      shippingCost?: number;
      totalAmount: number;
    };

    // Basic validation
    if (!customerName?.trim() || !customerPhone?.trim()) {
      return NextResponse.json(
        { error: "customerName and customerPhone are required" },
        { status: 400 },
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items array cannot be empty" },
        { status: 400 },
      );
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx: TransactionClient) => {
      // 1. Check stock for every item (prevents overselling)
      for (const item of items) {
        const inv = await tx.inventory.findUnique({
          where: { productId: String(item.productId) },
        });
        const available = inv ? inv.quantity - inv.reserved : 0;
        if (available < item.quantity) {
          throw new Error(
            `Insufficient stock for "${item.name}": ` +
              `requested ${item.quantity}, available ${available}`,
          );
        }
      }

      // 2. Create the order with items and first status event
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail?.trim() || null,
          address: address?.trim() || null,
          city: city?.trim() || null,
          district: district?.trim() || null,
          postalCode: postalCode?.trim() || null,
          paymentMethod,
          paymentStatus: "pending",
          status: "Pending",
          notes: notes?.trim() || null,
          subtotal,
          shippingCost,
          totalAmount,
          items: {
            create: items.map((item) => ({
              productId: String(item.productId),
              sku: item.sku,
              name: item.name,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              inventoryDeducted: true,
            })),
          },
          statusHistory: {
            create: { status: "Pending", note: "Order placed by customer" },
          },
        },
        include: { items: true },
      });

      // 3. Atomically decrement inventory and append log entries
      for (const item of items) {
        await tx.inventory.update({
          where: { productId: String(item.productId) },
          data: { quantity: { decrement: item.quantity } },
        });
        await tx.inventoryLog.create({
          data: {
            productId: String(item.productId),
            sku: item.sku,
            delta: -item.quantity,
            reason: "sale",
            orderId: orderNumber,
            note: `Sold ${item.quantity}× ${item.name} — order ${orderNumber}`,
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json(
      { success: true, orderNumber: order.orderNumber, id: order.id },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create order";
    if (message.startsWith("Insufficient stock")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    console.error("[POST /api/orders]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
