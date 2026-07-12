import { getAnalyticsData, getGoogleAnalyticsData } from "./actions";
import AnalyticsDashboard from "./AnalyticsDashboard";

export const metadata = {
  title: "Analytics | Admin Dashboard",
};

export default async function AnalyticsPage(props: { searchParams: Promise<{ range?: string }> }) {
  const searchParams = await props.searchParams;
  const range = (searchParams.range as "7d" | "30d" | "90d" | "6m" | "1y") || "6m";

  const result = await getAnalyticsData(range);
  const ga4Result = await getGoogleAnalyticsData(range);

  if (!result.success || !result.data) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black mb-2">Analytics</h1>
          <p className="text-red-600">
            Failed to load analytics data. {result.error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black mb-2">Analytics</h1>
        <p className="text-gray-600">
          View your store performance and insights.
        </p>
      </div>

      <AnalyticsDashboard 
        initialData={result.data} 
        ga4Data={ga4Result.success ? ga4Result.data : null}
        currentRange={range}
      />
    </div>
  );
}
