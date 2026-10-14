"use client";

import { TrendingUp, TrendingDown, Minus, CircleDollarSign, ShoppingBag, Receipt, PackageCheck } from "lucide-react";
import type { MetricSummary, SparklinePoint } from "@/lib/admin-dashboard";
import { CountUp } from "./CountUp";
import { Sparkline } from "./Sparkline";
import { cn } from "@/lib/utils";

interface KpiCardsProps {
  today: MetricSummary;
  yesterday: MetricSummary;
  sparklines: {
    revenue: SparklinePoint[];
    orders: SparklinePoint[];
    averageOrderValue: SparklinePoint[];
    unitsSold: SparklinePoint[];
  };
}

interface KpiItemConfig {
  title: string;
  icon: typeof CircleDollarSign;
  current: number;
  previous: number;
  prefix?: string;
  suffix?: string;
  sparkline: SparklinePoint[];
  color: string;
}

export function KpiCards({ today, yesterday, sparklines }: KpiCardsProps) {
  const cards: KpiItemConfig[] = [
    {
      title: "Revenue today",
      icon: CircleDollarSign,
      current: today.revenue,
      previous: yesterday.revenue,
      prefix: "৳",
      sparkline: sparklines.revenue,
      color: "var(--color-brand-secondary, #0B79BE)",
    },
    {
      title: "Orders today",
      icon: ShoppingBag,
      current: today.orders,
      previous: yesterday.orders,
      sparkline: sparklines.orders,
      color: "var(--color-brand-primary, #57BA47)",
    },
    {
      title: "Average order value",
      icon: Receipt,
      current: today.averageOrderValue,
      previous: yesterday.averageOrderValue,
      prefix: "৳",
      sparkline: sparklines.averageOrderValue,
      color: "var(--color-primary, #3b82f6)",
    },
    {
      title: "Units sold",
      icon: PackageCheck,
      current: today.unitsSold,
      previous: yesterday.unitsSold,
      sparkline: sparklines.unitsSold,
      color: "#8b5cf6",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        
        // Calculate % change vs yesterday
        let pctChange = 0;
        let direction: "up" | "down" | "neutral" = "neutral";

        if (card.previous === 0) {
          if (card.current > 0) {
            pctChange = 100;
            direction = "up";
          } else {
            pctChange = 0;
            direction = "neutral";
          }
        } else {
          pctChange = Math.round(((card.current - card.previous) / card.previous) * 100);
          if (pctChange > 0) direction = "up";
          else if (pctChange < 0) direction = "down";
          else direction = "neutral";
        }

        const pctFormatted = pctChange > 0 ? `+${pctChange}%` : `${pctChange}%`;

        return (
          <div
            key={card.title}
            className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:border-border/80"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
                {card.title}
              </span>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between gap-2">
              <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                <CountUp
                  value={card.current}
                  prefix={card.prefix}
                  suffix={card.suffix}
                />
              </div>
              <div className="hidden sm:block shrink-0">
                <Sparkline
                  data={card.sparkline}
                  color={card.color}
                  width={90}
                  height={32}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50 text-xs">
              <div
                className={cn(
                  "inline-flex items-center gap-1 font-semibold",
                  direction === "up" && "text-success",
                  direction === "down" && "text-danger",
                  direction === "neutral" && "text-muted-foreground"
                )}
              >
                {direction === "up" && <TrendingUp className="h-3.5 w-3.5" />}
                {direction === "down" && <TrendingDown className="h-3.5 w-3.5" />}
                {direction === "neutral" && <Minus className="h-3.5 w-3.5" />}
                <span>{pctFormatted}</span>
                <span className="text-[11px] font-normal text-muted-foreground">vs yesterday</span>
              </div>

              {/* Mobile sparkline fallback */}
              <div className="block sm:hidden shrink-0">
                <Sparkline
                  data={card.sparkline}
                  color={card.color}
                  width={75}
                  height={26}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
