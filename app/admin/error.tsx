"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Boundary Error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-card border border-border rounded-2xl p-8 shadow-sm text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold text-foreground mb-2">
          Admin Panel Error
        </h2>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          The requested admin action or dashboard view encountered an unexpected error.
        </p>

        {error.digest && (
          <div className="mb-6 p-3 bg-muted/50 rounded-xl border border-border font-mono text-xs text-muted-foreground">
            Error Digest: <span className="font-semibold text-foreground">{error.digest}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Retry View
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted/60 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
