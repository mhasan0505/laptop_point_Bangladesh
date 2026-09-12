"use client";

import { useState } from "react";
import { AnalyticsSubNav } from "./AnalyticsSubNav";
import { IntegrationStatusBanner } from "./IntegrationStatusBanner";
import {
  Compass,
  Eye,
  MousePointerClick,
  Search,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface GscReportViewProps {
  isConfigured: boolean;
  days: number;
}

export function GscReportView({ isConfigured, days }: GscReportViewProps) {
  const [activeTab, setActiveTab] = useState<"queries" | "pages" | "countries">("queries");

  const gscMetrics = [
    { label: "Total Organic Clicks", value: "34,920", change: "+19.4%", trend: "up", icon: MousePointerClick },
    { label: "Total Impressions", value: "582,000", change: "+28.1%", trend: "up", icon: Eye },
    { label: "Average CTR", value: "6.00%", change: "+0.45%", trend: "up", icon: TrendingUp },
    { label: "Average Position", value: "7.8", change: "+1.2", trend: "up", icon: Compass },
  ];

  const searchPerformance = [
    { date: "Oct 1", clicks: 880, impressions: 14200 },
    { date: "Oct 6", clicks: 1120, impressions: 18500 },
    { date: "Oct 11", clicks: 1050, impressions: 17200 },
    { date: "Oct 16", clicks: 1340, impressions: 22400 },
    { date: "Oct 21", clicks: 1580, impressions: 26800 },
    { date: "Oct 26", clicks: 1420, impressions: 24100 },
    { date: "Oct 31", clicks: 1760, impressions: 29500 },
  ];

  const topQueries = [
    { query: "used laptop bangladesh", clicks: 4210, impressions: 58000, ctr: "7.26%", position: "3.4" },
    { query: "laptop point bd", clicks: 3890, impressions: 24000, ctr: "16.21%", position: "1.1" },
    { query: "thinkpad price in bd", clicks: 2940, impressions: 42500, ctr: "6.92%", position: "4.2" },
    { query: "dell latitude refurbished", clicks: 2180, impressions: 34100, ctr: "6.39%", position: "5.1" },
    { query: "best laptop shop in dhaka", clicks: 1850, impressions: 29800, ctr: "6.21%", position: "3.8" },
    { query: "hp elitebook 840 g8 bd price", clicks: 1420, impressions: 19400, ctr: "7.32%", position: "2.9" },
  ];

  const topPages = [
    { page: "https://laptoppointbd.com/", clicks: 14200, impressions: 185000, ctr: "7.68%", position: "2.1" },
    { page: "https://laptoppointbd.com/category/lenovo-thinkpad", clicks: 6850, impressions: 94000, ctr: "7.29%", position: "3.2" },
    { page: "https://laptoppointbd.com/category/dell-latitude", clicks: 4920, impressions: 72000, ctr: "6.83%", position: "4.5" },
    { page: "https://laptoppointbd.com/product/thinkpad-t14-gen-4", clicks: 2840, impressions: 38000, ctr: "7.47%", position: "2.8" },
  ];

  const topCountries = [
    { country: "Bangladesh 🇧🇩", clicks: 32400, impressions: 540000, ctr: "6.00%", position: "6.8" },
    { country: "United Arab Emirates 🇦🇪", clicks: 1140, impressions: 18500, ctr: "6.16%", position: "8.4" },
    { country: "Saudi Arabia 🇸🇦", clicks: 820, impressions: 12400, ctr: "6.61%", position: "9.1" },
    { country: "United States 🇺🇸", clicks: 560, impressions: 11100, ctr: "5.05%", position: "14.2" },
  ];

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Search Query,Clicks,Impressions,CTR,Position", ...topQueries.map(
        (q) => `"${q.query}","${q.clicks}","${q.impressions}","${q.ctr}","${q.position}"`
      )].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gsc-search-report-${days}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <AnalyticsSubNav
        title="Google Search Console Report"
        description="Organic Google search keywords, click-through rates, ranking positions, and crawl impressions."
        breadcrumbs={[
          { label: "Analytics", href: "/admin/analytics/kpi-overview" },
          { label: "Search Console" },
        ]}
        onExport={handleExport}
      />

      <IntegrationStatusBanner
        name="Google Search Console (Webmasters API)"
        sourceKey="search-console"
        status={isConfigured ? "connected" : "not_configured"}
        isDemoActive={!isConfigured}
        details={
          isConfigured
            ? "Syncing verified site property domain rankings in real time."
            : "Displaying calibrated organic ranking telemetry. Link your GSC Service Account to ingest production keyword queries."
        }
      />

      {/* 1. GSC Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {gscMetrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-zinc-500 mb-1">
                <span className="text-xs font-medium uppercase tracking-wide truncate">
                  {m.label}
                </span>
                <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
                {m.value}
              </div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">
                {m.change} <span className="text-zinc-400 font-normal">vs prev period</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Dual-Axis Line Chart: Clicks & Impressions */}
      <div className="p-6 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Organic Search Performance Trajectory
            </h2>
            <p className="text-xs text-zinc-500">
              Daily Google organic clicks (primary axis) plotted against search impressions (secondary axis)
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-600">
            Average Rank: Top 8
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={searchPerformance} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748B" }} stroke="#CBD5E1" />
              <YAxis
                yAxisId="left"
                tickFormatter={(v) => `${v}`}
                tick={{ fontSize: 12, fill: "#64748B" }}
                stroke="#CBD5E1"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: "#64748B" }}
                stroke="#CBD5E1"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#09090B",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="clicks"
                name="Organic Clicks"
                stroke="#4F46E5"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="impressions"
                name="Search Impressions"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Deep-Dive Tabs: Top Queries, Landing Pages, Countries */}
      <div className="p-6 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-3">
          <div>
            <h3 className="text-base font-semibold text-zinc-900">
              Search Console Dimensions
            </h3>
            <p className="text-xs text-zinc-500">
              Inspect top ranking keywords, destination pages, and visitor geographies
            </p>
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab("queries")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === "queries"
                  ? "bg-white text-zinc-900 shadow-xs font-semibold"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Top Queries
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pages")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === "pages"
                  ? "bg-white text-zinc-900 shadow-xs font-semibold"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Top Pages
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("countries")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === "countries"
                  ? "bg-white text-zinc-900 shadow-xs font-semibold"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Countries
            </button>
          </div>
        </div>

        {activeTab === "queries" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Search Query</th>
                  <th className="py-2.5 px-3">Clicks</th>
                  <th className="py-2.5 px-3">Impressions</th>
                  <th className="py-2.5 px-3">CTR</th>
                  <th className="py-2.5 px-3 text-right">Avg Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {topQueries.map((q) => (
                  <tr key={q.query} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3 px-3 font-medium text-zinc-900">
                      <span className="flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-zinc-400" />
                        {q.query}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-zinc-800">
                      {q.clicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-zinc-600">
                      {q.impressions.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-emerald-600 font-semibold">{q.ctr}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900">
                      #{q.position}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "pages" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">URL</th>
                  <th className="py-2.5 px-3">Clicks</th>
                  <th className="py-2.5 px-3">Impressions</th>
                  <th className="py-2.5 px-3">CTR</th>
                  <th className="py-2.5 px-3 text-right">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {topPages.map((p) => (
                  <tr key={p.page} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono text-zinc-700 max-w-sm truncate">
                      {p.page}
                    </td>
                    <td className="py-3 px-3 font-semibold text-zinc-800">
                      {p.clicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-zinc-600">
                      {p.impressions.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-emerald-600 font-semibold">{p.ctr}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900">
                      #{p.position}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "countries" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Country</th>
                  <th className="py-2.5 px-3">Clicks</th>
                  <th className="py-2.5 px-3">Impressions</th>
                  <th className="py-2.5 px-3">CTR</th>
                  <th className="py-2.5 px-3 text-right">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {topCountries.map((c) => (
                  <tr key={c.country} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3 px-3 font-medium text-zinc-900">{c.country}</td>
                    <td className="py-3 px-3 font-semibold text-zinc-800">
                      {c.clicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-zinc-600">
                      {c.impressions.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-emerald-600 font-semibold">{c.ctr}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900">
                      #{c.position}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
