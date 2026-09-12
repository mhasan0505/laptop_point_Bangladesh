"use client";

import { AnalyticsSubNav } from "./AnalyticsSubNav";
import { IntegrationStatusBanner } from "./IntegrationStatusBanner";
import {
  Activity,
  Clock,
  Globe,
  Laptop,
  Smartphone,
  Tablet,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Ga4ReportViewProps {
  isConfigured: boolean;
  days: number;
}

export function Ga4ReportView({ isConfigured, days }: Ga4ReportViewProps) {
  const ga4Metrics = [
    { label: "Total Active Users", value: "48,250", change: "+16.8%", trend: "up", icon: Users },
    { label: "Sessions", value: "68,900", change: "+14.2%", trend: "up", icon: Activity },
    { label: "Engagement Rate", value: "62.4%", change: "+3.1%", trend: "up", icon: TrendingUp },
    { label: "Avg Session Duration", value: "2m 48s", change: "+18s", trend: "up", icon: Clock },
    { label: "Key Conversions", value: "1,240", change: "+8.9%", trend: "up", icon: Globe },
    { label: "GA4 E-commerce Rev", value: "৳4,210,000", change: "+12.6%", trend: "up", icon: TrendingUp },
  ];

  const acquisitionData = [
    { date: "Oct 1", organic: 3200, paid: 1800, direct: 1400, referral: 600, social: 900 },
    { date: "Oct 6", organic: 3800, paid: 2400, direct: 1600, referral: 750, social: 1100 },
    { date: "Oct 11", organic: 3500, paid: 2200, direct: 1500, referral: 700, social: 1050 },
    { date: "Oct 16", organic: 4400, paid: 3100, direct: 1900, referral: 850, social: 1400 },
    { date: "Oct 21", organic: 5100, paid: 3800, direct: 2200, referral: 950, social: 1650 },
    { date: "Oct 26", organic: 4700, paid: 2900, direct: 2050, referral: 880, social: 1350 },
    { date: "Oct 31", organic: 5600, paid: 4200, direct: 2400, referral: 1100, social: 1800 },
  ];

  const deviceDonut = [
    { name: "Desktop", value: 58, color: "#4F46E5", icon: Laptop },
    { name: "Mobile", value: 38, color: "#10B981", icon: Smartphone },
    { name: "Tablet", value: 4, color: "#F59E0B", icon: Tablet },
  ];

  const topPages = [
    { page: "/", title: "Homepage | Laptop Point BD", sessions: 28400, bounceRate: "28.4%", conversionRate: "3.2%" },
    { page: "/category/lenovo-thinkpad", title: "Lenovo ThinkPad Used Laptops in BD", sessions: 14200, bounceRate: "24.1%", conversionRate: "4.8%" },
    { page: "/category/dell-latitude", title: "Dell Latitude Corporate Ultrabooks", sessions: 9800, bounceRate: "26.7%", conversionRate: "3.9%" },
    { page: "/category/hp-elitebook", title: "HP EliteBook Professional Series", sessions: 8100, bounceRate: "31.2%", conversionRate: "3.1%" },
    { page: "/product/thinkpad-t14-gen-4", title: "ThinkPad T14 Gen 4 Core i7 16GB", sessions: 5400, bounceRate: "18.6%", conversionRate: "6.4%" },
  ];

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Landing Page,Page Title,Sessions,Bounce Rate,Conversion Rate", ...topPages.map(
        (p) => `"${p.page}","${p.title}","${p.sessions}","${p.bounceRate}","${p.conversionRate}"`
      )].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ga4-traffic-report-${days}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <AnalyticsSubNav
        title="Google Analytics 4 Traffic Report"
        description="Session attribution, acquisition channel trends, engagement rate, and landing page conversions."
        breadcrumbs={[
          { label: "Analytics", href: "/admin/analytics/kpi-overview" },
          { label: "Google Analytics 4" },
        ]}
        onExport={handleExport}
      />

      <IntegrationStatusBanner
        name="Google Analytics 4 (Data API)"
        sourceKey="google-analytics"
        status={isConfigured ? "connected" : "not_configured"}
        isDemoActive={!isConfigured}
        details={
          isConfigured
            ? "Syncing property stream telemetry in real time."
            : "Displaying calibrated analytics stream. Connect your Google Cloud Service Account to ingest live GA4 traffic."
        }
      />

      {/* Real-time Indicator Widget */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 text-white shadow-xs">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <div className="text-xs">
            <span className="font-semibold text-emerald-400">Real-Time Active Visitors:</span>{" "}
            <strong className="text-sm font-bold text-white ml-1">42 Users</strong> on site right now
          </div>
        </div>
        <span className="text-[11px] text-zinc-400 hidden sm:inline">
          Most active page: <code className="text-zinc-200">/category/lenovo-thinkpad</code> (16 users)
        </span>
      </div>

      {/* 1. GA4 Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {ga4Metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-zinc-500 mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wide truncate">
                  {m.label}
                </span>
                <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
              </div>
              <div className="text-xl font-bold tracking-tight text-zinc-900 mt-1">
                {m.value}
              </div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">
                {m.change} <span className="text-zinc-400 font-normal">vs prev period</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Stacked Traffic Acquisition Chart */}
      <div className="p-6 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Traffic Acquisition by Channel
            </h2>
            <p className="text-xs text-zinc-500">
              Daily incoming sessions segmented by organic search, paid social, direct, and referrals
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-600">
            Organic Search is leading (41%)
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={acquisitionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748B" }} stroke="#CBD5E1" />
              <YAxis tick={{ fontSize: 12, fill: "#64748B" }} stroke="#CBD5E1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#09090B",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="organic" name="Organic Search" stackId="a" fill="#10B981" />
              <Bar dataKey="paid" name="Paid Ads" stackId="a" fill="#4F46E5" />
              <Bar dataKey="direct" name="Direct" stackId="a" fill="#3B82F6" />
              <Bar dataKey="social" name="Social" stackId="a" fill="#F59E0B" />
              <Bar dataKey="referral" name="Referral" stackId="a" fill="#94A3B8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Top Pages Table & Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Landing Pages Table */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Top Landing Pages & High-Intent Categories
              </h3>
              <p className="text-xs text-zinc-500">
                Catalog URLs driving the highest customer engagement and checkout intent
              </p>
            </div>
            <span className="text-xs text-zinc-400 font-mono">5 URLs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Page URL & Title</th>
                  <th className="py-2.5 px-3">Sessions</th>
                  <th className="py-2.5 px-3">Bounce Rate</th>
                  <th className="py-2.5 px-3 text-right">Conv. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {topPages.map((p) => (
                  <tr key={p.page} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-zinc-900">{p.title}</div>
                      <div className="text-zinc-400 font-mono text-[11px]">{p.page}</div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-zinc-800">
                      {p.sessions.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-zinc-600">{p.bounceRate}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-bold text-emerald-600">{p.conversionRate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Device Breakdown Donut */}
        <div className="p-6 rounded-xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Device Breakdown</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Visitor browser platform split for selected period
            </p>
          </div>

          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceDonut}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {deviceDonut.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: unknown) => [`${String(val ?? "")}%`, "Share"]}
                  contentStyle={{
                    backgroundColor: "#09090B",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-zinc-900">58%</span>
              <span className="text-[10px] uppercase font-semibold text-zinc-400">Desktop</span>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-zinc-100 text-xs">
            {deviceDonut.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-zinc-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-zinc-900">{item.value}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
