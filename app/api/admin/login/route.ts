import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
} from "@/lib/admin-auth";
import { NextResponse } from "next/server";

// POST /api/admin/login
// Verifies credentials against server-only env vars and issues an HttpOnly
// session cookie. Credentials are never shipped to, or compared in, the browser.
export async function POST(request: Request) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { error: "Admin credentials are not configured on the server." },
      { status: 503 },
    );
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = (await request.json()) as { email?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  const emailMatches =
    email.length > 0 && email.toLowerCase() === adminEmail.toLowerCase();
  const passwordMatches = password.length > 0 && password === adminPassword;

  if (!emailMatches || !passwordMatches) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createAdminSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
