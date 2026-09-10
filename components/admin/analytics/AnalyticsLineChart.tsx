"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Series } from "@/lib/analytics/types";

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
  store_orders: "#8b5cf6", // violet
  ga_revenue: "#10b981", // emerald
  activeUsers: "#f59e0b", // amber
  organic_clicks: "#06b6d4", // cyan
  ad_spend: "#ec4899", // pink
};

export default function AnalyticsLineChart({
  series,
  height = 300,
}: {
  series: Series[];
  height?: number;
}) {
  const hasCurrencySeries = series.some((s) => s.unit === "currency");
  const hasCountSeries = series.some((s) => s.unit === "count");

  // View mode: "financial" | "volume" | "all"
  const [viewMode, setViewMode] = useState<"financial" | "volume" | "all">(
    hasCurrencySeries ? "financial" : "volume",
  );

  const filteredSeries = useMemo(() => {
    if (viewMode === "financial") {
      return series.filter((s) => s.unit === "currency");
    }
    if (viewMode === "volume") {
      return series.filter((s) => s.unit === "count");
    }
    return series;
  }, [series, viewMode]);

  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());
  const activeSeries = filteredSeries.filter((s) => !hiddenKeys.has(s.key));

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
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 text-xs font-medium text-gray-600">
          {hasCurrencySeries && (
            <button
              type="button"
              onClick={() => setViewMode("financial")}
              className={`rounded-md px-3 py-1 transition-all ${
                viewMode === "financial"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "hover:text-gray-900"
              }`}
            >
              Financial (Revenue &amp; Spend)
            </button>
          )}
          {hasCountSeries && (
            <button
              type="button"
              onClick={() => setViewMode("volume")}
              className={`rounded-md px-3 py-1 transition-all ${
                viewMode === "volume"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "hover:text-gray-900"
              }`}
            >
              Traffic &amp; Order Volume
            </button>
          )}
          {hasCurrencySeries && hasCountSeries && (
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={`rounded-md px-3 py-1 transition-all ${
                viewMode === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "hover:text-gray-900"
              }`}
            >
              All Series
            </button>
          )}
        </div>

        <span className="text-xs text-gray-400">
          Showing {activeSeries.length} of {filteredSeries.length} series
        </span>
      </div>

      {activeSeries.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          No series selected. Click the buttons below to toggle lines on.
        </div>
      ) : (
        <div className="w-full" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mergedData} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                minTickGap={28}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={axisFormatter}
                width={56}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.75rem",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  fontSize: "0.8125rem",
                  padding: "0.5rem 0.75rem",
                }}
                labelStyle={{ fontWeight: 600, color: "#0f172a", marginBottom: "0.25rem" }}
                formatter={(value, name) => {
                  const val = Number(value || 0);
                  const matchedSeries = series.find((s) => s.label === name || s.key === name);
                  const formatted =
                    matchedSeries?.unit === "currency"
                      ? `৳${Math.round(val).toLocaleString()}`
                      : Math.round(val).toLocaleString();
                  return [formatted, matchedSeries?.label ?? name];
                }}
              />
              {activeSeries.map((s) => {
                const color = SERIES_COLORS[s.key] || "#2563eb";
                return (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={color}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: color, stroke: "#ffffff", strokeWidth: 2 }}
                    animationDuration={500}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Interactive Legend Toggles */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {filteredSeries.map((s) => {
          const isVisible = !hiddenKeys.has(s.key);
          const color = SERIES_COLORS[s.key] || "#2563eb";

          return (
            <button
              key={s.key}
              type="button"
              onClick={() =>
                setHiddenKeys((prev) => {
                  const next = new Set(prev);
                  if (next.has(s.key)) next.delete(s.key);
                  else next.add(s.key);
                  return next;
                })
              }
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                isVisible
                  ? "border-gray-200 bg-white text-gray-800 shadow-sm hover:border-gray-300"
                  : "border-gray-200 bg-gray-50 text-gray-400 opacity-60 hover:opacity-100"
              }`}
              aria-pressed={isVisible}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: isVisible ? color : "#cbd5e1" }}
              />
              {s.label}
              <span className="text-[10px] text-gray-400">
                ({s.unit === "currency" ? "BDT" : "Count"})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}