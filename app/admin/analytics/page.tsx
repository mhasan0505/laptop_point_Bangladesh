"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";
import {
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Download,
  Laptop,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";

interface BrandShare {
  brand: string;
  share: number;
  revenue: number;
  units: number;
}

interface TopProduct {
  name: string;
  sku: string;
  brand: string;
  units: number;
  revenue: number;
}

interface AnalyticsData {
  days: number;
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
  statusBreakdown: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  topProductsByUnits: TopProduct[];
  revenueByBrand: BrandShare[];
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { success: showToast, error: showErrorToast } = useToast();

  const fetchAnalytics = useCallback(async (range: string, isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setLoading(true);

    try {
      const daysMap: Record<string, number> = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        year: 365,
      };
      const days = daysMap[range] ?? 30;

      const res = await fetch(`/api/admin/analytics?days=${days}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load analytics");
      }

      const json: AnalyticsData = await res.json();
      setData(json);
      if (isManual) {
        showToast("Analytics data refreshed.");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      showErrorToast("Could not load analytics data.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [showToast, showErrorToast]);

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange, fetchAnalytics]);

  const exportAnalyticsCSV = () => {
    if (!data) return;

    const brandHeaders = ["Brand", "Revenue (BDT)", "Units Sold", "Market Share (%)"];
    const brandRows = (data.revenueByBrand || []).map((b) => [
      `"${b.brand}"`,
      b.revenue,
      b.units,
      `${b.share}%`,
    ]);

    const productHeaders = ["\nTop Performing Models", "SKU", "Brand", "Units Sold", "Revenue (BDT)"];
    const productRows = (data.topProductsByUnits || []).map((p) => [
      `"${p.name}"`,
      `"${p.sku}"`,
      `"${p.brand}"`,
      p.units,
      p.revenue,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        brandHeaders.join(","),
        ...brandRows.map((e) => e.join(",")),
        productHeaders.join(","),
        ...productRows.map((e) => e.join(",")),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `blg-analytics-${timeRange}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Analytics report exported as CSV.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Performance & Conversion Insights
            </p>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Sales & Store Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time revenue trajectories, order fulfillment breakdowns, and top-performing hardware catalog sales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 text-xs font-semibold rounded-sm border-border"
            onClick={() => fetchAnalytics(timeRange, true)}
            disabled={loading || isRefreshing}
            title="Refresh analytics"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
          </Button>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            disabled={loading}
            className="h-9 rounded-sm border border-border bg-card px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="year">Year to Date (365d)</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs font-semibold rounded-sm border-border gap-1.5"
            onClick={exportAnalyticsCSV}
            disabled={loading || !data || data.orderCount === 0}
          >
            <Download size={13} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-md border border-border bg-card p-5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Total Revenue */}
          <div className="rounded-md border border-border bg-card p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Revenue</p>
              <div className="grid h-8 w-8 place-items-center rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CircleDollarSign size={16} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-lg sm:text-2xl font-bold text-foreground">
                ৳{(data?.totalRevenue ?? 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp size={11} />
                <span>Last {data?.days ?? 30} days gross</span>
              </p>
            </div>
          </div>

          {/* Total Orders */}
          <div className="rounded-md border border-border bg-card p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Orders</p>
              <div className="grid h-8 w-8 place-items-center rounded-sm bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <ShoppingBag size={16} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-lg sm:text-2xl font-bold text-foreground">
                {(data?.orderCount ?? 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 size={11} />
                <span>{data?.statusBreakdown.delivered ?? 0} Delivered</span>
              </p>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="rounded-md border border-border bg-card p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Average Order Value</p>
              <div className="grid h-8 w-8 place-items-center rounded-sm bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <CircleDollarSign size={16} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-lg sm:text-2xl font-bold text-foreground">
                ৳{(data?.avgOrderValue ?? 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                Per customer transaction
              </p>
            </div>
          </div>

          {/* Pending Fulfillment */}
          <div className="rounded-md border border-border bg-card p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pending Orders</p>
              <div className="grid h-8 w-8 place-items-center rounded-sm bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock size={16} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-lg sm:text-2xl font-bold text-foreground">
                {data?.statusBreakdown.pending ?? 0}
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                {data?.statusBreakdown.processing ?? 0} In processing
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Revenue Share */}
        <div className="rounded-md border border-border bg-card shadow-2xs p-5">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Revenue by Laptop Brand</h2>
              <p className="text-[11px] text-muted-foreground">Distribution across manufacturers</p>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Share</span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : !data?.revenueByBrand?.length ? (
            <div className="h-44 flex flex-col items-center justify-center text-center p-4">
              <Laptop size={24} className="text-muted-foreground/50 mb-2" />
              <p className="text-xs font-semibold text-foreground">No brand revenue data</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Orders placed in this time range will populate brand market share.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.revenueByBrand.map((item) => (
                <div key={item.brand} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{item.brand}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{item.units} units</span>
                      <span className="font-bold text-foreground">৳{item.revenue.toLocaleString()}</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 w-8 text-right">
                        {item.share}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(item.share, 2))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top 10 Best Selling Models */}
        <div className="rounded-md border border-border bg-card shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-foreground">Top-Selling Hardware Models</h2>
                <p className="text-[11px] text-muted-foreground">Ranked by unit volume</p>
              </div>
              <Laptop size={15} className="text-muted-foreground" />
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 rounded bg-muted animate-pulse" />
                ))}
              </div>
            ) : !data?.topProductsByUnits?.length ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4">
                <ShoppingBag size={24} className="text-muted-foreground/50 mb-2" />
                <p className="text-xs font-semibold text-foreground">No product sales in this period</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Completed customer purchases will display the top-selling laptops here.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {data.topProductsByUnits.map((p, idx) => (
                  <div
                    key={p.sku || p.name}
                    className="flex items-center justify-between p-2.5 rounded-sm border border-border bg-background/60 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-[10px] text-foreground">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {p.brand} {p.sku ? `· ${p.sku}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-foreground">৳{p.revenue.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">{p.units} units sold</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
