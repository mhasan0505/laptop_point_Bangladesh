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

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  email: z.string().trim().email("Invalid email address").max(100, "Email cannot exceed 100 characters"),
  subject: z.string().trim().max(150, "Subject cannot exceed 150 characters").optional().default("General Inquiry"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000, "Message cannot exceed 1000 characters"),
  _hp: z.string().optional(),
  _t: z.union([z.string(), z.number()]).optional(),
});

/**
 * POST /api/contact
 * Public contact form endpoint with per-IP rate limiting, bot friction (honeypot + minimum submit time),
 * strict server-side validation, and durable storage in system:contact_messages store.
 */
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);

    // 1. Per-IP rate limiting
    const rateCheck = checkContactSubmissionRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many contact submissions. Please try again later." },
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

    // 2. Anti-bot friction check (honeypots & submission timing token)
    const botCheck = verifyBotFriction(rawBody as Record<string, unknown>);
    if (botCheck.isBot) {
      return NextResponse.json(
        { error: "Automated submission rejected" },
        { status: 400 }
      );
    }

    // 3. Schema validation & length limits
    const result = contactSchema.safeParse(rawBody);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Validation failed";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    // 4. Compute privacy-preserving IP hash (SHA-256) and extract truncated User-Agent
    const ipHash = crypto.createHash("sha256").update(clientIp).digest("hex");
    const userAgent = (request.headers.get("user-agent") || "unknown").slice(0, 150);

    // 5. Persist submission to system:contact_messages store (DB-first, capped at 2000, EROFS-safe)
    try {
      await addContactMessage({
        name: result.data.name,
        email: result.data.email,
        subject: result.data.subject,
        message: result.data.message,
        ipHash,
        userAgent,
      });
    } catch (persistError) {
      console.error("[POST /api/contact] Storage persistence error:", persistError);
      return NextResponse.json(
        { error: "Unable to save your message right now. Please try again shortly or reach us directly via WhatsApp." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Message received successfully. We will contact you shortly.",
    });
  } catch (error) {
    console.error("[POST /api/contact]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

