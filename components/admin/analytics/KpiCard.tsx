import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { UnifiedMetric } from "@/lib/analytics/types";

interface KpiCardProps {
  metric: UnifiedMetric;
}

const SOURCE_TAGS: Record<string, { label: string; color: string }> = {
  store: { label: "Store", color: "bg-blue-50 text-blue-700 border-blue-200" },
  "google-analytics": { label: "GA4", color: "bg-amber-50 text-amber-700 border-amber-200" },
  "search-console": { label: "GSC", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "meta-ads": { label: "Meta", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
};

export default function KpiCard({ metric }: KpiCardProps) {
  const isPositive = metric.trend.direction === "up";

  const TrendIcon =
    metric.trend.direction === "up"
      ? ArrowUpRight
      : metric.trend.direction === "down"
        ? ArrowDownRight
        : Minus;

  const trendBadgeStyle =
    metric.trend.direction === "flat"
      ? "border-gray-200 bg-gray-50 text-gray-600"
      : isPositive
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-rose-200 bg-rose-50 text-rose-700";

  const sourceTag = metric.source ? SOURCE_TAGS[metric.source] : undefined;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:border-gray-200 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {metric.label}
        </span>
        {sourceTag && (
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${sourceTag.color}`}
          >
            {sourceTag.label}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <span className="text-2xl font-bold tracking-tight text-gray-900">
          {metric.value}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${trendBadgeStyle}`}
          aria-label={`${metric.trend.value} trend vs previous period`}
        >
          <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {metric.trend.value}
        </span>
      </div>
    </div>
  );
}