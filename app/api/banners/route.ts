import { NextRequest, NextResponse } from "next/server";
import { getLiveBanners } from "@/lib/banners/service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get("placement") || "home.hero";
    const brand = searchParams.get("brand") || undefined;
    const category = searchParams.get("category") || undefined;

    const banners = await getLiveBanners(placement, brand, category);
    return NextResponse.json({ banners });
  } catch (err) {
    console.error("[api/banners GET] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load banners", banners: [] },
      { status: 500 }
    );
  }
}
