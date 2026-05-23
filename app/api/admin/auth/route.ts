import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "admin_session";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

/** Timing-safe string comparison to prevent brute-force timing attacks. */
function safeCompare(a: string, b: string): boolean {
  try {
    const ha = createHash("sha256").update(a).digest();
    const hb = createHash("sha256").update(b).digest();
    return timingSafeEqual(ha, hb);
  } catch {
    return false;
  }
}

// ─── POST /api/admin/auth — login ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;

    if (!adminEmail || !adminPassword || !sessionSecret) {
      console.error(
        "Admin env vars not configured: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET",
      );
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 },
      );
    }

    const emailMatch = safeCompare(email.trim(), adminEmail);
    const passwordMatch = safeCompare(password, adminPassword);

    if (!emailMatch || !passwordMatch) {
      // Artificial delay deters brute-force attempts
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, sessionSecret, COOKIE_OPTIONS);
    return response;
  } catch (error) {
    console.error("[POST /api/admin/auth]", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

// ─── GET /api/admin/auth — check session ─────────────────────────────────────
export async function GET(request: NextRequest) {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;

  if (!sessionSecret || !cookie) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const valid = safeCompare(cookie, sessionSecret);
  if (valid) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

// ─── DELETE /api/admin/auth — logout ─────────────────────────────────────────
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
