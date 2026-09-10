import "server-only";
import { google } from "googleapis";
import { unstable_cache as cache } from "next/cache";
import type { AnalyticsSummary, DailyPoint, Series, UnifiedMetric } from "./types";
import {
  DEFAULT_WINDOW_DAYS,
  buildTrend,
  gscWindows,
  resolveGoogleCredentials,
  shortDate,
} from "./utils";

const REVALIDATE_SECONDS = 3600;

function serviceAccount() {
  return resolveGoogleCredentials(process.env.GSC_SERVICE_ACCOUNT);
}

function siteUrl(): string | null {
  return process.env.GSC_SITE_URL ?? null;
}

async function createClient() {
  const creds = serviceAccount();
  if (!creds || !creds.client_email || !creds.private_key) return null;

  try {
    const auth = new google.auth.JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    });
    return google.webmasters({ version: "v3", auth });
  } catch (err) {
    console.error("[gsc:createClient] Failed to initialize JWT auth:", err);
    return null;
  }
}

/** Daily (clicks, impressions, position) rows for a date range. */
async function fetchDailyRows(
  webmasters: ReturnType<typeof google["webmasters"]>,
  site: string,
  start: string,
  end: string,
  days: number,
): Promise<DailyPoint[]> {
  try {
    const res = await webmasters.searchanalytics.query({
      siteUrl: site,
      requestBody: {
        startDate: start,
        endDate: end,
        dimensions: ["date"],
        rowLimit: days + 5,
      },
    });

    const rows = res.data.rows ?? [];
    const byDate = new Map<string, DailyPoint>();
    for (const row of rows) {
      const date = row.keys?.[0] ?? "";
      const clicks = Number(row.clicks ?? 0);
      if (!date) continue;
      byDate.set(date, {
        date,
        label: shortDate(date),
        value: clicks,
      });
    }

    // Fill any gaps so the chart always has exactly contiguous points.
    const points: DailyPoint[] = [];
    const cursor = new Date(`${start}T00:00:00Z`);
    const endDate = new Date(`${end}T00:00:00Z`);
    while (cursor <= endDate) {
      const iso = cursor.toISOString().slice(0, 10);
      points.push(
        byDate.get(iso) ?? {
          date: iso,
          label: shortDate(iso),
          value: 0,
        },
      );
      cursor.setDate(cursor.getDate() + 1);
    }
    return points;
  } catch (error) {
    console.warn("[gsc:fetchDailyRows] Query failed:", error);
    return [];
  }
}

async function querySearchConsole(days = DEFAULT_WINDOW_DAYS): Promise<AnalyticsSummary | null> {
  const site = siteUrl();
  const creds = serviceAccount();
  if (!site || !creds) return null;

  try {
    const webmasters = await createClient();
    if (!webmasters) return null;

    const { current, previous } = gscWindows(days);

    const [cur, prev] = await Promise.all([
      fetchDailyRows(webmasters, site, current.start, current.end, days),
      fetchDailyRows(webmasters, site, previous.start, previous.end, days),
    ]);

    const sum = (rows: DailyPoint[]) => rows.reduce((s, r) => s + r.value, 0);
    const clicksCur = sum(cur);
    const clicksPrev = sum(prev);

    const series: Series = {
      key: "organic_clicks",
      label: "Organic Clicks",
      unit: "count",
      points: cur,
    };

    const metrics: UnifiedMetric[] = [
      {
        key: "organicClicks",
        label: "Organic Traffic (GSC)",
        value: Math.round(clicksCur).toLocaleString(),
        raw: clicksCur,
        unit: "count",
        source: "search-console",
        trend: buildTrend(clicksCur, clicksPrev),
      },
    ];

    return {
      fetchedAt: new Date().toISOString(),
      period: { start: current.start, end: current.end },
      metrics,
      series: [series],
    };
  } catch (error) {
    console.error("[gsc:querySearchConsole] Error:", error);
    return null;
  }
}

/** Cached entry point — revalidated every hour. */
export const fetchSearchConsole = cache(
  async (days = DEFAULT_WINDOW_DAYS) => querySearchConsole(days),
  ["analytics", "gsc"],
  { revalidate: REVALIDATE_SECONDS },
);