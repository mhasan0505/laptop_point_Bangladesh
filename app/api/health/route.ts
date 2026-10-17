import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Public Health & Runtime Liveness Check
 * Used by external uptime monitors (e.g. BetterStack, Pingdom, Vercel Checks).
 * Does not require authentication and NEVER exposes database credentials or internal secrets.
 */
export async function GET() {
  const startedAt = Date.now();
  let dbOk = false;

  try {
    if (process.env.DATABASE_URL) {
      // 3-second timeout guard to prevent hung health checks
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Database connection timed out")), 3000)
        ),
      ]);
      dbOk = true;
    }
  } catch {
    dbOk = false;
  }

  const imageKitConfigured = Boolean(
    process.env.IMAGEKIT_PUBLIC_KEY &&
      process.env.IMAGEKIT_PRIVATE_KEY &&
      process.env.IMAGEKIT_URL_ENDPOINT
  );

  const envValidated = Boolean(
    process.env.DATABASE_URL &&
      process.env.ADMIN_SESSION_SECRET &&
      process.env.ADMIN_SESSION_SECRET.length >= 32
  );

  const payload = {
    status: dbOk ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    latencyMs: Date.now() - startedAt,
    version: "0.1.0",
    commit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || "local",
    checks: {
      database: dbOk,
      imagekit: imageKitConfigured,
      env: envValidated,
    },
  };

  return NextResponse.json(payload, {
    status: dbOk ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}
