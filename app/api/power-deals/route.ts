import { NextResponse } from "next/server";
import { getPowerDealConfig, getPowerDeals } from "@/lib/power-deal-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [config, deals] = await Promise.all([
      getPowerDealConfig(),
      getPowerDeals(),
    ]);

    // Filter to active deals only for the public storefront
    const activeDeals = deals
      .filter((d) => d.active !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    return NextResponse.json({
      ok: true,
      config,
      deals: activeDeals,
    });
  } catch (err) {
    console.error("[/api/power-deals GET] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch power deals" },
      { status: 500 }
    );
  }
}
