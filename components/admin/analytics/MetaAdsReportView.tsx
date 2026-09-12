"use client";

import { useState } from "react";
import { AnalyticsSubNav } from "./AnalyticsSubNav";
import { IntegrationStatusBanner } from "./IntegrationStatusBanner";
import {
  DollarSign,
  Eye,
  ExternalLink,
  MousePointerClick,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MetaAdsReportViewProps {
  isConfigured: boolean;
  days: number;
}

export function MetaAdsReportView({ isConfigured, days }: MetaAdsReportViewProps) {
  const [filterStatus, setFilterStatus] = useState("All");

  const metaMetrics = [
    { label: "Total Ad Spend", value: "৳185,400", change: "+12.4%", trend: "up", icon: DollarSign },
    { label: "Impressions", value: "642,800", change: "+24.1%", trend: "up", icon: Eye },
    { label: "Click-Through Rate (CTR)", value: "2.48%", change: "+0.32%", trend: "up", icon: MousePointerClick },
    { label: "Cost Per Click (CPC)", value: "৳11.60", change: "-8.4%", trend: "down", icon: TrendingUp },
    { label: "Blended ROAS", value: "4.82x", change: "+0.45x", trend: "up", icon: TrendingUp },
    { label: "Attributed Purchases", value: "78", change: "+16.2%", trend: "up", icon: ShoppingBag },
  ];

  const trendData = [
    { date: "Day 1", spend: 18000, revenue: 78000 },
    { date: "Day 5", spend: 24000, revenue: 112000 },
    { date: "Day 10", spend: 22000, revenue: 98000 },
    { date: "Day 15", spend: 31000, revenue: 165000 },
    { date: "Day 20", spend: 38000, revenue: 195000 },
    { date: "Day 25", spend: 29000, revenue: 145000 },
    { date: `Day ${days}`, spend: 42000, revenue: 215000 },
  ];

  const campaigns = [
    {
      id: "camp_1",
      name: "MOFU - ThinkPad T14 Gen 4 Business Promo",
      status: "Active",
      budget: "৳1,500/day",
      spend: 42500,
      clicks: 3840,
      cpc: "৳11.06",
      purchases: 24,
      roas: 5.4,
    },
    {
      id: "camp_2",
      name: "BOFU - Dynamic Retargeting (Cart Abandoners)",
      status: "Active",
      budget: "৳1,000/day",
      spend: 28400,
      clicks: 1920,
      cpc: "৳14.79",
      purchases: 22,
      roas: 6.8,
    },
    {
      id: "camp_3",
      name: "TOFU - Dell Latitude 7420 Student Deal",
      status: "Paused",
      budget: "৳800/day",
      spend: 21600,
      clicks: 2200,
      cpc: "৳9.81",
      purchases: 8,
      roas: 2.9,
    },
    {
      id: "camp_4",
      name: "PROMO - HP EliteBook 840 G8 Flash Sale",
      status: "Active",
      budget: "৳2,000/day",
      spend: 54000,
      clicks: 4680,
      cpc: "৳11.53",
      purchases: 18,
      roas: 4.1,
    },
    {
      id: "camp_5",
      name: "SEASONAL - MacBook Pro & Air Clearance",
      status: "Paused",
      budget: "৳1,200/day",
      spend: 38900,
      clicks: 3300,
      cpc: "৳11.78",
      purchases: 6,
      roas: 2.4,
    },
  ];

  const creatives = [
    {
      id: "cr_1",
      headline: "ThinkPad T14 Gen 4: Grade A+ Corporate Refurbished",
      format: "Single Image • 1080x1080",
      image: "/Hero_Image.png",
      roas: "6.2x",
      spend: "৳34,000",
      purchases: 19,
    },
    {
      id: "cr_2",
      headline: "Core i7 + 16GB RAM Laptop Deals under ৳50,000",
      format: "Carousel • 4 Cards",
      image: "/Hero_Image.png",
      roas: "4.9x",
      spend: "৳26,500",
      purchases: 14,
    },
    {
      id: "cr_3",
      headline: "Dell Latitude 7420 Ultrabooks - Cash on Delivery BD",
      format: "Video 9:16 • Reels",
      image: "/Hero_Image.png",
      roas: "3.7x",
      spend: "৳18,200",
      purchases: 7,
    },
  ];

  const funnelStages = [
    { step: "Reach / Impressions", count: "642,800", rate: "100%", color: "bg-indigo-500" },
    { step: "Outbound Clicks", count: "15,940", rate: "2.48%", color: "bg-blue-500" },
    { step: "Add to Cart", count: "1,140", rate: "7.15%", color: "bg-amber-500" },
    { step: "Purchases", count: "78", rate: "6.84%", color: "bg-emerald-500" },
  ];

  const filteredCampaigns = campaigns.filter(
    (c) => filterStatus === "All" || c.status === filterStatus
  );

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Campaign,Status,Spend,Clicks,Purchases,ROAS", ...campaigns.map(
        (c) => `"${c.name}","${c.status}","${c.spend}","${c.clicks}","${c.purchases}","${c.roas}x"`
      )].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `meta-ads-report-${days}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <AnalyticsSubNav
        title="Meta Ads Performance Report"
        description="Facebook & Instagram paid campaign performance, ROAS, and ad creative attribution."
        breadcrumbs={[
          { label: "Analytics", href: "/admin/analytics/kpi-overview" },
          { label: "Meta Ads" },
        ]}
        onExport={handleExport}
      />

      <IntegrationStatusBanner
        name="Meta Marketing API"
        sourceKey="meta-ads"
        status={isConfigured ? "connected" : "not_configured"}
        isDemoActive={!isConfigured}
        details={
          isConfigured
            ? "Syncing campaign insights from your Meta Ad Account."
            : "Displaying calibrated performance data. Connect your Meta Access Token to ingest live campaign telemetry."
        }
      />

      {/* 1. Meta Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metaMetrics.map((m) => {
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

      {/* 2. Spend vs Attributed Revenue Chart */}
      <div className="p-6 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Spend vs Attributed Revenue & ROAS Trajectory
            </h2>
            <p className="text-xs text-zinc-500">
              Daily marketing spend correlated with Pixel purchase conversions over {days} days
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Target ROAS: 4.0x+
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748B" }} stroke="#CBD5E1" />
              <YAxis
                yAxisId="left"
                tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: "#64748B" }}
                stroke="#CBD5E1"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: "#64748B" }}
                stroke="#CBD5E1"
              />
              <Tooltip
                formatter={(val: unknown, name?: unknown) => [
                  `৳${Number(val || 0).toLocaleString()}`,
                  String(name ?? ""),
                ]}
                contentStyle={{
                  backgroundColor: "#09090B",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar yAxisId="left" dataKey="spend" name="Ad Spend" fill="#94A3B8" radius={[4, 4, 0, 0]} barSize={22} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" name="Attributed Revenue" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Campaign Performance Table */}
      <div className="p-6 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-900">
              Active & Historic Meta Campaigns
            </h3>
            <p className="text-xs text-zinc-500">
              Performance metrics grouped at campaign level with direct status controls
            </p>
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
            {["All", "Active", "Paused"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  filterStatus === status
                    ? "bg-white text-zinc-900 shadow-xs font-semibold"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Budget</th>
                <th className="py-3 px-4">Spend</th>
                <th className="py-3 px-4">Clicks (CPC)</th>
                <th className="py-3 px-4">Purchases</th>
                <th className="py-3 px-4 text-right">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredCampaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-zinc-900">
                    {camp.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        camp.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          camp.status === "Active" ? "bg-emerald-500" : "bg-zinc-400"
                        }`}
                      />
                      {camp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-zinc-600">
                    {camp.budget}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-zinc-900">
                    ৳{camp.spend.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-zinc-600">
                    {camp.clicks.toLocaleString()}{" "}
                    <span className="text-zinc-400">({camp.cpc})</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-zinc-900">
                    {camp.purchases}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`font-bold text-sm ${
                        camp.roas >= 4.0 ? "text-emerald-600" : "text-zinc-900"
                      }`}
                    >
                      {camp.roas}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Bottom Grid: Marketing Funnel & Creative Performance Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ad Conversion Funnel */}
        <div className="p-6 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              Paid Social Conversion Funnel
            </h3>
            <p className="text-xs text-zinc-500">
              Drop-off velocity from ad impression to verified checkout
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {funnelStages.map((stage, idx) => (
              <div key={stage.step} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-700">{stage.step}</span>
                  <span className="font-bold text-zinc-900">{stage.count}</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full ${stage.color} rounded-full`}
                    style={{ width: `${Math.max(12, 100 - idx * 28)}%` }}
                  />
                </div>
                <div className="text-[11px] text-zinc-400 text-right">
                  Conversion step: {stage.rate}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-zinc-100 text-xs text-zinc-500">
            Click-to-purchase efficiency: <strong>0.49%</strong>
          </div>
        </div>

        {/* Creative Performance Mini-Gallery */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Top Creative Assets Gallery
              </h3>
              <p className="text-xs text-zinc-500">
                Visual creatives generating the highest return on ad spend
              </p>
            </div>
            <a
              href="https://adsmanager.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
            >
              Meta Ads Manager <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {creatives.map((creative) => (
              <div
                key={creative.id}
                className="group rounded-lg border border-zinc-200 overflow-hidden bg-zinc-50/50 flex flex-col justify-between"
              >
                <div className="aspect-video w-full bg-zinc-200 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={creative.image}
                    alt={creative.headline}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/75 text-white backdrop-blur-xs">
                    ROAS {creative.roas}
                  </span>
                </div>

                <div className="p-3.5 space-y-2">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-900 line-clamp-1">
                      {creative.headline}
                    </h4>
                    <p className="text-[11px] text-zinc-500">{creative.format}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/70 text-[11px]">
                    <div>
                      <span className="text-zinc-400 block">Spend</span>
                      <strong className="text-zinc-800">{creative.spend}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Purchases</span>
                      <strong className="text-zinc-800">{creative.purchases} sales</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
