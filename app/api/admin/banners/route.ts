import { NextRequest, NextResponse } from "next/server";
import {
  getBanners,
  saveBanner,
  reorderBanners,
} from "@/lib/banners/storage";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get("placement") || undefined;

    const banners = await getBanners(placement);
    return NextResponse.json({ banners });
  } catch (err) {
    console.error("[api/admin/banners GET] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load banners" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "marketing"] });
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { error: "Banner title is required" },
        { status: 400 }
      );
    }

    const saved = await saveBanner(body);
    return NextResponse.json({ ok: true, banner: saved });
  } catch (err) {
    console.error("[api/admin/banners POST] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create banner" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "marketing"] });
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    if (Array.isArray(body.orders)) {
      await reorderBanners(body.orders);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "Invalid payload: orders array required" },
      { status: 400 }
    );
  } catch (err) {
    console.error("[api/admin/banners PUT] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reorder banners" },
      { status: 500 }
    );
  }
}
