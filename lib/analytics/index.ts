// Aggregates Store Database + GA4 + GSC + Meta into a single unified dashboard payload.
// Imported only from server components and route handlers.

import { fetchGoogleAnalytics } from "./ga4";
import { fetchSearchConsole } from "./gsc";
import { fetchMetaAds } from "./meta";
import { fetchStoreAnalytics } from "./store";
import type {
  AnalyticsSummary,
  Series,
  SourceStatus,
  StoreAnalyticsSummary,
  UnifiedDashboard,
  UnifiedMetric,
} from "./types";
import { DEFAULT_WINDOW_DAYS, currentAndPreviousWindows, normalizeDays } from "./utils";

export type {
  OrderStatusBreakdown,
  PaymentMethodBreakdown,
  Series,
  SourceStatus,
  StoreAnalyticsSummary,
  TopSellingProduct,
  UnifiedDashboard,
  UnifiedMetric,
} from "./types";

export async function fetchUnifiedAnalytics(
  daysInput?: number | string | null,
): Promise<UnifiedDashboard> {
  const days = normalizeDays(daysInput);
  const { current } = currentAndPreviousWindows(days);

  const results = await Promise.allSettled([
    fetchStoreAnalytics(days),
    fetchGoogleAnalytics(days),
    fetchSearchConsole(days),
    fetchMetaAds(days),
  ]);

  const storeRes = results[0].status === "fulfilled" ? results[0].value : null;
  const gaRes = results[1].status === "fulfilled" ? results[1].value : null;
  const gscRes = results[2].status === "fulfilled" ? results[2].value : null;
  const metaRes = results[3].status === "fulfilled" ? results[3].value : null;

  const defaultStoreSummary: StoreAnalyticsSummary = {
    grossSales: 0,
    deliveredRevenue: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    paymentMethods: [],
    orderStatuses: [],
    metrics: [],
    series: [],
  };

  const storeSummary = storeRes ?? defaultStoreSummary;

  // Aggregate metrics: Store core metrics first, followed by marketing channels
  const metrics: UnifiedMetric[] = [
    ...storeSummary.metrics,
    ...(gaRes?.metrics ?? []),
    ...(gscRes?.metrics ?? []),
    ...(metaRes?.metrics ?? []),
  ];

  // Aggregate series
  const series: Series[] = [
    ...storeSummary.series,
    ...(gaRes?.series ?? []),
    ...(gscRes?.series ?? []),
    ...(metaRes?.series ?? []),
  ];

  // Sources status tracking
  const hasGaCreds = Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ||
      process.env.GA_SERVICE_ACCOUNT,
  );
  const hasGscCreds = Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ||
      process.env.GSC_SERVICE_ACCOUNT,
  );
  const hasMetaCreds = Boolean(
    process.env.META_ADS_ACCESS_TOKEN && process.env.META_ADS_ACCOUNT_ID,
  );

  const sources: SourceStatus[] = [
    {
      source: "store",
      displayName: "Store Orders (PostgreSQL)",
      configured: true,
      status: storeRes ? "connected" : "error",
      error: storeRes ? undefined : "Database query failed or timed out",
    },
    {
      source: "google-analytics",
      displayName: "Google Analytics 4",
      configured: hasGaCreds,
      status: gaRes !== null ? "connected" : hasGaCreds ? "error" : "not_configured",
      error: hasGaCreds && gaRes === null ? "Failed to query GA4 Data API" : undefined,
    },
    {
      source: "search-console",
      displayName: "Google Search Console",
      configured: hasGscCreds,
      status: gscRes !== null ? "connected" : hasGscCreds ? "error" : "not_configured",
      error: hasGscCreds && gscRes === null ? "Failed to query Search Console API" : undefined,
    },
    {
      source: "meta-ads",
      displayName: "Meta Ads (Facebook/Instagram)",
      configured: hasMetaCreds,
      status: metaRes !== null ? "connected" : hasMetaCreds ? "error" : "not_configured",
      error: hasMetaCreds && metaRes === null ? "Failed to query Meta Marketing API" : undefined,
    },
  ];

  return {
    period: {
      start: current.start,
      end: current.end,
      days,
    },
    fetchedAt: new Date().toISOString(),
    metrics,
    series,
    sources,
    storeSummary,
  };
}