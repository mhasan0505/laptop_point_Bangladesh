import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  getClientIp,
  checkContactSubmissionRateLimit,
  verifyBotFriction,
} from "@/lib/rate-limit";
import { addContactMessage } from "@/lib/contact-messages-storage";
import { z } from "zod";

export const dynamic = "force-dynamic";

const newsletterSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(100, "Email cannot exceed 100 characters"),
  _hp: z.string().optional(),
  _t: z.union([z.string(), z.number()]).optional(),
});

/**
 * POST /api/newsletter
 * Newsletter subscription endpoint with bot friction (_hp, _t),
 * rate limiting, tolerant API client handling, and durable lead persistence.
 */
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);

    // 1. Per-IP rate limiting (5 per 10m)
    const rateCheck = checkContactSubmissionRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many subscription requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(rateCheck.retryAfterSeconds ?? 60) },
        }
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const bodyRecord = rawBody as Record<string, unknown>;

    // 2. Anti-bot friction check
    const botCheck = verifyBotFriction(bodyRecord);
    if (botCheck.isBot) {
      return NextResponse.json(
        { error: "Automated submission rejected" },
        { status: 400 }
      );
    }

    // 3. Check for missing _t and record suspect flag
    let isSuspect = false;
    if (bodyRecord._t === undefined || bodyRecord._t === null || bodyRecord._t === "") {
      isSuspect = true;
      console.warn(`[POST /api/newsletter] Suspect subscription missing _t from IP ${clientIp}`);
    }

    // 4. Schema validation
    const result = newsletterSchema.safeParse(rawBody);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid email address";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    // 5. IP hash and user agent
    const ipHash = crypto.createHash("sha256").update(clientIp).digest("hex");
    const userAgent = (request.headers.get("user-agent") || "unknown").slice(0, 150);

    // 6. Persist to customer messages store
    try {
      await addContactMessage({
        name: "Newsletter Subscriber",
        email: result.data.email,
        subject: "Newsletter Subscription",
        message: `Subscriber signed up for promotional discounts and news (suspect: ${isSuspect}).`,
        ipHash,
        userAgent,
      });
    } catch (persistErr) {
      console.error("[POST /api/newsletter] Persistence error:", persistErr);
      return NextResponse.json(
        { error: "Unable to process subscription right now. Please try again shortly." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Thank you for subscribing to Laptop Point BD!",
    });
  } catch (error) {
    console.error("[POST /api/newsletter]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
