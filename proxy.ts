import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // Check if the request is for an admin route (but not login)
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const isLoginPage = request.nextUrl.pathname === "/admin/login";

    if (!isLoginPage) {
      // Check for authentication cookie/header
      const isAuthenticated =
        request.cookies.get("admin_authenticated")?.value === "true";

      if (!isAuthenticated) {
        // Redirect to login page
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
  }

  const response = NextResponse.next();

  // Enable compression headers
  response.headers.set("Accept-Encoding", "gzip, deflate, br");

  // Add performance headers for caching
  if (request.nextUrl.pathname.startsWith("/_next/static")) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable",
    );
  }

  // Cache images from public folder
  if (
    request.nextUrl.pathname.startsWith("/products") ||
    request.nextUrl.pathname.startsWith("/Hero") ||
    request.nextUrl.pathname.startsWith("/brand_logo")
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable",
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/image|favicon.ico).*)",
  ],
};
