import { Suspense } from "react";
import { KpiOverviewView } from "@/components/admin/analytics/KpiOverviewView";
import { fetchUnifiedAnalytics, type UnifiedDashboard } from "@/lib/analytics";

export const revalidate = 600;

interface PageProps {
  searchParams: Promise<{ days?: string; range?: string; simulate?: string }>;
}

export default async function KpiOverviewPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const daysParam = resolvedParams?.days || resolvedParams?.range || "30";
  const simulateParam = resolvedParams?.simulate === "true";

  let data: UnifiedDashboard | null = null;
  let fetchError: unknown = null;

  try {
    data = await fetchUnifiedAnalytics(daysParam, simulateParam);
  } catch (error) {
    console.error("[KpiOverviewPage] Failed to fetch analytics:", error);
    fetchError = error;
  }

  if (fetchError || !data) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
        <h2 className="text-lg font-bold">Failed to load KPI Overview</h2>
        <p className="mt-1 text-sm text-rose-600">
          An unexpected error occurred while compiling your metrics. Please try refreshing.
        </p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        </div>
      }
    >
      <KpiOverviewView data={data} />
    </Suspense>
  );
}
