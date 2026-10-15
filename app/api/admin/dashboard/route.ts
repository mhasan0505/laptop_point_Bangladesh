import { NextRequest, NextResponse } from "next/server";
import {
  getAdminDashboardData,
  getFallbackAdminDashboardData,
} from "@/lib/admin-dashboard";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get("range");
    const rangeDays = rangeParam ? parseInt(rangeParam, 10) : 7;
    const validRange = [7, 30, 90].includes(rangeDays) ? rangeDays : 7;

    const data = await getAdminDashboardData(validRange);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/admin/dashboard] Error:", error);
    const fallback = getFallbackAdminDashboardData(7);
    return NextResponse.json(fallback);
  }
}
