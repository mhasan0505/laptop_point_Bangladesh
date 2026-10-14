"use client";

import { useId } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import type { DailySalesPoint } from "@/lib/admin-dashboard";
import { cn } from "@/lib/utils";

interface SalesChartProps {
  data: DailySalesPoint[];
  selectedRange: number;
  onRangeChange: (range: number) => void;
  isLoading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const revenueItem = payload.find((p) => p.dataKey === "revenue");
  const ordersItem = payload.find((p) => p.dataKey === "orders");

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-md text-xs space-y-1.5 min-w-36">
      <div className="font-semibold text-foreground border-b border-border/60 pb-1">
        {label}
      </div>
      {revenueItem !== undefined && (
        <div className="flex items-center justify-between gap-3 text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Revenue
          </span>
          <span className="font-bold text-foreground font-mono">
            ৳{revenueItem.value.toLocaleString()}
          </span>
        </div>
      )}
      {ordersItem !== undefined && (
        <div className="flex items-center justify-between gap-3 text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            Orders
          </span>
          <span className="font-bold text-foreground font-mono">
            {ordersItem.value} {ordersItem.value === 1 ? "order" : "orders"}
          </span>
        </div>
      )}
    </div>
  );
}

export function SalesChart({
  data,
  selectedRange,
  onRangeChange,
  isLoading = false,
}: SalesChartProps) {
  const gradientId = useId();
  const ranges = [7, 30, 90];

  const formatRevenueAxis = (val: number) => {
    if (val >= 100000) return `৳${(val / 1000).toFixed(0)}k`;
    if (val >= 1000) return `৳${(val / 1000).toFixed(1)}k`;
    return `৳${val}`;
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4 mb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Sales & Order Trends
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daily gross revenue (area, left axis) vs order volume (line, right axis)
          </p>
        </div>

        <div className="flex items-center gap-1 self-start sm:self-auto rounded-lg border border-border bg-muted/40 p-1">
          {ranges.map((r) => {
            const isSelected = selectedRange === r;
            return (
              <Button
                key={r}
                type="button"
                variant={isSelected ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onRangeChange(r)}
                disabled={isLoading}
                className={cn(
                  "h-7 px-3 text-xs font-semibold rounded-md",
                  isSelected
                    ? "bg-card text-foreground shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r}D
              </Button>
            );
          })}
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            No sales data recorded in this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-border)"
                opacity={0.4}
              />
              <XAxis
                dataKey="label"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                yAxisId="revenue"
                orientation="left"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatRevenueAxis}
              />
              <YAxis
                yAxisId="orders"
                orientation="right"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                fill={`url(#${gradientId})`}
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: "var(--color-primary)", strokeWidth: 2, fill: "var(--color-card)" }}
              />
              <Line
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="var(--color-success)"
                strokeWidth={2}
                dot={{ r: 2.5, fill: "var(--color-success)", strokeWidth: 0 }}
                activeDot={{ r: 4, stroke: "var(--color-success)", strokeWidth: 2, fill: "var(--color-card)" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-6 border-t border-border/40 pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span>Revenue (Left Axis)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-success" />
          <span>Orders (Right Axis)</span>
        </div>
      </div>
    </div>
  );
}
