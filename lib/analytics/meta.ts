import "server-only";
import type { AnalyticsSummary, Series, UnifiedMetric } from "./types";
import {
  DEFAULT_WINDOW_DAYS,
  buildTrend,
  currentAndPreviousWindows,
  formatCompactBDT,
} from "./utils";

const GRAPH_BASE = "https://graph.facebook.com/v19.0";
const REVALIDATE_SECONDS = 3600;

function accessToken(): string | null {
  return process.env.META_ADS_ACCESS_TOKEN ?? null;
}

function adAccountId(): string | null {
  const raw = process.env.META_ADS_ACCOUNT_ID ?? null;
  if (!raw) return null;
  const trimmed = raw.trim();
  return trimmed.startsWith("act_") ? trimmed : `act_${trimmed}`;
}

interface MetaRow {
  spend?: string;
  actions?: Array<{ action_type: string; value: string }>;
  action_values?: Array<{ action_type: string; value: string }>;
  ctr?: string;
  date_start: string;
  date_end: string;
}

async function fetchDailyInsights(
  token: string,
  accountId: string,
  start: string,
  end: string,
): Promise<MetaRow[]> {
  try {
    const params = new URLSearchParams({
      access_token: token,
      fields: "spend,actions,action_values,date_start",
      time_range: `{"since":"${start}","until":"${end}"}`,
      time_increment: "1", // daily rows
      level: "campaign",
      limit: "1000",
    });

    const url = `${GRAPH_BASE}/${accountId}/insights?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) {
      const text = await res.text();
      console.warn(`[meta:fetchDailyInsights] Error (${res.status}): ${text}`);
      return [];
    }
    const body = (await res.json()) as { data?: MetaRow[] };
    return body.data ?? [];
  } catch (error) {
    console.error("[meta:fetchDailyInsights] Request failed:", error);
    return [];
  }
}

const PURCHASE_ACTION_TYPES = new Set([
  "purchase",
  "omni_purchase",
  "offsite_conversion.fb_pixel_purchase",
]);

/** Extract all purchase-conversion value/actions from a row. */
function rowTotals(row: MetaRow) {
  const spend = Number(row.spend ?? 0);
  let conversions = 0;
  let revenue = 0;

  for (const a of row.actions ?? []) {
    if (PURCHASE_ACTION_TYPES.has(a.action_type)) {
      conversions += Number(a.value ?? 0);
    }
  }

  for (const v of row.action_values ?? []) {
    if (PURCHASE_ACTION_TYPES.has(v.action_type)) {
      revenue += Number(v.value ?? 0);
    }
  }

  return { spend, conversions, revenue };
}

export async function fetchMetaAds(days = DEFAULT_WINDOW_DAYS): Promise<AnalyticsSummary | null> {
  const token = accessToken();
  const accountId = adAccountId();
  if (!token || !accountId) return null;

  try {
    const { current, previous } = currentAndPreviousWindows(days);

    const [curRows, prevRows] = await Promise.all([
      fetchDailyInsights(token, accountId, current.start, current.end),
      fetchDailyInsights(token, accountId, previous.start, previous.end),
    ]);

    const curTotals = curRows.reduce(
      (acc, row) => {
        const t = rowTotals(row);
        acc.spend += t.spend;
        acc.conversions += t.conversions;
        acc.revenue += t.revenue;
        return acc;
      },
      { spend: 0, conversions: 0, revenue: 0 },
    );
    const prevTotals = prevRows.reduce(
      (acc, row) => {
        const t = rowTotals(row);
        acc.spend += t.spend;
        acc.conversions += t.conversions;
        acc.revenue += t.revenue;
        return acc;
      },
      { spend: 0, conversions: 0, revenue: 0 },
    );

    const cpaCur =
      curTotals.conversions > 0 ? curTotals.spend / curTotals.conversions : 0;
    const cpaPrev =
      prevTotals.conversions > 0 ? prevTotals.spend / prevTotals.conversions : 0;
    const roasCur = curTotals.spend > 0 ? curTotals.revenue / curTotals.spend : 0;
    const roasPrev = prevTotals.spend > 0 ? prevTotals.revenue / prevTotals.spend : 0;

    const spendSeries: Series = {
      key: "ad_spend",
      label: "Meta Ad Spend",
      unit: "currency",
      points: curRows.map((row) => ({
        date: row.date_start,
        label: row.date_start.slice(5),
        value: Number(row.spend ?? 0),
      })),
    };

    const metrics: UnifiedMetric[] = [
      {
        key: "adSpend",
        label: "Ad Spend (Meta)",
        value: formatCompactBDT(curTotals.spend),
        raw: curTotals.spend,
        unit: "currency",
        source: "meta-ads",
        trend: buildTrend(curTotals.spend, prevTotals.spend),
      },
      {
        key: "cpa",
        label: "CPA (Cost per Purchase)",
        value: cpaCur > 0 ? `৳${Math.round(cpaCur).toLocaleString()}` : "—",
        raw: cpaCur,
        unit: "currency",
        source: "meta-ads",
        trend: cpaCur <= 0 ? { value: "0%", direction: "flat" } : buildTrend(cpaCur, cpaPrev),
      },
      {
        key: "roas",
        label: "ROAS (Return on Ad Spend)",
        value: roasCur > 0 ? `${roasCur.toFixed(2)}×` : "—",
        raw: roasCur,
        unit: "ratio",
        source: "meta-ads",
        trend: roasCur <= 0 ? { value: "0%", direction: "flat" } : buildTrend(roasCur, roasPrev),
      },
    ];

    return {
      fetchedAt: new Date().toISOString(),
      period: { start: current.start, end: current.end },
      metrics,
      series: [spendSeries],
    };
  } catch (error) {
    console.error("[meta:fetchMetaAds] Error:", error);
    return null;
  }
}