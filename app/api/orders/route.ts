import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { VALID_STATUSES } from "@/lib/orders";
import { computeOrderTotals } from "@/lib/pricing";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// Business rules imported from lib/pricing.ts (single source of truth,
// shared with the client cart context).

const PAYMENT_METHODS = ["cod", "bkash", "nagad", "card"] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

class InsufficientStockError extends Error {
  constructor(productName: string, requested: number, available: number) {
    super(
      `Insufficient stock for "${productName}": requested ${requested}, available ${available}`,
    );
    this.name = "InsufficientStockError";
  }
}

interface ParsedOrderItem {
  productId: string;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

interface ParsedOrder {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  items: ParsedOrderItem[];
}

type ParseResult = { data: ParsedOrder } | { error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/**
 * Validates and normalizes a checkout payload. Amounts are NOT trusted:
 * subtotal must equal the sum of line items, shipping must match the
 * free-shipping rule, and total must equal subtotal + 5% tax + shipping.
 */
function parseCreateOrderBody(body: unknown): ParseResult {
  if (!isRecord(body)) return { error: "Invalid request body" };

  const customerName = asOptionalString(body.customerName);
  const customerPhone = asOptionalString(body.customerPhone);
  const customerEmail = asOptionalString(body.customerEmail);

  if (!customerName || customerName.length < 2 || customerName.length > 120) {
    return { error: "A valid customer name is required" };
  }
  if (!customerPhone || customerPhone.length < 6 || customerPhone.length > 20) {
    return { error: "A valid customer phone number is required" };
  }
  if (
    customerEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)
  ) {
    return { error: "A valid customer email is required" };
  }

  const rawPaymentMethod =
    typeof body.paymentMethod === "string"
      ? body.paymentMethod.trim().toLowerCase()
      : "cod";
  if (!(PAYMENT_METHODS as readonly string[]).includes(rawPaymentMethod)) {
    return { error: "Unsupported payment method" };
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { error: "items array cannot be empty" };
  }
  if (body.items.length > 20) {
    return { error: "Too many items in order" };
  }

  const items: ParsedOrderItem[] = [];
  const seenProductIds = new Set<string>();
  for (const raw of body.items) {
    if (!isRecord(raw)) return { error: "Invalid item in order" };

    const productId = asOptionalString(raw.productId);
    const sku = asOptionalString(raw.sku);
    const name = asOptionalString(raw.name);
    const unitPrice =
      typeof raw.unitPrice === "number" ? raw.unitPrice : Number(raw.unitPrice);
    const quantity =
      typeof raw.quantity === "number" ? raw.quantity : Number(raw.quantity);

    if (!productId || !name) return { error: "Invalid item in order" };
    if (seenProductIds.has(productId)) {
      return { error: "Duplicate product in order" };
    }
    seenProductIds.add(productId);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return { error: `Invalid quantity for "${name}"` };
    }
    if (!Number.isFinite(unitPrice) || unitPrice < 0 || unitPrice > 10_000_000) {
      return { error: `Invalid price for "${name}"` };
    }

    items.push({ productId, sku: sku ?? productId, name, unitPrice, quantity });
  }

  // Financial consistency: subtotal === Σ(unitPrice × quantity)
  const subtotal =
    typeof body.subtotal === "number" ? body.subtotal : Number(body.subtotal);
  const shippingCost =
    typeof body.shippingCost === "number"
      ? body.shippingCost
      : Number(body.shippingCost);
  const totalAmount =
    typeof body.totalAmount === "number"
      ? body.totalAmount
      : Number(body.totalAmount);

  const expected = computeOrderTotals(items);

  if (!Number.isFinite(subtotal) || Math.abs(subtotal - expected.subtotal) > 0.01) {
    return { error: "Order subtotal does not match item prices" };
  }

  if (
    !Number.isFinite(shippingCost) ||
    Math.abs(shippingCost - expected.shipping) > 0.01
  ) {
    return { error: "Order shipping cost does not match store policy" };
  }

  if (
    !Number.isFinite(totalAmount) ||
    Math.abs(totalAmount - expected.total) > 0.02
  ) {
    return { error: "Order total does not match item prices" };
  }

  return {
    data: {
      customerName,
      customerPhone,
      customerEmail,
      address: asOptionalString(body.address),
      city: asOptionalString(body.city),
      district: asOptionalString(body.district),
      postalCode: asOptionalString(body.postalCode),
      paymentMethod: rawPaymentMethod as PaymentMethod,
      notes: asOptionalString(body.notes),
      items,
    },
  };
}

function generateOrderNumber(): string {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD-${ts}-${rand}`;
}

// ─── GET /api/orders ──────────────────────────────────────────────────────────
// Query params: ?status=Pending&search=john  (admin only)
export async function GET(request: NextRequest) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const search = searchParams.get("search");
    const status =
      statusParam && statusParam !== "All" && VALID_STATUSES.includes(statusParam as (typeof VALID_STATUSES)[number])
        ? statusParam
        : undefined;

    const orders = await prisma.order.findMany({
      where: {
        ...(status ? { status } : {}),
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
        statusHistory: { orderBy: { createdAt: "desc" }, take: 10 },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
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
// Public checkout. Server validates the payload and atomically decrements
// stock with a conditional updateMany guard (no TOCTOU overselling).
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = parseCreateOrderBody(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const orderInput = parsed.data;

  const totals = computeOrderTotals(orderInput.items);
  const computedSubtotal = totals.subtotal;
  const computedShipping = totals.shipping;
  const computedTotal = totals.total;

  // Retry on the rare orderNumber collision (P2002).
  for (let attempt = 0; attempt < 3; attempt++) {
    const orderNumber = generateOrderNumber();
    try {
      const order = await prisma.$transaction(async (tx) => {
        // 1. Create order with items and first status event.
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            customerName: orderInput.customerName,
            customerPhone: orderInput.customerPhone,
            customerEmail: orderInput.customerEmail ?? null,
            address: orderInput.address ?? null,
            city: orderInput.city ?? null,
            district: orderInput.district ?? null,
            postalCode: orderInput.postalCode ?? null,
            paymentMethod: orderInput.paymentMethod,
            paymentStatus: "pending",
            status: "Pending",
            notes: orderInput.notes ?? null,
            subtotal: computedSubtotal,
            shippingCost: computedShipping,
            totalAmount: computedTotal,
            items: {
              create: orderInput.items.map((item) => ({
                productId: item.productId,
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

        // 2. Conditional decrement — updateMany fails to match once stock is
        //    insufficient, closing the check-then-decrement race.
        for (const item of orderInput.items) {
          const result = await tx.inventory.updateMany({
            where: {
              productId: item.productId,
              quantity: { gte: item.quantity },
            },
            data: { quantity: { decrement: item.quantity } },
          });
          if (result.count === 0) {
            const inv = await tx.inventory.findUnique({
              where: { productId: item.productId },
              select: { quantity: true, reserved: true },
            });
            const available = inv ? inv.quantity - inv.reserved : 0;
            throw new InsufficientStockError(item.name, item.quantity, available);
          }
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
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
      // Only retry on a unique-constraint collision for orderNumber.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        if (attempt === 2) {
          console.error("[POST /api/orders] orderNumber collision", error);
          return NextResponse.json(
            { error: "Failed to create order, please retry" },
            { status: 500 },
          );
        }
        continue;
      }
      if (error instanceof InsufficientStockError) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      console.error("[POST /api/orders]", error);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    { error: "Failed to create order" },
    { status: 500 },
  );
}
