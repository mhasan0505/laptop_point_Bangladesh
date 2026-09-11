"use client";

import type { Series } from "@/lib/analytics/types";
import { formatBDT } from "@/lib/format";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useId, useMemo, useState } from "react";

function formatCurrencyAxis(value: number): string {
  if (value >= 1_000_000) return `৳${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `৳${(value / 1_000).toFixed(0)}K`;
  return `৳${Math.round(value)}`;
}

function formatCountAxis(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return `${Math.round(value)}`;
}

const SERIES_COLORS: Record<string, string> = {
  store_revenue: "#2563eb", // blue
  store_orders_count: "#8b5cf6", // violet
  store_orders: "#8b5cf6",
  ga_revenue: "#10b981", // emerald
  activeUsers: "#f59e0b", // amber
  organic_clicks: "#06b6d4", // cyan
  ad_spend: "#ec4899", // pink
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  isCurrency: boolean;
}

function CustomTooltip({
  active,
  payload,
  label,
  isCurrency,
}: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-2 min-w-[170px]">
      <p className="font-bold text-gray-900 border-b border-gray-100 pb-1.5">
        {label}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry: any) => {
          const color = entry.color || entry.stroke || "#3b82f6";
          const isCurr =
            entry.name?.toLowerCase().includes("revenue") ||
            entry.name?.toLowerCase().includes("spend");
          const formattedVal = isCurr
            ? formatBDT(entry.value)
            : entry.value.toLocaleString();

          return (
            <div
              key={entry.dataKey}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-600 font-medium truncate max-w-[130px]">
                  {entry.name}
                </span>
              </div>
              <span className="font-bold text-gray-900 font-mono">
                {formattedVal}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsLineChart({
  series,
  height = 320,
}: {
  series: Series[];
  height?: number;
}) {
  const chartId = useId();
  const hasCurrencySeries = series.some((s) => s.unit === "currency");
  const hasCountSeries = series.some((s) => s.unit === "count");

  // View mode: "financial" | "traffic" | "all"
  const [viewMode, setViewMode] = useState<"financial" | "traffic" | "all">(
    hasCurrencySeries ? "financial" : "traffic",
  );

  const filteredSeries = useMemo(() => {
    if (viewMode === "financial") {
      return series.filter((s) => s.unit === "currency");
    }
    if (viewMode === "traffic") {
      return series.filter((s) => s.unit === "count");
    }
    return series;
  }, [series, viewMode]);

  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());
  const activeSeries = filteredSeries.filter((s) => !hiddenKeys.has(s.key));

  const toggleSeries = (key: string) => {
    setHiddenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const mergedData = useMemo(() => {
    const byLabel = new Map<string, Record<string, number>>();
    const order: string[] = [];

    for (const s of filteredSeries) {
      for (const p of s.points) {
        if (!byLabel.has(p.label)) {
          byLabel.set(p.label, {});
          order.push(p.label);
        }
        byLabel.get(p.label)![s.key] = p.value;
      }
    }

    return order.map((label) => ({ label, ...byLabel.get(label)! }));
  }, [filteredSeries]);

  const isCurrencyMode = viewMode === "financial";
  const axisFormatter = isCurrencyMode ? formatCurrencyAxis : formatCountAxis;

  return (
    <div className="space-y-4">
      {/* Category View Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-1 rounded-xl bg-gray-100/80 p-1 text-xs font-semibold text-gray-600">
          {hasCurrencySeries && (
            <button
              type="button"
              onClick={() => setViewMode("financial")}
              className={`rounded-lg px-3.5 py-1.5 transition-all ${
                viewMode === "financial"
                  ? "bg-white text-gray-900 shadow-sm font-bold"
                  : "hover:text-gray-900"
              }`}
            >
              Revenue &amp; Ad Spend
            </button>
          )}
          {hasCountSeries && (
            <button
              type="button"
              onClick={() => setViewMode("traffic")}
              className={`rounded-lg px-3.5 py-1.5 transition-all ${
                viewMode === "traffic"
                  ? "bg-white text-gray-900 shadow-sm font-bold"
                  : "hover:text-gray-900"
              }`}
            >
              Traffic &amp; User Volume
            </button>
          )}
          {hasCurrencySeries && hasCountSeries && (
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={`rounded-lg px-3.5 py-1.5 transition-all ${
                viewMode === "all"
                  ? "bg-white text-gray-900 shadow-sm font-bold"
                  : "hover:text-gray-900"
              }`}
            >
              All Signals
            </button>
          )}
        </div>

        <span className="text-xs text-gray-400">
          Interactive multi-series telemetry
        </span>
      </div>

      {activeSeries.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          All series are toggled off. Click below to enable.
        </div>
      ) : (
        <div className="w-full" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={mergedData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                {activeSeries.map((s) => {
                  const color =
                    s.color || SERIES_COLORS[s.key] || "#2563eb";
                  return (
                    <linearGradient
                      key={s.key}
                      id={`gradient-${s.key}-${chartId}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                    </linearGradient>
                  );
                })}
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />

              <YAxis
                tickFormatter={axisFormatter}
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />

              <Tooltip
                content={<CustomTooltip isCurrency={isCurrencyMode} />}
              />

              {activeSeries.map((s) => {
                const color =
                  s.color || SERIES_COLORS[s.key] || "#2563eb";
                return (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={color}
                    strokeWidth={2.2}
                    fillOpacity={1}
                    fill={`url(#gradient-${s.key}-${chartId})`}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Series Toggle Controls */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
        {filteredSeries.map((s) => {
          const isHidden = hiddenKeys.has(s.key);
          const color = s.color || SERIES_COLORS[s.key] || "#2563eb";

          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggleSeries(s.key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                isHidden
                  ? "border-gray-200 bg-gray-100/60 text-gray-400 opacity-60"
                  : "border-gray-200 bg-white text-gray-800 shadow-xs hover:border-gray-300"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: isHidden ? "#94a3b8" : color }}
              />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}