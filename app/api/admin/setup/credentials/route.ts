import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

interface CredentialItem {
  provider: string;
  label: string;
  isConfigured: boolean;
  preview: string;
}

const credsFilePath = path.join(process.cwd(), "app", "data", "credentials.json");

async function readCredentials(): Promise<Record<string, string>> {
  // 1. Try DB ProductOverride FIRST (authoritative in production/serverless)
  try {
    const rec = await prisma.productOverride.findUnique({
      where: { sku: "system:connected_credentials" },
    });
    if (rec && rec.data && typeof rec.data === "object") {
      return rec.data as Record<string, string>;
    }
  } catch (dbErr) {
    console.warn("[readCredentials] DB fetch warning:", dbErr);
  }

  // 2. Try local file fallback
  try {
    const raw = await fs.readFile(credsFilePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    // fallback
  }

  return {};
}

async function writeCredentials(creds: Record<string, string>): Promise<void> {
  // 1. Persist to PostgreSQL (source of truth for serverless instances)
  try {
    await prisma.productOverride.upsert({
      where: { sku: "system:connected_credentials" },
      create: {
        id: "system:connected_credentials",
        sku: "system:connected_credentials",
        data: creds as any,
      },
      update: {
        data: creds as any,
        isDeleted: false,
      },
    });
  } catch (dbErr) {
    console.error("[writeCredentials] DB persist failed:", dbErr);
  }

  // 2. Best-effort write to local file (safely catches EROFS)
  try {
    await fs.mkdir(path.dirname(credsFilePath), { recursive: true });
    await fs.writeFile(credsFilePath, JSON.stringify(creds, null, 2), "utf-8");
  } catch {
    // Read-only filesystem in serverless
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner"] });
  if (auth.error) return auth.error;

  try {
    const saved = await readCredentials();

    const providers = [
      {
        provider: "imagekit",
        label: "ImageKit CDN Storage",
        key: process.env.IMAGEKIT_PRIVATE_KEY || saved.imagekit || "",
      },
      {
        provider: "steadfast",
        label: "Steadfast Courier API",
        key: process.env.STEADFAST_API_KEY || saved.steadfast || "",
      },
      {
        provider: "bkash",
        label: "bKash Merchant Payment",
        key: process.env.BKASH_APP_SECRET || saved.bkash || "",
      },
      {
        provider: "google_analytics",
        label: "Google Analytics 4 / Tag Manager",
        key: process.env.GA4_MEASUREMENT_ID || saved.google_analytics || "",
      },
      {
        provider: "facebook_pixel",
        label: "Meta Conversions Pixel",
        key: process.env.FB_PIXEL_ID || saved.facebook_pixel || "",
      },
    ];

    const credentials: CredentialItem[] = providers.map((p) => {
      const isConfigured = Boolean(p.key && p.key.trim().length > 0);
      let preview = "Not configured";
      if (isConfigured) {
        const val = p.key.trim();
        preview = val.length > 8 ? `${val.slice(0, 4)}••••${val.slice(-4)}` : "••••••••";
      }
      return {
        provider: p.provider,
        label: p.label,
        isConfigured,
        preview,
      };
    });

    return NextResponse.json({ credentials });
  } catch (err) {
    console.error("[api/admin/setup/credentials GET] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load credentials" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner"] });
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { provider, payload } = body;

    if (!provider || typeof payload !== "string") {
      return NextResponse.json(
        { error: "Provider and payload string are required" },
        { status: 400 }
      );
    }

    const saved = await readCredentials();
    saved[provider] = payload.trim();
    await writeCredentials(saved);

    return NextResponse.json({ ok: true, provider });
  } catch (err) {
    console.error("[api/admin/setup/credentials POST] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save credential" },
      { status: 500 }
    );
  }
}
