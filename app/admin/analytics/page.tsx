import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ days?: string; range?: string; simulate?: string }>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const params = new URLSearchParams();
  if (resolvedParams?.range) params.set("range", resolvedParams.range);
  if (resolvedParams?.days) params.set("days", resolvedParams.days);
  if (resolvedParams?.simulate) params.set("simulate", resolvedParams.simulate);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  redirect(`/admin/analytics/kpi-overview${queryString}`);
}