import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
} from "@/lib/admin-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isAdminPage = (pathname: string) =>
  pathname === "/admin" || pathname.startsWith("/admin/");

// POST /api/orders remains open for public customer checkout.
const isProtectedApi = (pathname: string, method: string) =>
  (pathname.startsWith("/api/orders") && method !== "POST") ||
  pathname.startsWith("/api/inventory") ||
  (pathname.startsWith("/api/admin") && pathname !== "/api/admin/login");

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthenticated = await verifyAdminSession(token);

  // 1. Protect Admin Pages
  if (isAdminPage(pathname) && pathname !== "/admin/login" && !isAuthenticated) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Protect Admin / Internal API endpoints from bots, scrapers, and
  //    unauthorized queries. Defense in depth — route handlers also verify.
  if (isProtectedApi(pathname, request.method) && !isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized access to internal API" },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

// Strictly match only admin and sensitive API routes to eliminate Edge
// invocations on public pages, images, and static assets.
export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/admin",
    "/api/admin/:path*",
    "/api/orders",
    "/api/orders/:path*",
    "/api/inventory",
    "/api/inventory/:path*",
  ],
};
