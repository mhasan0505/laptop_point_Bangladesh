"use client";

import type { FunnelStage } from "@/lib/analytics/types";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Eye,
  Filter,
  MousePointerClick,
  ShoppingBag,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useState } from "react";

interface AnalyticsFunnelProps {
  funnel: FunnelStage[];
  isSimulated?: boolean;
}

const STAGE_ICONS = {
  impressions: Eye,
  clicks: MousePointerClick,
  active_users: Users,
  cart_adds: ShoppingCart,
  purchases: ShoppingBag,
};

export default function AnalyticsFunnel({
  funnel,
  isSimulated,
}: AnalyticsFunnelProps) {
  const [activeStageId, setActiveStageId] = useState<string | null>(null);

  if (!funnel || funnel.length === 0) return null;

  const topCount = funnel[0]?.count || 1;
  const bottomCount = funnel[funnel.length - 1]?.count || 0;
  const overallConversionRate = (
    (bottomCount / (funnel[1]?.count || topCount)) *
    100
  ).toFixed(2);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm">
      {/* Funnel Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                End-to-End Marketing &amp; E-Commerce Funnel
              </h3>
              <p className="text-xs text-gray-500">
                Trace audience flow from search discovery to verified PostgreSQL orders
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-900">
            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
            <span>Click-to-Order Conversion:</span>
            <span className="font-extrabold text-blue-700 font-mono">
              {overallConversionRate}%
            </span>
          </div>

          {isSimulated && (
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700 border border-amber-200">
              Model Projection
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Infographic Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
        {funnel.map((stage, idx) => {
          const Icon =
            STAGE_ICONS[stage.id as keyof typeof STAGE_ICONS] || Eye;
          const isSelected = activeStageId === stage.id;
          const isLast = idx === funnel.length - 1;

          // Normalized width for visual funnel bar
          const barPercent = Math.max(
            12,
            Math.round((stage.count / topCount) * 100),
          );

          return (
            <div
              key={stage.id}
              onMouseEnter={() => setActiveStageId(stage.id)}
              onMouseLeave={() => setActiveStageId(null)}
              className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-indigo-400 bg-indigo-50/40 shadow-md scale-[1.02]"
                  : "border-gray-200/80 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div>
                {/* Step indicator & Source tag */}
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-bold text-gray-700 shadow-sm border border-gray-200">
                    {idx + 1}
                  </span>
                  <span
                    className="h-2.5 w-2.5 rounded-full ring-4 ring-white shadow-sm"
                    style={{ backgroundColor: stage.color }}
                    title={`Color code: ${stage.color}`}
                  />
                </div>

                {/* Stage Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                    <Icon className="h-3.5 w-3.5 text-gray-600" />
                    <span className="truncate">{stage.label}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">
                    {stage.subtitle}
                  </p>
                </div>

                {/* Count */}
                <div className="mt-3">
                  <p className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 font-mono">
                    {stage.count.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Step Dropoff Bar */}
              <div className="mt-4 pt-3 border-t border-gray-200/60 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500 font-medium">
                    {idx === 0 ? "Initial Reach" : "Step Conversion"}
                  </span>
                  <span className="font-bold text-gray-800 font-mono">
                    {stage.stageRate}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stage.stageRate}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>
              </div>

              {/* Next arrow indicator (desktop) */}
              {!isLast && (
                <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-gray-400">
                  <ChevronRight className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Funnel Insights Legend */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl bg-gray-50/70 p-3 text-xs text-gray-600 border border-gray-100">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>
            <strong>Discovery</strong>: Search Console &amp; Meta impressions
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <span>
            <strong>Engagement</strong>: Google Analytics 4 sessions &amp; pages
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-600" />
          <span>
            <strong>Conversion</strong>: PostgreSQL checkout &amp; completed orders
          </span>
        </div>
      </div>
    </div>
  );
}
