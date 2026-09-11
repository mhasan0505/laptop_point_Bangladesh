"use client";

import type { UnifiedDashboard } from "@/lib/analytics";
import { formatBDT, formatDate } from "@/lib/format";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  Database,
  ExternalLink,
  Eye,
  Globe,
  Laptop,
  Layers,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import AcquisitionRadar from "./AcquisitionRadar";
import AnalyticsFunnel from "./AnalyticsFunnel";
import AnalyticsLineChart from "./AnalyticsLineChart";
import AnalyticsSetupModal from "./AnalyticsSetupModal";
import KpiCard from "./KpiCard";

interface AnalyticsDashboardProps {
  data: UnifiedDashboard;
}

export default function AnalyticsDashboard({
  data: initialData,
}: AnalyticsDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDays =
    searchParams.get("days") || searchParams.get("range") || "30";
  const initialSimulate = searchParams.get("simulate") === "true";

  const [data, setData] = useState<UnifiedDashboard>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isSimulateMode, setIsSimulateMode] = useState(
    initialSimulate || Boolean(initialData.isSimulated),
  );

  const {
    metrics,
    series,
    sources,
    period,
    fetchedAt,
    storeSummary,
    funnel,
    channelBreakdown,
  } = data;
  const connectedSourcesCount = sources.filter(
    (s) => s.status === "connected",
  ).length;

  const handleRangeChange = async (days: string) => {
    setIsRefreshing(true);
    const simQuery = isSimulateMode ? "&simulate=true" : "";
    router.push(`/admin/analytics?days=${days}${simQuery}`);
    try {
      const res = await fetch(
        `/api/admin/analytics?days=${days}&simulate=${isSimulateMode}`,
      );
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

  const handleToggleSimulation = async () => {
    const nextMode = !isSimulateMode;
    setIsSimulateMode(nextMode);
    setIsRefreshing(true);
    router.push(
      `/admin/analytics?days=${currentDays}${nextMode ? "&simulate=true" : ""}`,
    );
    try {
      const res = await fetch(
        `/api/admin/analytics?days=${currentDays}&simulate=${nextMode}`,
      );
      if (res.ok) {
        const updated = (await res.json()) as UnifiedDashboard;
        setData(updated);
      }
    } catch (err) {
      console.error("Failed to toggle simulation mode:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(
        `/api/admin/analytics?days=${currentDays}&refresh=true&simulate=${isSimulateMode}`,
      );
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
    <div className="space-y-6 text-gray-900 font-sans pb-12">
      {/* 1. Header & Executive Control Center */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-gray-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white shadow-xs">
              <TrendingUp className="h-4 w-4" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
              Intelligence &amp; Analytics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time multi-channel telemetry: Store Orders, GA4 Traffic, Google
            Search Console &amp; Meta Ads.
          </p>
        </div>

        {/* Controls Ribbon */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Simulation / Model projection toggle */}
          <button
            type="button"
            onClick={handleToggleSimulation}
            disabled={isRefreshing}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
              isSimulateMode
                ? "border-amber-300 bg-amber-50 text-amber-900 shadow-xs"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
            title="Toggle between live telemetry and modeled projection"
          >
            <Sparkles
              className={`h-3.5 w-3.5 ${isSimulateMode ? "text-amber-600" : "text-gray-400"}`}
            />
            <span>{isSimulateMode ? "Model Mode Active" : "Live Mode"}</span>
          </button>

          {/* Date range picker */}
          <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1 text-xs font-medium shadow-xs">
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
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  currentDays === r.value
                    ? "bg-black text-white font-bold shadow-xs"
                    : "text-gray-600 hover:text-black hover:bg-gray-50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Setup & Integrations Button */}
          <button
            type="button"
            onClick={() => setIsSetupModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-xs hover:bg-blue-100/70 transition-all"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span>Setup &amp; APIs</span>
          </button>

          {/* Refresh button */}
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs transition-all hover:bg-gray-50 hover:text-black disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Period timestamp badge */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-100/70 px-3 py-1.5 text-xs text-gray-600">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span>
              {formatDate(period.start)} – {formatDate(period.end)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Channel Integration Live Status Bar */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {sources.map((src) => {
          const isConnected = src.status === "connected";
          const isError = src.status === "error";

          return (
            <div
              key={src.source}
              onClick={() => setIsSetupModalOpen(true)}
              className="flex items-center gap-3 rounded-2xl border border-gray-200/70 bg-white p-3.5 shadow-xs hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all text-xs group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-700 group-hover:scale-105 transition-transform">
                {src.source === "store" ? (
                  <Database className="h-4 w-4 text-blue-600" />
                ) : src.source === "google-analytics" ? (
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                ) : src.source === "search-console" ? (
                  <Globe className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Layers className="h-4 w-4 text-pink-600" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="font-bold text-gray-900 truncate">
                    {src.displayName}
                  </p>
                </div>
                <p className="text-[11px] text-gray-500 truncate">
                  {isConnected
                    ? "Live sync active"
                    : isError
                      ? src.error || "Needs credentials"
                      : "Configure in Setup"}
                </p>
              </div>

              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
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
                {isConnected ? "Active" : isError ? "Config" : "Setup"}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. Hero KPI Cards Infographic Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
              Executive Performance Indicators
            </h2>
          </div>
          <span className="text-[11px] text-gray-400">
            Computed {formatDate(fetchedAt)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {metrics.map((metric) => (
            <KpiCard key={metric.key} metric={metric} />
          ))}
        </div>
      </section>

      {/* 4. Interactive E-Commerce & Marketing Conversion Funnel */}
      {funnel && funnel.length > 0 && (
        <section>
          <AnalyticsFunnel funnel={funnel} isSimulated={isSimulateMode} />
        </section>
      )}

      {/* 5. Time-series Multi-Chart Studio */}
      <section className="rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <h2 className="text-sm font-bold text-gray-900">
              Multi-Channel Time-Series Trends ({period.days || 30} Days)
            </h2>
          </div>
          <span className="text-xs text-gray-400 hidden sm:inline">
            Click category buttons to switch financial, traffic &amp; order signals
          </span>
        </div>

        {series.length > 0 ? (
          <AnalyticsLineChart series={series} />
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-gray-400">
            No time-series telemetry available for this range.
          </div>
        )}
      </section>

      {/* 6. Mid Deck: Top Selling Products Leaderboard + Acquisition Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products Leaderboard */}
        <section className="rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <Laptop className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Top Selling Laptops &amp; Gear
                </h3>
                <p className="text-xs text-gray-500">
                  Ranked by sales volume &amp; revenue share
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Leaderboard
            </span>
          </div>

          {storeSummary.topProducts.length > 0 ? (
            <div className="space-y-3 flex-1">
              {storeSummary.topProducts.map((p, idx) => {
                const maxRevenue = storeSummary.topProducts[0]?.revenue || 1;
                const sharePercent = Math.round((p.revenue / maxRevenue) * 100);

                return (
                  <div
                    key={p.id || idx}
                    className="flex flex-col gap-2 p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold shadow-xs ${
                            idx === 0
                              ? "bg-amber-400 text-white"
                              : idx === 1
                                ? "bg-slate-300 text-gray-800"
                                : idx === 2
                                  ? "bg-amber-700/80 text-white"
                                  : "bg-white text-gray-700 border border-gray-200"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {p.quantity} {p.quantity === 1 ? "unit" : "units"}{" "}
                            sold
                          </p>
                        </div>
                      </div>

                      <div className="text-right pl-3">
                        <p className="text-xs font-extrabold text-gray-900">
                          {formatBDT(p.revenue)}
                        </p>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-gray-200/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${sharePercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400 py-8">
              No product sales recorded in this period.
            </div>
          )}
        </section>

        {/* Acquisition Channel Radar */}
        {channelBreakdown && channelBreakdown.length > 0 && (
          <AcquisitionRadar channels={channelBreakdown} />
        )}
      </div>

      {/* 7. Bottom Deck: Payment Methods & Order Fulfillment Matrix */}
      <section className="rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Payment Distribution &amp; Order Fulfillment
              </h3>
              <p className="text-xs text-gray-500">
                Payment gateway volume &amp; fulfillment pipeline
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Fulfillment
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Payment Gateways (BDT)
            </p>
            {storeSummary.paymentMethods.length > 0 ? (
              <div className="space-y-2.5">
                {storeSummary.paymentMethods.map((pm) => (
                  <div
                    key={pm.method}
                    className="p-3 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1.5"
                  >
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-800">{pm.label}</span>
                      <span className="text-gray-900 font-mono">
                        {formatBDT(pm.total)} ({pm.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
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

          {/* Order Status Chips */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Fulfillment Pipeline
            </p>
            <div className="grid grid-cols-2 gap-3">
              {storeSummary.orderStatuses.length > 0 ? (
                storeSummary.orderStatuses.map((st) => (
                  <div
                    key={st.status}
                    className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 flex flex-col justify-between"
                  >
                    <span className="text-xs font-medium text-gray-500">
                      {st.label}
                    </span>
                    <span className="mt-2 text-xl font-extrabold text-gray-900 font-mono">
                      {st.count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic col-span-2">
                  No order status data available.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Setup & Configuration Modal */}
      <AnalyticsSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSuccess={handleManualRefresh}
      />
    </div>
  );
}