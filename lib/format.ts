// Shared formatting helpers — single source of truth for BDT display.
// Was previously inlined as `৳${x.toLocaleString()}` in 25+ files.

export function formatBDT(amount: number | string | undefined | null): string {
  const n = Number(amount ?? 0);
  if (!Number.isFinite(n)) return "৳0";
  return `৳${Math.round(n).toLocaleString("en-BD")}`;
}

export function formatDate(date: Date | string | undefined | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | undefined | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
