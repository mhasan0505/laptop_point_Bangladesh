import { requireAdmin } from "@/lib/auth-guard";
import {
  AccessoryConflictError,
  createAccessory,
  listAccessories,
  parseAccessoryInput,
} from "@/lib/accessories-storage";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const WRITE_ROLES = ["owner", "manager", "marketing"] as const;

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    return NextResponse.json(await listAccessories());
  } catch (err) {
    console.error("[GET /api/admin/accessories]", err);
    return NextResponse.json({ error: "Failed to load accessories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: [...WRITE_ROLES] });
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = parseAccessoryInput(body, "create");
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const created = await createAccessory(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof AccessoryConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("[POST /api/admin/accessories]", err);
    return NextResponse.json({ error: "Failed to create accessory" }, { status: 500 });
  }
}
