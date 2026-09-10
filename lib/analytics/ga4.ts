import "server-only";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { unstable_cache as cache } from "next/cache";
import type {
  AnalyticsSummary,
  DailyPoint,
  Series,
  UnifiedMetric,
} from "./types";
import {
  DEFAULT_WINDOW_DAYS,
  buildTrend,
  currentAndPreviousWindows,
  formatCompactBDT,
  resolveGoogleCredentials,
  shortDate,
} from "./utils";

const REVALIDATE_SECONDS = 3600;

function gaCredentials() {
  return resolveGoogleCredentials(process.env.GA_SERVICE_ACCOUNT);
}

function gaPropertyId(): string | null {
  const raw = process.env.GA_PROPERTY_ID ?? process.env.GA4_PROPERTY_ID ?? null;
  if (!raw) return null;
  return raw.replace(/^properties\//, "").trim();
}

async function createClient() {
  const credentials = gaCredentials();
  if (!credentials) return null;
  return new BetaAnalyticsDataClient({ credentials });
}

/**
 * Run a GA4 report and return per-day rows for `metricName`.
 * Never throws — catches errors and returns 0 / empty points.
 */
async function fetchDailyMetric(
  metricName: string,
  client: BetaAnalyticsDataClient,
  propertyId: string,
  start: string,
  end: string,
): Promise<{ total: number; points: DailyPoint[] }> {
  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: start, endDate: end }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: metricName }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    const points: DailyPoint[] = [];
    let total = 0;
    for (const row of response.rows ?? []) {
      const date = row.dimensionValues?.[0]?.value ?? "";
      const value = Number(row.metricValues?.[0]?.value ?? 0);
      if (!date) continue;
      total += value;
      points.push({ date, label: shortDate(date), value });
    }
    return { total, points };
  } catch (error) {
    console.warn(`[ga4:fetchDailyMetric] Failed to fetch ${metricName}:`, error);
    return { total: 0, points: [] };
  }
}

function present(
  key: string,
  label: string,
  current: number,
  previous: number,
  format: "currency" | "count",
): UnifiedMetric {
  const value =
    format === "currency" ? formatCompactBDT(current) : Math.round(current).toLocaleString();
  return {
    key,
    label,
    value,
    raw: current,
    unit: format,
    source: "google-analytics",
    trend: buildTrend(current, previous),
  };
}

async function queryGoogleAnalytics(days = DEFAULT_WINDOW_DAYS): Promise<AnalyticsSummary | null> {
  const propertyId = gaPropertyId();
  const credentials = gaCredentials();
  if (!credentials || !propertyId) return null;

  try {
    const client = await createClient();
    if (!client) return null;

    const { current, previous } = currentAndPreviousWindows(days);

    const [usersCur, purchasesCur, revenueCur] = await Promise.all([
      fetchDailyMetric("activeUsers", client, propertyId, current.start, current.end),
      fetchDailyMetric("ecommercePurchases", client, propertyId, current.start, current.end),
      fetchDailyMetric("totalRevenue", client, propertyId, current.start, current.end),
    ]);

    const [usersPrev, purchasesPrev, revenuePrev] = await Promise.all([
      fetchDailyMetric("activeUsers", client, propertyId, previous.start, previous.end),
      fetchDailyMetric("ecommercePurchases", client, propertyId, previous.start, previous.end),
      fetchDailyMetric("totalRevenue", client, propertyId, previous.start, previous.end),
    ]);

    const revenueSeries: Series = {
      key: "ga_revenue",
      label: "GA4 Revenue",
      unit: "currency",
      points: revenueCur.points,
    };

    return {
      fetchedAt: new Date().toISOString(),
      period: { start: current.start, end: current.end },
      metrics: [
        present("activeUsers", "Active Users (GA4)", usersCur.total, usersPrev.total, "count"),
        present("ecommercePurchases", "Purchases (GA4)", purchasesCur.total, purchasesPrev.total, "count"),
        present("gaRevenue", "Revenue (GA4)", revenueCur.total, revenuePrev.total, "currency"),
      ],
      series: [revenueSeries],
    };
  } catch (error) {
    console.error("[ga4:queryGoogleAnalytics] Failed:", error);
    return null;
  }
}

/** Cached entry point. */
export const fetchGoogleAnalytics = cache(
  async (days = DEFAULT_WINDOW_DAYS) => queryGoogleAnalytics(days),
  ["analytics", "ga4"],
  { revalidate: REVALIDATE_SECONDS },
);