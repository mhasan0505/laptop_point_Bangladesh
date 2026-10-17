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
 * Strictly accepts ONLY an active admin session cookie with role 'owner' or 'manager'.
 * Never leaks the connection string, credentials, or plaintext hostname.
 */
export async function GET(request: NextRequest) {
  // Authentication check: Accept ONLY an active admin session cookie
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Authorization check: Require role owner or manager
  if (session.role !== "owner" && session.role !== "manager") {
    return NextResponse.json(
      { error: "Forbidden: requires role owner or manager" },
      { status: 403 }
    );
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

