"use client";

import { AlertCircle, CheckCircle2, Settings, Sparkles } from "lucide-react";

interface IntegrationStatusBannerProps {
  name: string;
  sourceKey: "store" | "google-analytics" | "search-console" | "meta-ads";
  status: "connected" | "not_configured" | "error";
  details?: string;
  onOpenSetup?: () => void;
  onToggleDemo?: () => void;
  isDemoActive?: boolean;
}

export function IntegrationStatusBanner({
  name,
  status,
  details,
  onOpenSetup,
  onToggleDemo,
  isDemoActive = false,
}: IntegrationStatusBannerProps) {
  if (status === "connected" && !isDemoActive) {
    return (
      <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 mb-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>{name} API:</strong> Connected & live syncing. {details}
          </span>
        </div>
        {onOpenSetup && (
          <button
            type="button"
            onClick={onOpenSetup}
            className="text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-2 flex items-center gap-1"
          >
            <Settings className="w-3 h-3" />
            Config
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 mb-6">
      <div className="flex items-start sm:items-center gap-2.5">
        <div className="p-1.5 rounded-md bg-amber-100 text-amber-800 shrink-0 mt-0.5 sm:mt-0">
          <AlertCircle className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="font-semibold text-zinc-900">
            {name} Integration is {status === "not_configured" ? "Not Configured" : "Operating in Preview Mode"}
          </p>
          <p className="text-zinc-500 mt-0.5">
            {details || "Showing realistic simulated laptop store telemetry until your live credentials are linked."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onToggleDemo && (
          <button
            type="button"
            onClick={onToggleDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 font-semibold shadow-2xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            {isDemoActive ? "Using Demo Data" : "Switch to Demo"}
          </button>
        )}

        {onOpenSetup && (
          <button
            type="button"
            onClick={onOpenSetup}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-xs transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Connect Account
          </button>
        )}
      </div>
    </div>
  );
}
