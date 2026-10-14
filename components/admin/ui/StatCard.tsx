import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    label?: string;
    direction?: "up" | "down" | "neutral";
  };
  status?: "default" | "success" | "warning" | "danger" | "info";
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  status = "default",
  loading = false,
  onClick,
  className,
}: StatCardProps) {
  const statusAccent = {
    default: "border-border/80",
    success: "border-success/40 bg-success-soft/30",
    warning: "border-warning/40 bg-warning-soft/30",
    danger: "border-danger/40 bg-danger-soft/30",
    info: "border-info/40 bg-info-soft/30",
  }[status];

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border bg-card p-5 shadow-sm transition-all duration-200",
        statusAccent,
        onClick && "cursor-pointer hover:border-primary/50 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">
          {title}
        </p>
        {icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                trend.direction === "up" && "text-success",
                trend.direction === "down" && "text-danger",
                trend.direction === "neutral" && "text-muted-foreground"
              )}
            >
              {trend.direction === "up" && <TrendingUp className="h-3 w-3" />}
              {trend.direction === "down" && <TrendingDown className="h-3 w-3" />}
              {trend.direction === "neutral" && <Minus className="h-3 w-3" />}
              {trend.value}
            </span>
          )}
          {subtitle && (
            <span className="text-muted-foreground truncate">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
