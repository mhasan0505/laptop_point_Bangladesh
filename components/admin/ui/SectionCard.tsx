"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SectionCardProps {
  title?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function SectionCard({
  title,
  description,
  actions,
  footer,
  children,
  className,
  headerClassName,
  contentClassName,
  collapsible = false,
  defaultExpanded = true,
}: SectionCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-200 overflow-hidden",
        className
      )}
    >
      {(title || description || actions) && (
        <div
          className={cn(
            "flex items-center justify-between gap-4 p-5 sm:p-6 border-b border-border/60 bg-muted/20",
            collapsible && "cursor-pointer select-none",
            headerClassName
          )}
          onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
        >
          <div className="space-y-1 min-w-0">
            {typeof title === "string" ? (
              <h2 className="text-base font-semibold leading-none tracking-tight text-foreground">
                {title}
              </h2>
            ) : (
              title
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {actions && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2"
              >
                {actions}
              </div>
            )}
            {collapsible && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            )}
          </div>
        </div>
      )}

      {(!collapsible || isExpanded) && (
        <>
          <div className={cn("p-5 sm:p-6", contentClassName)}>
            {children}
          </div>
          {footer && (
            <div className="flex items-center justify-end gap-3 px-5 py-3.5 sm:px-6 bg-muted/30 border-t border-border/60 text-xs">
              {footer}
            </div>
          )}
        </>
      )}
    </div>
  );
}
