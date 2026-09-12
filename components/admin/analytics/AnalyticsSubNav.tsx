"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  BarChart3,
  Calendar,
  ChevronRight,
  Download,
  Megaphone,
  RefreshCw,
  Search,
  ShoppingBag,
} from "lucide-react";
import { ReactNode } from "react";

const TABS = [
  { href: "/admin/analytics/kpi-overview", label: "KPI Overview", icon: BarChart3 },
  { href: "/admin/analytics/orders-report", label: "Store Orders", icon: ShoppingBag },
  { href: "/admin/analytics/ga4", label: "Google Analytics 4", icon: Activity },
  { href: "/admin/analytics/gsc", label: "Search Console", icon: Search },
  { href: "/admin/analytics/meta-ads", label: "Meta Ads", icon: Megaphone },
];

interface AnalyticsSubNavProps {
  title: string;
  description: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  extraActions?: ReactNode;
  onExport?: () => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function AnalyticsSubNav({
  title,
  description,
  breadcrumbs = [{ label: "Analytics", href: "/admin/analytics/kpi-overview" }],
  extraActions,
  onExport,
  isRefreshing,
  onRefresh,
}: AnalyticsSubNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get("range") || searchParams.get("days") || "30d";

  const handleRangeSelect = (range: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    // Keep days parameter in sync for APIs expecting days
    const numericDays = range === "today" ? "1" : range.replace("d", "");
    params.set("days", numericDays);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Breadcrumb row */}
      <nav aria-label="Breadcrumb" className="flex items-center text-xs text-zinc-500">
        <Link href="/admin" className="hover:text-zinc-900 transition-colors">
          Admin
        </Link>
        <ChevronRight className="w-3 h-3 mx-1 text-zinc-400" />
        {breadcrumbs.map((b, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <div key={b.label} className="flex items-center">
              {b.href && !isLast ? (
                <Link href={b.href} className="hover:text-zinc-900 transition-colors">
                  {b.label}
                </Link>
              ) : (
                <span className="font-semibold text-zinc-900">{b.label}</span>
              )}
              {!isLast && <ChevronRight className="w-3 h-3 mx-1 text-zinc-400" />}
            </div>
          );
        })}
      </nav>

      {/* Main Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            {description}
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {extraActions}

          {/* Unified Date Range Selector */}
          <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-white p-1 text-xs font-medium shadow-xs">
            <Calendar className="w-3.5 h-3.5 ml-2 mr-1.5 text-zinc-400" />
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "7D" },
              { id: "30d", label: "30D" },
              { id: "90d", label: "90D" },
            ].map(({ id, label }) => {
              const isSelected =
                currentRange === id ||
                (id === "7d" && currentRange === "7") ||
                (id === "30d" && currentRange === "30") ||
                (id === "90d" && currentRange === "90") ||
                (id === "today" && currentRange === "1");

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleRangeSelect(id)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    isSelected
                      ? "bg-zinc-900 text-white shadow-xs font-semibold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 shadow-xs transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          )}

          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-1 border-b border-zinc-200 overflow-x-auto pb-px">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? "border-indigo-600 text-indigo-600 font-semibold"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
