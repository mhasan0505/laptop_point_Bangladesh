"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SaveBarProps {
  isDirty?: boolean;
  open?: boolean;
  isSaving?: boolean;
  onSave: () => void | Promise<void>;
  onReset?: () => void;
  onDiscard?: () => void;
  saveText?: string;
  resetText?: string;
  message?: string;
  className?: string;
}

export function SaveBar({
  isDirty,
  open,
  isSaving = false,
  onSave,
  onReset,
  onDiscard,
  saveText = "Save changes",
  resetText = "Discard",
  message = "You have unsaved changes",
  className,
}: SaveBarProps) {
  const active = open ?? isDirty ?? false;
  const handleReset = onReset ?? onDiscard;
  if (!active) return null;

  return (
    <aside
      aria-label="Save changes banner"
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl",
        "animate-in fade-in slide-in-from-bottom-4 duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card/95 p-3.5 sm:px-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="h-2 w-2 rounded-full bg-warning animate-pulse shrink-0" />
          <p className="text-xs sm:text-sm font-medium text-foreground truncate">
            {message}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {handleReset && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isSaving}
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <Undo2 className="mr-1.5 h-3.5 w-3.5" />
              {resetText}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            disabled={isSaving}
            onClick={onSave}
            className="text-xs font-semibold"
          >
            {isSaving ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-3.5 w-3.5" />
            )}
            {saveText}
          </Button>
        </div>
      </div>
    </aside>
  );
}
