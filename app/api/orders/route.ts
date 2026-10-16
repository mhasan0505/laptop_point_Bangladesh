import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { VALID_STATUSES } from "@/lib/orders";
import { computeOrderTotals, FREE_SHIPPING_THRESHOLD, TAX_RATE } from "@/lib/pricing";
import { calculateDeliveryFee } from "@/lib/delivery";
import { getStorefrontCommerce, type StorefrontCommerce } from "@/lib/public-content";
import { loadMergedRawProducts } from "@/lib/products-storage";
import { listAccessories } from "@/lib/accessories-storage";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// Business rules imported from lib/pricing.ts (single source of truth,
// shared with the client cart context).

const PAYMENT_METHODS = ["cod", "bkash", "nagad", "card", "emi"] as const;
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
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
}

type ParseResult =
  | { data: ParsedOrder }
  | { error: string; details?: Record<string, unknown> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/**
 * Validates and normalizes a checkout payload with strict SERVER-SIDE PRICE AUTHORITY:
 * - Client-supplied `unitPrice`, `subtotal`, `shippingCost`, and `totalAmount` are completely ignored.
 * - Every line item is verified against live catalogue data (`loadMergedRawProducts()`).
 * - Unknown products or out-of-stock products are rejected with a 400 error.
 * - Delivery fee is derived exclusively from store rules + zone config + free-shipping threshold.
 */
async function parseCreateOrderBody(
  body: unknown,
  commerce: StorefrontCommerce,
): Promise<ParseResult> {
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
  const enabledMethods = (commerce.paymentMethods || [])
    .filter((m) => m.enabled)
    .map((m) => m.id.toLowerCase());
  const allowedMethods =
    enabledMethods.length > 0 ? enabledMethods : (PAYMENT_METHODS as readonly string[]);
  if (!allowedMethods.includes(rawPaymentMethod)) {
    return { error: `Unsupported or disabled payment method: ${rawPaymentMethod}` };
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { error: "items array cannot be empty" };
  }
  if (body.items.length > 20) {
    return { error: "Too many items in order" };
  }

  // Load canonical product catalogue (merged with PostgreSQL overrides & live inventory)
  const rawProducts = await loadMergedRawProducts();
  const productLookup = new Map<string, (typeof rawProducts)[number]>();
  for (const p of rawProducts) {
    // Draft / archived products can't be bought even with a stale cart.
    if (p.statusValue && p.statusValue !== "active") continue;
    if (p.sku) productLookup.set(p.sku.toLowerCase().trim(), p);
    if (p.id != null) productLookup.set(String(p.id).toLowerCase().trim(), p);
  }

  // Active accessories are sellable through the same checkout. Adapt them to
  // the minimal shape the validator needs (price authority stays server-side).
  const accessories = (await listAccessories().catch(() => [])).filter((a) => a.active);
  for (const a of accessories) {
    const adapted = {
      id: a.id,
      sku: a.sku,
      name: a.name,
      pricing: { sale_price: a.price },
      stock: { quantity: a.stock, status: a.stock > 0 ? "In Stock" : "Out of Stock" },
    } as unknown as (typeof rawProducts)[number];
    productLookup.set(a.sku.toLowerCase().trim(), adapted);
    productLookup.set(a.id.toLowerCase().trim(), adapted);
  }

  const items: ParsedOrderItem[] = [];
  const seenProductIds = new Set<string>();

  for (const raw of body.items) {
    if (!isRecord(raw)) return { error: "Invalid item in order" };

    const rawSku = asOptionalString(raw.sku)?.toLowerCase().trim();
    const rawProductId = asOptionalString(raw.productId)?.toLowerCase().trim();
    const rawId = asOptionalString(raw.id)?.toLowerCase().trim();
    const quantity =
      typeof raw.quantity === "number" ? raw.quantity : Number(raw.quantity);

    if (!rawProductId && !rawSku && !rawId) {
      return { error: "Item missing product identifier" };
    }

    const matchedProduct =
      (rawSku && productLookup.get(rawSku)) ||
      (rawProductId && productLookup.get(rawProductId)) ||
      (rawId && productLookup.get(rawId));

    if (!matchedProduct) {
      return {
        error: `Unknown product: "${raw.name || raw.sku || raw.productId || raw.id || "item"}"`,
      };
    }

    const productIdStr = String(matchedProduct.id);
    if (seenProductIds.has(productIdStr)) {
      return { error: "Duplicate product in order" };
    }
    seenProductIds.add(productIdStr);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return { error: `Invalid quantity for "${matchedProduct.name}"` };
    }

    // Live stock verification
    const stockQty =
      typeof matchedProduct.stock?.quantity === "number"
        ? matchedProduct.stock.quantity
        : 0;
    const isOutOfStock =
      stockQty <= 0 ||
      (matchedProduct.stock?.status &&
        matchedProduct.stock.status.toLowerCase() === "out of stock");

    if (isOutOfStock) {
      return { error: `Product "${matchedProduct.name}" is out of stock` };
    }
    // Authoritative sale price strictly from server
    const salePrice = matchedProduct.pricing?.sale_price;
    if (typeof salePrice !== "number" || salePrice <= 0 || !Number.isFinite(salePrice)) {
      return { error: `Valid price unavailable for product "${matchedProduct.name}"` };
    }

    if (quantity > stockQty) {
      return {
        error: `Requested quantity (${quantity}) exceeds available stock (${stockQty}) for "${matchedProduct.name}"`,
        details: {
          productId: productIdStr,
          sku: matchedProduct.sku || productIdStr,
          name: matchedProduct.name,
          serverPrice: salePrice,
          availableStock: stockQty,
        },
      };
    }

    items.push({
      productId: productIdStr,
      sku: matchedProduct.sku || productIdStr,
      name: matchedProduct.name,
      unitPrice: salePrice,
      quantity,
    });
  }

  // 1. Calculate canonical subtotal
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // 2. Derive shipping fee from commerce delivery rules & customer zone
  const rawShippingMethod =
    typeof body.shippingMethod === "string"
      ? body.shippingMethod.trim().toLowerCase()
      : "";
  let deliveryFee = calculateDeliveryFee(commerce, {
    shippingMethod: rawShippingMethod || undefined,
    city: asOptionalString(body.city),
  });

  // 3. Apply free-shipping threshold (standard orders over threshold get free delivery)
  const isExpressOrVip = rawShippingMethod === "vip" || rawShippingMethod === "express";
  const threshold = FREE_SHIPPING_THRESHOLD;
  if (!isExpressOrVip && threshold > 0 && subtotal >= threshold) {
    deliveryFee = 0;
  }

  // 4. Compute final canonical totals
  const taxRate = commerce.taxRule === "exempt" ? 0 : TAX_RATE;
  const totals = computeOrderTotals(items, { shippingCost: deliveryFee, taxRate });

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
      subtotal: totals.subtotal,
      shippingCost: totals.shipping,
      totalAmount: totals.total,
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
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "support"] });
  if (auth.error) return auth.error;

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

  const commerce = await getStorefrontCommerce();
  const parsed = await parseCreateOrderBody(body, commerce);
  if ("error" in parsed) {
    return NextResponse.json(
      {
        error: parsed.error,
        ...(parsed.details ? { details: parsed.details } : {}),
      },
      { status: 400 }
    );
  }

  const orderInput = parsed.data;
  const accessoryList = orderInput.items.some((i) => i.productId.startsWith("acc-"))
    ? await listAccessories().catch(() => [])
    : [];
  const rawProductsList = await loadMergedRawProducts().catch(() => []);

  const computedSubtotal = orderInput.subtotal;
  const computedShipping = orderInput.shippingCost;
  const computedTotal = orderInput.totalAmount;

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
          // Accessories or catalogue laptops seeded from JSON may not have an inventory row yet.
          // Lazily create it from validated catalogue stock so the guarded decrement below works.
          if (item.productId.startsWith("acc-")) {
            const acc = accessoryList.find((a) => a.id === item.productId);
            if (acc) {
              await tx.inventory.upsert({
                where: { productId: acc.id },
                update: {},
                create: { productId: acc.id, sku: acc.sku, name: acc.name, quantity: acc.stock },
              });
            }
          } else {
            const prod = rawProductsList.find(
              (p) => String(p.id) === item.productId || (p.sku && p.sku.toLowerCase() === item.sku.toLowerCase())
            );
            if (prod) {
              const stockQty = typeof prod.stock === "number" ? prod.stock : (prod.stock?.quantity ?? 0);
              await tx.inventory.upsert({
                where: { productId: String(prod.id) },
                update: {},
                create: {
                  productId: String(prod.id),
                  sku: prod.sku || String(prod.id),
                  name: prod.name || item.name,
                  quantity: stockQty,
                },
              });
            }
          }
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
        {
          success: true,
          orderNumber: order.orderNumber,
          id: order.id,
          subtotal: computedSubtotal,
          shippingCost: computedShipping,
          totalAmount: computedTotal,
        },
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
