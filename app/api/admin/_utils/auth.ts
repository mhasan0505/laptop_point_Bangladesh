import { NextRequest, NextResponse } from "next/server";

export type AdminRole = "owner" | "manager" | "editor";

const ALL_ROLES: AdminRole[] = ["owner", "manager", "editor"];

export function getAdminRole(request: NextRequest): AdminRole | null {
  const role = request.cookies.get("admin_role")?.value as
    | AdminRole
    | undefined;
  if (!role || !ALL_ROLES.includes(role)) {
    return null;
  }
  return role;
}

export function requireAdminRole(
  request: NextRequest,
  allowedRoles: AdminRole[],
): { ok: true; role: AdminRole } | { ok: false; response: NextResponse } {
  const isAuthenticated =
    request.cookies.get("admin_authenticated")?.value === "true";

  if (!isAuthenticated) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const role = getAdminRole(request);
  if (!role) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Missing or invalid admin role" },
        { status: 403 },
      ),
    };
  }

  if (!allowedRoles.includes(role)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden for current role" },
        { status: 403 },
      ),
    };
  }

  return { ok: true, role };
}
