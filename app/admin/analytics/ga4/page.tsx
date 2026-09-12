import { Suspense } from "react";
import { Ga4ReportView } from "@/components/admin/analytics/Ga4ReportView";

export const revalidate = 600;

interface PageProps {
  searchParams: Promise<{ days?: string; range?: string }>;
}

export default async function Ga4AnalyticsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const daysParam = resolvedParams?.days || resolvedParams?.range || "30";
  const daysNumber = parseInt(daysParam.replace("d", ""), 10) || 30;

  const hasGaCredentials = Boolean(
    process.env.GA_SERVICE_ACCOUNT && (process.env.GA_PROPERTY_ID || process.env.GA4_PROPERTY_ID)
  );

  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        </div>
      }
    >
      <Ga4ReportView isConfigured={hasGaCredentials} days={daysNumber} />
    </Suspense>
  );
}
