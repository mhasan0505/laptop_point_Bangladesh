import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminSession } from "@/lib/admin-auth";

/**
 * Computes a deterministic SHA-256 fingerprint for a database URL or hostname.
 * Strips user, password, port, query params, and normalizes to lowercase hostname.
 */
export function computeDbHostFingerprint(urlOrHost: string): string {
  if (!urlOrHost) return "";
  let host = urlOrHost.trim();
  try {
    if (host.includes("://")) {
      const u = new URL(host);
      host = u.hostname;
    }
  } catch {
    // keep as-is if raw hostname passed
  }
  return crypto.createHash("sha256").update(host.toLowerCase().trim()).digest("hex");
}

/**
 * Protected endpoint returning SHA-256 fingerprint of the server's DATABASE_URL host.
 * Never leaks the connection string, credentials, or plaintext hostname.
 */
export async function GET(request: NextRequest) {
  // Authentication check:
  // 1. Active Admin session cookie
  // 2. OR Bearer token / x-staging-guard-token matching configured admin secrets
  const session = await getAdminSession(request);
  const authHeader = request.headers.get("authorization") || "";
  const bearerToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  const guardHeader = request.headers.get("x-staging-guard-token") || "";
  const token = bearerToken || guardHeader;

  const validSecrets = [
    process.env.STAGING_GUARD_TOKEN,
    process.env.ADMIN_SESSION_SECRET,
    process.env.ADMIN_SETUP_SECRET,
    process.env.ADMIN_PASSWORD,
    process.env.CRON_SECRET,
  ].filter((s): s is string => Boolean(s && s.length > 0));

  const isAuthorized = Boolean(session || (token && validSecrets.includes(token)));

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL not configured" }, { status: 500 });
  }

  const fingerprint = computeDbHostFingerprint(dbUrl);

  return NextResponse.json({
    ok: true,
    fingerprint,
  });
}
