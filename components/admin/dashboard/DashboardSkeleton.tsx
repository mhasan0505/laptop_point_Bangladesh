"use client";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      {/* Greeting Bar Skeleton */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-3 w-32 rounded bg-muted" />
          <div className="h-7 w-64 rounded bg-muted" />
          <div className="h-3.5 w-48 rounded bg-muted" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 rounded-lg bg-muted" />
          <div className="h-9 w-28 rounded-lg bg-muted" />
          <div className="h-9 w-32 rounded-lg bg-muted" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-8 w-8 rounded-lg bg-muted" />
            </div>
            <div className="flex items-baseline justify-between">
              <div className="h-7 w-28 rounded bg-muted" />
              <div className="h-8 w-20 rounded bg-muted" />
            </div>
            <div className="h-3 w-24 rounded bg-muted pt-1 border-t border-border/50" />
          </div>
        ))}
      </div>

      {/* Sales Chart Skeleton */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-4 w-48 rounded bg-muted" />
            <div className="h-3 w-64 rounded bg-muted" />
          </div>
          <div className="h-8 w-28 rounded-lg bg-muted" />
        </div>
        <div className="h-72 w-full rounded-lg bg-muted/40" />
      </div>

      {/* Needs Attention Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-36 rounded bg-muted" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex justify-between">
                <div className="h-3.5 w-32 rounded bg-muted" />
                <div className="h-4 w-6 rounded bg-muted" />
              </div>
              <div className="h-2.5 w-full rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Skeleton */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
        <div className="h-4 w-44 rounded bg-muted" />
        <div className="h-3 w-full rounded-full bg-muted" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted/40 border border-border" />
          ))}
        </div>
      </div>

      {/* Two Columns Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-xl border border-border bg-card p-5" />
        <div className="h-64 rounded-xl border border-border bg-card p-5" />
      </div>

      {/* Recent Orders Skeleton */}
      <div className="h-72 rounded-xl border border-border bg-card p-5" />

      {/* Storefront Now Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-40 rounded-xl border border-border bg-card p-4" />
        <div className="h-40 rounded-xl border border-border bg-card p-4" />
      </div>
    </div>
  );
}
