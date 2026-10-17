import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { getContactMessages, getUnreadMessagesCount } from "@/lib/contact-messages-storage";
import { getClientIp, checkAdminMessagesRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/messages
 * Lists customer contact messages, newest first.
 * Supports keyword search (?q=) across name, email, subject, message, and status filtering (?status=).
 * Requires admin session with role: owner, manager, or support.
 */
export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateCheck = checkAdminMessagesRateLimit(clientIp);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfterSeconds ?? 60) },
      }
    );
  }

  const auth = await requireAdmin(request, { roles: ["owner", "manager", "support"] });
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();
    const statusFilter = (searchParams.get("status") || "all").trim().toLowerCase();

    const all = await getContactMessages();
    const unreadCount = await getUnreadMessagesCount();

    let filtered = all;

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    if (query) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          m.subject.toLowerCase().includes(query) ||
          m.message.toLowerCase().includes(query) ||
          m.ipHash.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      messages: filtered,
      unreadCount,
      total: all.length,
    });
  } catch (err) {
    console.error("[api/admin/messages GET] Error:", err);
    return NextResponse.json(
      { error: "Failed to load customer messages", messages: [], unreadCount: 0, total: 0 },
      { status: 500 }
    );
  }
}
