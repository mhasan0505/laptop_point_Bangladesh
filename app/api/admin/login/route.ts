import crypto from "crypto";
import {
  ADMIN_SESSION_COOKIE,
  TRUSTED_DEVICE_COOKIE,
  createAdminSession,
  createTrustedDeviceToken,
  verifyTrustedDeviceToken,
  getTrustedDeviceToken,
  computePasswordFingerprint,
  type AdminRole,
} from "@/lib/admin-auth";
import {
  getAdminUsers,
  verifyPassword,
  updateAdminUser,
  recordLogin,
} from "@/lib/admin-users-storage";
import {
  getClientIp,
  checkLoginRateLimit,
  isGlobalEmailCapExceeded,
  recordFailedLogin,
  resetLoginRateLimit,
} from "@/lib/rate-limit";
import { NextResponse } from "next/server";

function compareEnvPassword(provided: string, expected: string): boolean {
  try {
    const hashProvided = crypto.createHash("sha256").update(provided).digest();
    const hashExpected = crypto.createHash("sha256").update(expected).digest();
    return crypto.timingSafeEqual(hashProvided, hashExpected);
  } catch {
    return false;
  }
}

// POST /api/admin/login
// Verifies credentials against server-only env vars (primary owner) or
// staff accounts in admin-users storage, with IP & email rate limiting,
// proxy-aware IP resolution, trusted device lock bypass, progressive delay,
// and constant-time password comparison.
export async function POST(request: Request) {
  try {
    let body: { email?: unknown; password?: unknown };
    try {
      body = (await request.json()) as { email?: unknown; password?: unknown };
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  const ip = getClientIp(request);

  if (!email || !password) {
    const delayMs = recordFailedLogin(ip, email);
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // 1. Rate limiting & account lockout checks (evaluated BEFORE verifying credentials)
  const ipRateLimit = checkLoginRateLimit(ip, email);
  const globalCap = isGlobalEmailCapExceeded(email);
  const isLocked = !ipRateLimit.allowed || globalCap.exceeded;

  if (isLocked) {
    // When the account is locked, a request with a valid trusted_device cookie
    // for that same userId bypasses the lock and is verified normally; failures from it still count.
    let hasTrustedDeviceBypass = false;
    const trustedToken = getTrustedDeviceToken(request);

    if (trustedToken) {
      if (
        adminEmail &&
        adminPassword &&
        email.toLowerCase() === adminEmail.toLowerCase()
      ) {
        const ownerFingerprint = await computePasswordFingerprint(adminPassword);
        hasTrustedDeviceBypass = await verifyTrustedDeviceToken(
          trustedToken,
          "usr-owner-1",
          ownerFingerprint
        );
      } else {
        const users = await getAdminUsers();
        const matchedUser = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.active
        );
        if (matchedUser && matchedUser.passwordHash) {
          const staffFingerprint = await computePasswordFingerprint(matchedUser.passwordHash);
          hasTrustedDeviceBypass = await verifyTrustedDeviceToken(
            trustedToken,
            matchedUser.id,
            staffFingerprint
          );
        }
      }
    }

    if (!hasTrustedDeviceBypass) {
      // Reject BEFORE verifying credentials (removes password oracle / brute force path)
      const retryAfter =
        ipRateLimit.retryAfterSeconds ?? globalCap.retryAfterSeconds ?? 900;
      return NextResponse.json(
        {
          error: globalCap.exceeded
            ? "Too many failed login attempts for this account. Please try again later."
            : "Too many login attempts. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
          },
        }
      );
    }
  }

  // 2. Verify credentials
  let sessionUser: {
    userId: string;
    role: AdminRole;
    email: string;
    name: string;
  } | null = null;
  let userFingerprint = "";

  // Check primary owner env credentials with constant-time SHA-256 comparison
  if (
    adminEmail &&
    adminPassword &&
    email.toLowerCase() === adminEmail.toLowerCase() &&
    compareEnvPassword(password, adminPassword)
  ) {
    sessionUser = {
      userId: "usr-owner-1",
      role: "owner",
      email: adminEmail,
      name: "Primary Store Owner",
    };
    userFingerprint = await computePasswordFingerprint(adminPassword);
    await recordLogin("usr-owner-1").catch(() => {});
  } else {
    // Check staff accounts in storage
    const users = await getAdminUsers();
    const matchedUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.active
    );

    if (matchedUser && matchedUser.passwordHash) {
      const isValid = verifyPassword(password, matchedUser.passwordHash);
      if (isValid) {
        // Migrate legacy plaintext password if not already scrypt-hashed
        if (!matchedUser.passwordHash.includes(":")) {
          await updateAdminUser(matchedUser.id, { password }).catch(() => {});
        }
        await recordLogin(matchedUser.id).catch(() => {});
        sessionUser = {
          userId: matchedUser.id,
          role: matchedUser.role,
          email: matchedUser.email,
          name: matchedUser.name,
        };
        userFingerprint = await computePasswordFingerprint(matchedUser.passwordHash);
      }
    }
  }

  // 3. Handle credential verification failure
  if (!sessionUser) {
    // Record failure (failures from trusted devices or non-locked attempts count toward caps)
    const delayMs = recordFailedLogin(ip, email);
    // Progressive delay sleep: min(200ms * 2^(n-1), 3000ms)
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 4. Success: reset rate limit counters for this IP & email
  resetLoginRateLimit(ip, email);

  const sessionToken = await createAdminSession(sessionUser);
  const trustedDeviceToken = await createTrustedDeviceToken(
    sessionUser.userId,
    userFingerprint
  );

  const response = NextResponse.json({
    ok: true,
    user: sessionUser,
  });

  // Signed HttpOnly admin session cookie (7 days)
  response.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  // Signed HttpOnly trusted device cookie (30 days)
  response.cookies.set(TRUSTED_DEVICE_COOKIE, trustedDeviceToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

    return response;
  } catch (error) {
    console.error("[POST /api/admin/login] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
