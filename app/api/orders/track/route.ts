import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, verifyBotFriction, checkOrderTrackingRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Public Order Tracking Endpoint (Privacy-Preserving)
 * Requires exact matching of both Order Number and Customer Phone.
 * Uniform 404 response on any mismatch to prevent phone/order number enumeration.
 * NEVER returns customer address, email, item details, prices, or internal notes.
 */
export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  // 1. Rate Limiting (15 lookups per IP per 10 minutes)
  const rateLimit = checkOrderTrackingRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many tracking requests. Please try again in 10 minutes." },
      { status: 429 }
    );
  }

  // 2. Parse payload & Bot friction
  let body: Record<string, unknown> | null = null;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 }
    );
  }

  if (body) {
    const botCheck = verifyBotFriction(body, { minSeconds: 0 }); // Tolerant timing for tracking
    if (botCheck.isBot) {
      return NextResponse.json(
        { error: "Automated lookup rejected" },
        { status: 400 }
      );
    }
  }

  const orderNumber = typeof body?.orderNumber === "string" ? body.orderNumber.trim().toUpperCase() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim().replace(/[\s-]/g, "") : "";

  if (!orderNumber || !phone) {
    return NextResponse.json(
      { error: "Both Order Number and Phone Number are required." },
      { status: 400 }
    );
  }

  // Length sanity check
  if (orderNumber.length < 5 || orderNumber.length > 50 || phone.length < 6 || phone.length > 20) {
    return NextResponse.json(
      { error: "Order not found with provided phone and order number." },
      { status: 404 }
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Order not found with provided phone and order number." },
      { status: 404 }
    );
  }

  try {
    // 3. Query order by exact orderNumber (or case-insensitive)
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: { equals: orderNumber, mode: "insensitive" },
      },
      select: {
        orderNumber: true,
        customerPhone: true,
        status: true,
        trackingNumber: true,
        createdAt: true,
        deliveredAt: true,
        statusHistory: {
          select: {
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Uniform 404 if order does not exist
    if (!order) {
      return NextResponse.json(
        { error: "Order not found with provided phone and order number." },
        { status: 404 }
      );
    }

    // Verify phone match (strip non-digits for normalized comparison)
    const normalizedDbPhone = order.customerPhone.replace(/[\s-]/g, "");
    const cleanInputPhone = phone.replace(/^(\+880|880)/, "0");
    const cleanDbPhone = normalizedDbPhone.replace(/^(\+880|880)/, "0");

    if (cleanDbPhone !== cleanInputPhone && normalizedDbPhone !== phone) {
      // Uniform 404: Never reveal if the order number exists or phone is wrong
      return NextResponse.json(
        { error: "Order not found with provided phone and order number." },
        { status: 404 }
      );
    }

    // 4. Return strictly sanitized public status response (Zero PII)
    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt,
      trackingNumber: order.trackingNumber || null,
      statusHistory: order.statusHistory.map((h) => ({
        status: h.status,
        createdAt: h.createdAt,
      })),
    });
  } catch (error) {
    console.error("[POST /api/orders/track]", error);
    return NextResponse.json(
      { error: "Order not found with provided phone and order number." },
      { status: 404 }
    );
  }
}
