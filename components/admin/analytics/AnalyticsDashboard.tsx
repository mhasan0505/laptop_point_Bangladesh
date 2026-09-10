"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  Database,
  Globe,
  Laptop,
  Layers,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import AnalyticsLineChart from "./AnalyticsLineChart";
import KpiCard from "./KpiCard";
import type { UnifiedDashboard } from "@/lib/analytics";
import { formatBDT, formatDate } from "@/lib/format";

interface AnalyticsDashboardProps {
  data: UnifiedDashboard;
}

export default function AnalyticsDashboard({ data: initialData }: AnalyticsDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDays = searchParams.get("days") || searchParams.get("range") || "30";

  const [data, setData] = useState<UnifiedDashboard>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { metrics, series, sources, period, fetchedAt, storeSummary } = data;
  const configuredSourcesCount = sources.filter((s) => s.status === "connected").length;

  const handleRangeChange = async (days: string) => {
    setIsRefreshing(true);
    router.push(`/admin/analytics?days=${days}`);
    try {
      const res = await fetch(`/api/admin/analytics?days=${days}`);
      if (res.ok) {
        const updated = (await res.json()) as UnifiedDashboard;
        setData(updated);
      }
    } catch (err) {
      console.error("Failed to update range:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/admin/analytics?days=${currentDays}&refresh=true`);
      if (res.ok) {
        const updated = (await res.json()) as UnifiedDashboard;
        setData(updated);
      }
    } catch (err) {
      console.error("Failed to refresh analytics:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 text-gray-900 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Analytics &amp; Performance
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Unified store intelligence: PostgreSQL orders, GA4 traffic, Search Console, &amp; Meta Ads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Date range picker */}
          <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1 text-xs font-medium shadow-sm">
            {[
              { label: "7 Days", value: "7" },
              { label: "30 Days", value: "30" },
              { label: "90 Days", value: "90" },
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => handleRangeChange(r.value)}
                disabled={isRefreshing}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  currentDays === r.value
                    ? "bg-black text-white font-semibold shadow-sm"
                    : "text-gray-600 hover:text-black hover:bg-gray-50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-black disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Period timestamp badge */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-100/70 px-3 py-1.5 text-xs text-gray-600">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span>
              {formatDate(period.start)} – {formatDate(period.end)}
            </span>
          </div>
        </div>
      </div>

      {/* Integration Status Bar */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {sources.map((src) => {
          const isConnected = src.status === "connected";
          const isError = src.status === "error";

          return (
            <div
              key={src.source}
              className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-3.5 py-2.5 shadow-sm text-xs"
            >
              {src.source === "store" ? (
                <Database className="h-4 w-4 text-blue-600" />
              ) : src.source === "google-analytics" ? (
                <TrendingUp className="h-4 w-4 text-amber-500" />
              ) : src.source === "search-console" ? (
                <Globe className="h-4 w-4 text-emerald-600" />
              ) : (
                <Layers className="h-4 w-4 text-indigo-600" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 truncate">{src.displayName}</p>
                <p className="text-[11px] text-gray-400 truncate">
                  {isConnected
                    ? "Live sync active"
                    : isError
                      ? src.error || "Connection error"
                      : "Not configured in .env"}
                </p>
              </div>
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  isConnected
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    : isError
                      ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}
              >
                {isConnected ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <CircleAlert className="h-3 w-3" />
                )}
                {isConnected ? "Active" : isError ? "Error" : "Setup"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Top KPI Cards Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-600">
            Key Performance Metrics
          </h2>
          <span className="text-xs text-gray-400">Updated {formatDate(fetchedAt)}</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <KpiCard key={metric.key} metric={metric} />
          ))}
        </div>
      </section>

      {/* Time-series Performance Chart */}
      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-gray-900">
              Performance Trend ({period.days || 30} Days)
            </h2>
          </div>
          <span className="text-xs text-gray-400 hidden sm:inline">
            Toggle series on or off using buttons below
          </span>
        </div>

        {series.length > 0 ? (
          <AnalyticsLineChart series={series} />
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-gray-400">
            No time-series data available for this range.
          </div>
        )}
      </section>

      {/* Store E-Commerce Breakdown: Top Products & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Laptop className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">Top Selling Products</h3>
            </div>
            <span className="text-xs text-gray-400">By sales volume</span>
          </div>

          {storeSummary.topProducts.length > 0 ? (
            <div className="space-y-3 flex-1">
              {storeSummary.topProducts.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50/70 border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-700 shadow-sm border border-gray-200">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-[11px] text-gray-500">
                        {p.quantity} {p.quantity === 1 ? "unit" : "units"} sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right pl-3">
                    <p className="text-xs font-bold text-gray-900">{formatBDT(p.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400 py-8">
              No product sales recorded in this period.
            </div>
          )}
        </section>

        {/* Payment Methods & Order Status Breakdown */}
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-gray-900">Payment &amp; Fulfillment</h3>
            </div>
            <span className="text-xs text-gray-400">Channel distribution</span>
          </div>

          <div className="space-y-4 flex-1">
            {/* Payment methods */}
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Payment Methods
              </p>
              {storeSummary.paymentMethods.length > 0 ? (
                <div className="space-y-2">
                  {storeSummary.paymentMethods.map((pm) => (
                    <div key={pm.method} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-gray-700">{pm.label}</span>
                        <span className="text-gray-500">
                          {formatBDT(pm.total)} ({pm.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${Math.min(pm.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No payment records yet.</p>
              )}
            </div>

            {/* Order status chips */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">
                Order Fulfillment Status
              </p>
              <div className="flex flex-wrap gap-2">
                {storeSummary.orderStatuses.length > 0 ? (
                  storeSummary.orderStatuses.map((st) => (
                    <div
                      key={st.status}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700"
                    >
                      <span>{st.label}:</span>
                      <span className="font-bold text-gray-900">{st.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No order status data.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Integration Setup Assistance Banner (if external sources aren't configured) */}
      {configuredSourcesCount < sources.length && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <ShoppingBag className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-gray-900">
                Connect Google Analytics, Search Console &amp; Meta Ads
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Your store orders and internal revenue tracking are live! To also view external visitor sessions,
                organic search impressions, and ad spend return (ROAS), add your service credentials to{" "}
                <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-blue-200">
                  .env.local
                </code>
                :
              </p>
              <div className="mt-2 text-xs font-mono bg-white p-3 rounded-lg border border-blue-200/80 text-gray-800 space-y-1">
                <p># Google Analytics &amp; Search Console (File path OR inline JSON)</p>
                <p>GOOGLE_APPLICATION_CREDENTIALS=google-credential.json</p>
                <p>GA_PROPERTY_ID=520924604</p>
                <p>GSC_SITE_URL=https://laptoppointbd.com/</p>
                <p className="pt-1"># Meta Ads Marketing API</p>
                <p>META_ADS_ACCESS_TOKEN=EAAG...</p>
                <p>META_ADS_ACCOUNT_ID=act_1234567890</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}