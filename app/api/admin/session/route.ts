import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
} from "@/lib/admin-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// GET /api/admin/session — lets the client check its login state without
// being able to read or forge the HttpOnly cookie.
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return NextResponse.json({ authenticated: await verifyAdminSession(token) });
}
