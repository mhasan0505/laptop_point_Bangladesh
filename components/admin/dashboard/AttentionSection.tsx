"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, AlertTriangle, Clock, Layers, MessageSquare, CalendarClock, Settings } from "lucide-react";
import type { AttentionItem } from "@/lib/admin-dashboard";
import { cn } from "@/lib/utils";

interface AttentionSectionProps {
  items: AttentionItem[];
}

export function AttentionSection({ items }: AttentionSectionProps) {
  const activeItems = items.filter((item) => item.count > 0);

  const getItemIcon = (id: string) => {
    switch (id) {
      case "pending_orders_24h":
        return Clock;
      case "out_of_stock":
      case "low_stock":
        return Layers;
      case "unanswered_questions":
        return MessageSquare;
      case "banners_ending_soon":
        return CalendarClock;
      case "setup_incomplete":
        return Settings;
      default:
        return AlertTriangle;
    }
  };

  const getItemBadgeVariant = (id: string) => {
    switch (id) {
      case "pending_orders_24h":
      case "out_of_stock":
        return "bg-danger-soft text-danger border-danger/30";
      case "low_stock":
      case "unanswered_questions":
      case "banners_ending_soon":
      case "setup_incomplete":
      default:
        return "bg-warning-soft text-warning border-warning/30";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Needs Your Attention
        </h2>
        {activeItems.length > 0 && (
          <span className="text-xs font-semibold text-muted-foreground">
            {activeItems.length} {activeItems.length === 1 ? "action required" : "actions required"}
          </span>
        )}
      </div>

      {activeItems.length === 0 ? (
        <div className="flex items-center gap-4 rounded-xl border border-success/30 bg-success-soft/30 p-5 text-card-foreground shadow-xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              All clear — Store operations are healthy
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              No pending orders older than 24 hours, zero out-of-stock items, and all customer inquiries are answered.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {activeItems.map((item) => {
            const Icon = getItemIcon(item.id);
            const badgeClass = getItemBadgeVariant(item.id);

            return (
              <Link
                key={item.id}
                href={item.href}
                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-xs font-bold font-mono",
                        badgeClass
                      )}
                    >
                      {item.count}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2.5 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-end gap-1 text-[11px] font-semibold text-primary opacity-90 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                  <span>Take action</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
