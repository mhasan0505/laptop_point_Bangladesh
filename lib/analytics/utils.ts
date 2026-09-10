import fs from "fs";
import path from "path";
import type { Trend } from "./types";

/** Default number of days each range covers (current and previous comparison). */
export const DEFAULT_WINDOW_DAYS = 30;

const DAY_MS = 86_400_000;

export function normalizeDays(daysInput?: number | string | null): number {
  const n = Number(daysInput);
  if (n === 7 || n === 30 || n === 90) return n;
  return DEFAULT_WINDOW_DAYS;
}

/** `[start, end]` ISO dates inclusive of `end` for the last N days. */
export function lastNDays(n: number, offsetDays = 0): { start: string; end: string } {
  const end = new Date(Date.now() - offsetDays * DAY_MS);
  end.setHours(23, 59, 59, 999);
  const start = new Date(end.getTime() - (n - 1) * DAY_MS);
  start.setHours(0, 0, 0, 0);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

/**
 * Returns current and comparison window for general analytics.
 */
export function currentAndPreviousWindows(n: number) {
  const current = lastNDays(n, 0);
  const previousStart = new Date(
    new Date(`${current.start}T00:00:00Z`).getTime() - n * DAY_MS,
  )
    .toISOString()
    .slice(0, 10);
  return { current, previous: { start: previousStart, end: current.start } };
}

/**
 * Google Search Console has a 2-3 day data lag.
 * Offsetting by 2 days ensures we query available historical data without
 * showing false zero drops on recent dates.
 */
export function gscWindows(n: number) {
  const GSC_LAG_DAYS = 2;
  const current = lastNDays(n, GSC_LAG_DAYS);
  const previousStart = new Date(
    new Date(`${current.start}T00:00:00Z`).getTime() - n * DAY_MS,
  )
    .toISOString()
    .slice(0, 10);
  return { current, previous: { start: previousStart, end: current.start } };
}

/** Build a human-friendly trend string + direction from two absolute values. */
export function buildTrend(current: number, previous: number): Trend {
  if (previous === 0) {
    return current === 0
      ? { value: "0%", direction: "flat" }
      : { value: "New", direction: "up" };
  }
  const pct = ((current - previous) / previous) * 100;
  const rounded = Math.round(pct * 10) / 10;
  const direction: Trend["direction"] =
    rounded > 0.5 ? "up" : rounded < -0.5 ? "down" : "flat";
  return {
    value: `${rounded > 0 ? "+" : ""}${rounded}%`,
    direction,
  };
}

/** Short label like "Mar 5" from an ISO date string. */
export function shortDate(iso: string): string {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
}

/** Compact currency for BDT figures, e.g. ৳82.5K. */
export function formatCompactBDT(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `৳${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `৳${(value / 1_000).toFixed(1)}K`;
  return `৳${Math.round(value).toLocaleString()}`;
}

export interface GoogleServiceAccount {
  client_email?: string;
  private_key?: string;
  project_id?: string;
  [key: string]: unknown;
}

/**
 * Universal credential resolver for Google Services (GA4 & GSC).
 * Supports:
 * 1. Inline JSON via GOOGLE_APPLICATION_CREDENTIALS_JSON, GA_SERVICE_ACCOUNT, GSC_SERVICE_ACCOUNT
 * 2. File path via GOOGLE_APPLICATION_CREDENTIALS
 * 3. Normalizes private key newlines
 */
export function resolveGoogleCredentials(
  dedicatedInlineEnv?: string,
): GoogleServiceAccount | null {
  // 1. Dedicated or inline JSON strings
  const inline =
    dedicatedInlineEnv ??
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ??
    process.env.GA_SERVICE_ACCOUNT ??
    process.env.GSC_SERVICE_ACCOUNT;

  if (inline && inline.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(inline) as GoogleServiceAccount;
      return sanitizeServiceAccount(parsed);
    } catch {
      // invalid json, continue to file check
    }
  }

  // 2. File path
  const filePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (filePath && typeof filePath === "string") {
    try {
      const resolvedPath = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(process.cwd(), filePath);

      if (fs.existsSync(resolvedPath)) {
        const fileContent = fs.readFileSync(resolvedPath, "utf8");
        const parsed = JSON.parse(fileContent) as GoogleServiceAccount;
        return sanitizeServiceAccount(parsed);
      }
    } catch (err) {
      console.warn("[analytics:credentials] Failed to read credential file:", err);
    }
  }

  return null;
}

function sanitizeServiceAccount(account: GoogleServiceAccount): GoogleServiceAccount {
  if (typeof account.private_key === "string") {
    // Replace escaped \n with actual newline characters
    account.private_key = account.private_key.replace(/\\n/g, "\n");
  }
  return account;
}