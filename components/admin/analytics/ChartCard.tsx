"use client";

import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface ChartCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  error?: string | null;
  className?: string;
}

export function ChartCard({
  title,
  description,
  actions,
  children,
  isLoading = false,
  isEmpty = false,
  emptyMessage = "No analytical data available for the selected range.",
  error = null,
  className = "",
}: ChartCardProps) {
  return (
    <div
      className={`p-6 rounded-xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-zinc-900">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {isLoading ? (
        <div className="h-64 w-full flex flex-col items-center justify-center gap-3 bg-zinc-50/50 rounded-lg animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
          <span className="text-xs text-zinc-400 font-medium">Loading visualization...</span>
        </div>
      ) : error ? (
        <div className="h-64 w-full flex flex-col items-center justify-center gap-2 text-center p-6 bg-rose-50/50 rounded-lg border border-rose-100 text-rose-700">
          <AlertCircle className="w-6 h-6 text-rose-500" />
          <p className="text-sm font-semibold">Failed to render chart</p>
          <p className="text-xs text-rose-600 max-w-sm">{error}</p>
        </div>
      ) : isEmpty ? (
        <div className="h-64 w-full flex flex-col items-center justify-center gap-2 text-center p-6 bg-zinc-50 rounded-lg border border-dashed border-zinc-200 text-zinc-400">
          <p className="text-xs">{emptyMessage}</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
