import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Protect Admin Pages
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";

    if (!isLoginPage) {
      const isAuthenticated =
        request.cookies.get("admin_authenticated")?.value === "true";

      if (!isAuthenticated) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
  }

  // 2. Protect Admin / Internal API endpoints from bots, scrapers, and unauthorized queries
  // POST /api/orders remains open for public customer checkout.
  // GET /api/orders, PATCH /api/orders/[id], and /api/inventory require admin authentication.
  const isProtectedOrdersRoute =
    pathname.startsWith("/api/orders") && request.method !== "POST";
  const isProtectedInventoryRoute = pathname.startsWith("/api/inventory");

  if (isProtectedOrdersRoute || isProtectedInventoryRoute) {
    const isAuthenticated =
      request.cookies.get("admin_authenticated")?.value === "true";

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized access to internal API" },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

// Strictly match only admin and sensitive API routes to eliminate Edge Middleware
// invocations on public pages, images, and static assets.
export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/orders",
    "/api/orders/:path*",
    "/api/inventory",
    "/api/inventory/:path*",
  ],
};
