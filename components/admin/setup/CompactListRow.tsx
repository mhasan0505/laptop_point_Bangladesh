"use client";

import React from "react";
import { GripVertical, ArrowUp, ArrowDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CompactListRowProps {
  id?: string;
  title: string;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  index: number;
  total: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onEdit: () => void;
  disabled?: boolean;
  className?: string;
}

export function CompactListRow({
  title,
  subtitle,
  badge,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onEdit,
  disabled = false,
  className,
}: CompactListRowProps) {
  return (
    <div
      onClick={() => {
        if (!disabled) onEdit();
      }}
      className={cn(
        "group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-border bg-card",
        "transition-colors select-none",
        !disabled ? "hover:bg-muted/50 hover:border-border/80 cursor-pointer" : "opacity-80 cursor-default",
        className
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Reordering Controls */}
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground cursor-grab shrink-0" />
          <div className="flex flex-col">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || index === 0}
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp?.();
              }}
              className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
              aria-label="Move item up"
            >
              <ArrowUp className="w-2.5 h-2.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || index === total - 1}
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown?.();
              }}
              className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
              aria-label="Move item down"
            >
              <ArrowDown className="w-2.5 h-2.5" />
            </Button>
          </div>
        </div>

        {/* Text Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground truncate">
              {title}
            </span>
            {badge}
          </div>
          {subtitle && (
            <div className="text-[11px] text-muted-foreground truncate mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Right Action Hint */}
      <div className="flex items-center gap-2 shrink-0">
        <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
      </div>
    </div>
  );
}
