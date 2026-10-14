"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode | number | string;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab?: string;
  value?: string;
  onChange: (id: string) => void;
  variant?: "line" | "pill";
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  value,
  onChange,
  variant = "line",
  className,
}: TabsProps) {
  const currentTab = activeTab ?? value ?? tabs[0]?.id;
  if (variant === "pill") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 rounded-xl bg-muted p-1 text-muted-foreground",
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === currentTab;
          const displayBadge = tab.badge !== undefined ? tab.badge : tab.count;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer",
                isActive
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "hover:text-foreground hover:bg-card/50"
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {displayBadge !== undefined && (
                <span
                  className={cn(
                    "ml-1 rounded-full px-1.5 py-0.2 text-[10px]",
                    isActive
                      ? "bg-muted text-foreground"
                      : "bg-background/80 text-muted-foreground"
                  )}
                >
                  {displayBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("border-b border-border", className)}>
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === currentTab;
          const displayBadge = tab.badge !== undefined ? tab.badge : tab.count;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "group inline-flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-all duration-150 cursor-pointer select-none",
                isActive
                  ? "border-primary text-foreground font-semibold"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {tab.icon && (
                <span
                  className={cn(
                    "shrink-0 transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {displayBadge !== undefined && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {displayBadge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
