import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
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
