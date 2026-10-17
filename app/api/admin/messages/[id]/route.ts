import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import {
  updateContactMessageStatus,
  deleteContactMessage,
  type ContactMessageStatus,
} from "@/lib/contact-messages-storage";
import { getClientIp, checkAdminMessagesRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES: ContactMessageStatus[] = ["unread", "read", "handled"];

/**
 * PATCH /api/admin/messages/[id]
 * Update status of a contact message ('unread' | 'read' | 'handled').
 * Accessible to owner, manager, support.
 * CSRF verified via requireAdmin. Rate limited.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const status = body?.status as ContactMessageStatus;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Valid status required: 'unread', 'read', or 'handled'" },
        { status: 400 }
      );
    }

    const updated = await updateContactMessageStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: updated });
  } catch (err) {
    console.error("[api/admin/messages/[id] PATCH] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update message" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/messages/[id]
 * Deletes a contact message record.
 * Accessible to owner, manager, support.
 * CSRF verified via requireAdmin. Rate limited.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const { id } = await params;
    const deleted = await deleteContactMessage(id);

    if (!deleted) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/messages/[id] DELETE] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete message" },
      { status: 500 }
    );
  }
}
