import { Suspense } from "react";
import { GscReportView } from "@/components/admin/analytics/GscReportView";

export const revalidate = 600;

interface PageProps {
  searchParams: Promise<{ days?: string; range?: string }>;
}

export default async function GscAnalyticsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const daysParam = resolvedParams?.days || resolvedParams?.range || "30";
  const daysNumber = parseInt(daysParam.replace("d", ""), 10) || 30;

  const hasGscCredentials = Boolean(
    process.env.GSC_SERVICE_ACCOUNT && process.env.GSC_SITE_URL
  );

  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        </div>
      }
    >
      <GscReportView isConfigured={hasGscCredentials} days={daysNumber} />
    </Suspense>
  );
}
