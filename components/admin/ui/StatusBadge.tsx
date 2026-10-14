import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "active"
  | "inactive"
  | "pending"
  | "draft"
  | "archived";

export interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  size?: "sm" | "default" | "lg";
  dot?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function StatusBadge({
  status,
  label,
  size = "default",
  dot = true,
  className,
  children,
}: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let variant: "success" | "warning" | "danger" | "info" | "neutral" = "neutral";
  const displayLabel = children ?? (label || status);

  if (["active", "success", "completed", "running", "published", "in stock"].includes(normalized)) {
    variant = "success";
  } else if (["warning", "pending", "low stock", "processing"].includes(normalized)) {
    variant = "warning";
  } else if (["danger", "failed", "error", "inactive", "out of stock", "disabled", "cancelled"].includes(normalized)) {
    variant = "danger";
  } else if (["info", "draft", "shipped"].includes(normalized)) {
    variant = "info";
  }

  const styles = {
    success: "bg-success-soft text-success border-success/30",
    warning: "bg-warning-soft text-warning border-warning/30",
    danger: "bg-danger-soft text-danger border-danger/30",
    info: "bg-info-soft text-info border-info/30",
    neutral: "bg-muted text-muted-foreground border-border",
  }[variant];

  const dotStyles = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
    neutral: "bg-muted-foreground",
  }[variant];

  const sizeStyles = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1",
    default: "text-xs px-2.5 py-0.5 gap-1.5",
    lg: "text-sm px-3 py-1 gap-2",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border transition-colors select-none capitalize",
        styles,
        sizeStyles,
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            dotStyles
          )}
        />
      )}
      <span>{displayLabel}</span>
    </span>
  );
}
