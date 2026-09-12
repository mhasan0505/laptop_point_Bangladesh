import { Suspense } from "react";
import { MetaAdsReportView } from "@/components/admin/analytics/MetaAdsReportView";

export const revalidate = 600;

interface PageProps {
  searchParams: Promise<{ days?: string; range?: string }>;
}

export default async function MetaAdsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const daysParam = resolvedParams?.days || resolvedParams?.range || "30";
  const daysNumber = parseInt(daysParam.replace("d", ""), 10) || 30;

  const hasMetaCredentials = Boolean(
    process.env.META_ADS_ACCESS_TOKEN && process.env.META_ADS_ACCOUNT_ID
  );

  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        </div>
      }
    >
      <MetaAdsReportView isConfigured={hasMetaCredentials} days={daysNumber} />
    </Suspense>
  );
}
