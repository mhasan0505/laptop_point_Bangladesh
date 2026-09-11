import { requireAdminSession } from "@/lib/admin-auth";
import { fetchUnifiedAnalytics } from "@/lib/analytics";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 1800;

// GET /api/admin/analytics?range=7d|30d|90d&refresh=true
export async function GET(request: NextRequest) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const rangeParam = searchParams.get("range") || searchParams.get("days") || "30";
    const days = rangeParam.replace("d", "");
    const shouldRefresh = searchParams.get("refresh") === "true";
    const shouldSimulate = searchParams.get("simulate") === "true";

    if (shouldRefresh) {
      try {
        revalidateTag("analytics", "default");
      } catch {
        // Tag revalidation may not be available in all Next environments
      }
    }

    const data = await fetchUnifiedAnalytics(days, shouldSimulate);
    return NextResponse.json(data, {
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