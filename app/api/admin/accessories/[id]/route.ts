import { requireAdmin } from "@/lib/auth-guard";
import {
  AccessoryConflictError,
  deleteAccessory,
  getAccessoryByIdOrSlug,
  parseAccessoryInput,
  updateAccessory,
} from "@/lib/accessories-storage";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const WRITE_ROLES = ["owner", "manager", "marketing"] as const;
type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  const { id } = await params;
  const item = await getAccessoryByIdOrSlug(id);
  if (!item) return NextResponse.json({ error: "Accessory not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin(request, { roles: [...WRITE_ROLES] });
  if (auth.error) return auth.error;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = parseAccessoryInput(body, "update");
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const updated = await updateAccessory(id, parsed.data);
    if (!updated) return NextResponse.json({ error: "Accessory not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof AccessoryConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("[PUT /api/admin/accessories/:id]", err);
    return NextResponse.json({ error: "Failed to update accessory" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin(request, { roles: [...WRITE_ROLES] });
  if (auth.error) return auth.error;
  const { id } = await params;
  try {
    const ok = await deleteAccessory(id);
    if (!ok) return NextResponse.json({ error: "Accessory not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/accessories/:id]", err);
    return NextResponse.json({ error: "Failed to delete accessory" }, { status: 500 });
  }
}
