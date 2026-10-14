"use client";

import Link from "next/link";
import { Clock, RefreshCw, Truck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderPipelineProps {
  pipeline: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    total: number;
  };
}

export function OrderPipeline({ pipeline }: OrderPipelineProps) {
  const total = pipeline.total;

  const stages = [
    {
      id: "pending",
      label: "Pending",
      count: pipeline.pending,
      href: "/admin/orders?status=pending",
      icon: Clock,
      colorBg: "bg-amber-500",
      colorText: "text-amber-600 dark:text-amber-400",
      colorSoft: "bg-amber-500/10 border-amber-500/20",
    },
    {
      id: "processing",
      label: "Processing",
      count: pipeline.processing,
      href: "/admin/orders?status=processing",
      icon: RefreshCw,
      colorBg: "bg-blue-500",
      colorText: "text-blue-600 dark:text-blue-400",
      colorSoft: "bg-blue-500/10 border-blue-500/20",
    },
    {
      id: "shipped",
      label: "Shipped",
      count: pipeline.shipped,
      href: "/admin/orders?status=shipped",
      icon: Truck,
      colorBg: "bg-purple-500",
      colorText: "text-purple-600 dark:text-purple-400",
      colorSoft: "bg-purple-500/10 border-purple-500/20",
    },
    {
      id: "delivered",
      label: "Delivered",
      count: pipeline.delivered,
      href: "/admin/orders?status=delivered",
      icon: CheckCircle2,
      colorBg: "bg-emerald-500",
      colorText: "text-emerald-600 dark:text-emerald-400",
      colorSoft: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Order Fulfillment Pipeline
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click any stage to inspect matching customer orders in the fulfillment workflow
          </p>
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          <span className="font-bold text-foreground">{total}</span> total active orders
        </div>
      </div>

      {/* Segmented bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/60 p-0.5 border border-border/40">
        {total === 0 ? (
          <div className="h-full w-full rounded-full bg-muted" />
        ) : (
          stages.map((stage) => {
            const pct = Math.max((stage.count / total) * 100, stage.count > 0 ? 3 : 0);
            if (stage.count === 0) return null;

            return (
              <Link
                key={stage.id}
                href={stage.href}
                title={`${stage.label}: ${stage.count} orders`}
                style={{ width: `${pct}%` }}
                className={cn(
                  "h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full hover:opacity-85",
                  stage.colorBg
                )}
              />
            );
          })
        )}
      </div>

      {/* Stage cards / pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const pctOfTotal = total > 0 ? Math.round((stage.count / total) * 100) : 0;

          return (
            <Link
              key={stage.id}
              href={stage.href}
              className={cn(
                "group flex flex-col justify-between rounded-lg border p-3 transition-all duration-150 hover:shadow-xs",
                stage.colorSoft,
                "hover:border-current"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Icon className={cn("h-3.5 w-3.5", stage.colorText)} />
                  {stage.label}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {pctOfTotal}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className={cn("text-xl font-bold font-mono tracking-tight", stage.colorText)}>
                  {stage.count}
                </span>
                <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                  View →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
