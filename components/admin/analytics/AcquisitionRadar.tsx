"use client";

import type { ChannelBreakdown } from "@/lib/analytics/types";
import { formatBDT } from "@/lib/format";
import {
  Compass,
  Globe,
  Layers,
  Share2,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

interface AcquisitionRadarProps {
  channels: ChannelBreakdown[];
}

const CHANNEL_ICONS = {
  organic_search: Globe,
  direct: ShoppingBag,
  paid_social: Layers,
  referral: Share2,
};

export default function AcquisitionRadar({ channels }: AcquisitionRadarProps) {
  if (!channels || channels.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Traffic &amp; Channel Attribution
            </h3>
            <p className="text-xs text-gray-500">
              Share of visitors, conversions, and revenue
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Multi-Touch
        </span>
      </div>

      {/* Visual Channel Stack */}
      <div className="space-y-4 flex-1">
        {channels.map((ch) => {
          const Icon =
            CHANNEL_ICONS[ch.id as keyof typeof CHANNEL_ICONS] || TrendingUp;

          return (
            <div
              key={ch.id}
              className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 hover:border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg shadow-xs text-white"
                    style={{ backgroundColor: ch.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {ch.label}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {ch.visitors.toLocaleString()} visitors • {ch.orders} orders
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-extrabold text-gray-900">
                    {formatBDT(ch.revenue)}
                  </p>
                  <p className="text-[11px] font-semibold text-gray-500">
                    {ch.percentage}% share
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-gray-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${ch.percentage}%`,
                    backgroundColor: ch.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Attribution model: First &amp; Last Interaction</span>
        <span className="font-semibold text-gray-700">100% Tracked</span>
      </div>
    </div>
  );
}
