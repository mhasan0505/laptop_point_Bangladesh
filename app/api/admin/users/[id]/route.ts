import { NextRequest, NextResponse } from "next/server";
import { updateAdminUser, deleteAdminUser } from "@/lib/admin-users-storage";
import { requireAdmin, invalidateUserCache } from "@/lib/auth-guard";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin(request, { roles: ["owner"] });
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateAdminUser(id, body);
    invalidateUserCache(id);
    const { passwordHash, ...sanitized } = updated;
    return NextResponse.json({ ok: true, user: sanitized });
  } catch (err) {
    console.error("[api/admin/users/[id] PATCH] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin(request, { roles: ["owner"] });
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const removed = await deleteAdminUser(id);

    if (!removed) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    invalidateUserCache(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/users/[id] DELETE] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete user" },
      { status: 500 }
    );
  }
}
