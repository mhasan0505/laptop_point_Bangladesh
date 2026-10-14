import { NextRequest, NextResponse } from "next/server";
import { getAdminUsers, createAdminUser } from "@/lib/admin-users-storage";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner"] });
  if (auth.error) return auth.error;

  try {
    const users = await getAdminUsers();
    const sanitized = users.map(({ passwordHash, ...rest }) => rest);
    return NextResponse.json({ users: sanitized });
  } catch (err) {
    console.error("[api/admin/users GET] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load admin users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner"] });
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { name, email, role, password } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const created = await createAdminUser({
      name,
      email,
      role: role || "manager",
      password: typeof password === "string" && password.trim() ? password : undefined,
    });

    const { passwordHash, ...sanitized } = created;
    return NextResponse.json({ ok: true, user: sanitized });
  } catch (err) {
    console.error("[api/admin/users POST] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create user" },
      { status: 400 }
    );
  }
}
