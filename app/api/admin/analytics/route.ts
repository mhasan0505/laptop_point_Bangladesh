import { requireAdmin } from "@/lib/auth-guard";
import { fetchUnifiedAnalytics } from "@/lib/analytics";
import { fetchStorePerformanceAnalytics } from "@/lib/analytics/store";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/admin/analytics?range=7d|30d|90d|year&refresh=true
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "marketing"] });
  if (auth.error) return auth.error;

  try {
    const searchParams = request.nextUrl.searchParams;
    const rangeParam = searchParams.get("range") || searchParams.get("days") || "30";
    const daysRaw = rangeParam.replace("d", "");
    const days = Math.max(1, parseInt(daysRaw, 10) || 30);
    const shouldRefresh = searchParams.get("refresh") === "true";
    const shouldSimulate = searchParams.get("simulate") === "true";

    if (shouldRefresh) {
      try {
        revalidateTag("analytics", "default");
      } catch {
        // Tag revalidation may not be available in all Next environments
      }
    }

    const [performanceResult, unifiedResult] = await Promise.allSettled([
      fetchStorePerformanceAnalytics(days),
      fetchUnifiedAnalytics(days, shouldSimulate),
    ]);

    const performance =
      performanceResult.status === "fulfilled"
        ? performanceResult.value
        : {
            days,
            totalRevenue: 0,
            orderCount: 0,
            avgOrderValue: 0,
            statusBreakdown: {
              pending: 0,
              processing: 0,
              shipped: 0,
              delivered: 0,
              cancelled: 0,
            },
            topProductsByUnits: [],
            revenueByBrand: [],
          };

    const unified = unifiedResult.status === "fulfilled" ? unifiedResult.value : null;

    const payload = {
      ...(unified || {}),
      ...performance,
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": shouldRefresh
          ? "no-store, no-cache, must-revalidate"
          : "private, max-age=600, stale-while-revalidate=1800",
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/analytics]", error);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 },
    );
  }
}
