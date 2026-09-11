// Shared analytics types — the unified view model the dashboard renders.
// Each fetcher normalizes its platform-specific payload into these shapes so
// the UI can seamlessly present both store e-commerce data and external channels.

export type TrendDirection = "up" | "down" | "flat";

export interface Trend {
  value: string;
  direction: TrendDirection;
}

export type MetricUnit = "currency" | "count" | "percentage" | "ratio";

/** A single metric paired with its period-over-period trend and optional sparkline. */
export interface UnifiedMetric {
  key: string;
  label: string;
  value: string;
  raw: number;
  unit?: MetricUnit;
  source?: "store" | "google-analytics" | "search-console" | "meta-ads";
  trend: Trend;
  sparkline?: number[];
}

/** One daily data point for time-series charts. */
export interface DailyPoint {
  date: string; // ISO yyyy-mm-dd
  label: string; // short display label, e.g. "Mar 5"
  value: number;
}

/** One line/area series for recharts. */
export interface Series {
  key: string;
  label: string;
  unit: "currency" | "count";
  points: DailyPoint[];
  color?: string;
}

export interface AnalyticsSummary {
  fetchedAt: string; // ISO timestamp
  period: { start: string; end: string };
  metrics: UnifiedMetric[];
  series: Series[];
}

export interface SourceStatus {
  source: "store" | "google-analytics" | "search-console" | "meta-ads";
  displayName: string;
  configured: boolean;
  status: "connected" | "not_configured" | "error";
  error?: string;
  details?: string;
}

export interface TopSellingProduct {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  label: string;
  count: number;
  total: number;
  percentage: number;
}

export interface OrderStatusBreakdown {
  status: string;
  label: string;
  count: number;
}

export interface StoreAnalyticsSummary {
  grossSales: number;
  deliveredRevenue: number;
  totalOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
  topProducts: TopSellingProduct[];
  paymentMethods: PaymentMethodBreakdown[];
  orderStatuses: OrderStatusBreakdown[];
  metrics: UnifiedMetric[];
  series: Series[];
}

export interface FunnelStage {
  id: string;
  label: string;
  subtitle: string;
  count: number;
  rate: number; // percentage vs first stage
  stageRate: number; // step-to-step conversion rate %
  source: "search-console" | "google-analytics" | "store" | "meta-ads";
  color: string;
}

export interface ChannelBreakdown {
  id: string;
  label: string;
  visitors: number;
  orders: number;
  revenue: number;
  percentage: number;
  color: string;
  source: "search-console" | "google-analytics" | "store" | "meta-ads";
}

export interface UnifiedDashboard {
  period: { start: string; end: string; days: number };
  fetchedAt: string;
  metrics: UnifiedMetric[];
  series: Series[];
  sources: SourceStatus[];
  storeSummary: StoreAnalyticsSummary;
  funnel: FunnelStage[];
  channelBreakdown: ChannelBreakdown[];
  isSimulated: boolean;
}