"use client";

import type { UnifiedMetric } from "@/lib/analytics/types";
import {
  ArrowDownRight,
  ArrowUpRight,
  Database,
  Globe,
  Layers,
  Minus,
  TrendingUp,
} from "lucide-react";
import { useId } from "react";

interface KpiCardProps {
  metric: UnifiedMetric;
}

const SOURCE_CONFIG = {
  store: {
    label: "Store DB",
    borderGlow: "group-hover:border-blue-500/40",
    bgAccent: "bg-blue-500/5",
    tagBg: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/60",
    icon: Database,
    sparklineColor: "#2563eb",
  },
  "google-analytics": {
    label: "GA4",
    borderGlow: "group-hover:border-amber-500/40",
    bgAccent: "bg-amber-500/5",
    tagBg: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/60",
    icon: TrendingUp,
    sparklineColor: "#f59e0b",
  },
  "search-console": {
    label: "GSC",
    borderGlow: "group-hover:border-emerald-500/40",
    bgAccent: "bg-emerald-500/5",
    tagBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/60",
    icon: Globe,
    sparklineColor: "#10b981",
  },
  "meta-ads": {
    label: "Meta",
    borderGlow: "group-hover:border-pink-500/40",
    bgAccent: "bg-pink-500/5",
    tagBg: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-200/60",
    icon: Layers,
    sparklineColor: "#ec4899",
  },
};

function MiniSparkline({
  points,
  color,
}: {
  points: number[];
  color: string;
}) {
  const gradientId = useId();
  if (!points || points.length < 2) return null;

  const width = 80;
  const height = 28;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linePath = `M ${coords.join(" L ")}`;
  const areaPath = `M 0,${height} L ${coords.join(" L ")} L ${width},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible shrink-0 opacity-85 group-hover:opacity-100 transition-opacity"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function KpiCard({ metric }: KpiCardProps) {
  const isPositive = metric.trend.direction === "up";
  const source = metric.source || "store";
  const config = SOURCE_CONFIG[source] || SOURCE_CONFIG.store;
  const Icon = config.icon;

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

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${config.borderGlow}`}
    >
      {/* Ambient background glow */}
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl transition-all duration-300 ${config.bgAccent} group-hover:scale-125`}
      />

      {/* Card Header: Label & Source Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 group-hover:text-gray-900 border border-gray-100 transition-colors">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 truncate">
            {metric.label}
          </span>
        </div>

        <span
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${config.tagBg}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75 animate-pulse" />
          {config.label}
        </span>
      </div>

      {/* Metric Value & Visual Sparkline */}
      <div className="mt-4 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 font-sans">
            {metric.value}
          </p>
        </div>

        {metric.sparkline && metric.sparkline.length > 1 && (
          <div className="pb-1">
            <MiniSparkline points={metric.sparkline} color={config.sparklineColor} />
          </div>
        )}
      </div>

      {/* Period Delta Footnote */}
      <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
        <span className="text-[11px] text-gray-400">vs. previous period</span>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${trendBadgeStyle}`}
          aria-label={`${metric.trend.value} trend`}
        >
          <TrendIcon className="h-3 w-3" aria-hidden="true" />
          {metric.trend.value}
        </span>
      </div>
    </div>
  );
}