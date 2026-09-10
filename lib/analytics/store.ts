import "server-only";
import { prisma } from "@/lib/prisma";
import { unstable_cache as cache } from "next/cache";
import type {
  DailyPoint,
  OrderStatusBreakdown,
  PaymentMethodBreakdown,
  Series,
  StoreAnalyticsSummary,
  TopSellingProduct,
  UnifiedMetric,
} from "./types";
import {
  DEFAULT_WINDOW_DAYS,
  buildTrend,
  currentAndPreviousWindows,
  formatCompactBDT,
  shortDate,
} from "./utils";

const REVALIDATE_SECONDS = 1800; // 30 minutes cache for store data

function createEmptyStoreSummary(): StoreAnalyticsSummary {
  return {
    grossSales: 0,
    deliveredRevenue: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    paymentMethods: [],
    orderStatuses: [],
    metrics: [
      {
        key: "store_gross_sales",
        label: "Store Sales",
        value: "৳0",
        raw: 0,
        unit: "currency",
        source: "store",
        trend: { value: "0%", direction: "flat" },
      },
      {
        key: "store_total_orders",
        label: "Store Orders",
        value: "0",
        raw: 0,
        unit: "count",
        source: "store",
        trend: { value: "0%", direction: "flat" },
      },
      {
        key: "store_aov",
        label: "Average Order Value",
        value: "৳0",
        raw: 0,
        unit: "currency",
        source: "store",
        trend: { value: "0%", direction: "flat" },
      },
    ],
    series: [
      {
        key: "store_revenue",
        label: "Store Revenue",
        unit: "currency",
        points: [],
      },
      {
        key: "store_orders_count",
        label: "Order Volume",
        unit: "count",
        points: [],
      },
    ],
  };
}

const PAYMENT_LABELS: Record<string, string> = {
  BKASH: "bKash",
  NAGAD: "Nagad",
  CARD: "Credit / Debit Card",
  COD: "Cash on Delivery",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

async function queryStoreAnalytics(days = DEFAULT_WINDOW_DAYS): Promise<StoreAnalyticsSummary> {
  const { current, previous } = currentAndPreviousWindows(days);
  const curStartDate = new Date(`${current.start}T00:00:00.000Z`);
  const curEndDate = new Date(`${current.end}T23:59:59.999Z`);
  const prevStartDate = new Date(`${previous.start}T00:00:00.000Z`);
  const prevEndDate = new Date(`${previous.end}T23:59:59.999Z`);

  try {
    const [currentOrders, previousOrders, orderItems] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: curStartDate,
            lte: curEndDate,
          },
        },
        include: {
          items: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: prevStartDate,
            lte: prevEndDate,
          },
        },
        select: {
          id: true,
          totalAmount: true,
          status: true,
        },
      }),
      prisma.orderItem.findMany({
        where: {
          order: {
            createdAt: {
              gte: curStartDate,
              lte: curEndDate,
            },
            status: { not: "CANCELLED" },
          },
        },
        select: {
          productId: true,
          name: true,
          quantity: true,
          unitPrice: true,
        },
      }),
    ]);

    // Current period aggregations
    const activeOrders = currentOrders.filter((o) => o.status !== "CANCELLED");
    const grossSales = activeOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0,
    );
    const deliveredOrders = currentOrders.filter((o) => o.status === "DELIVERED");
    const deliveredRevenue = deliveredOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0,
    );
    const pendingOrders = currentOrders.filter(
      (o) => o.status === "PENDING" || o.status === "PROCESSING",
    ).length;

    const totalOrdersCount = activeOrders.length;
    const aov = totalOrdersCount > 0 ? grossSales / totalOrdersCount : 0;

    // Previous period aggregations for trends
    const prevActive = previousOrders.filter((o) => o.status !== "CANCELLED");
    const prevGrossSales = prevActive.reduce(
      (sum, o) => sum + Number(o.totalAmount || 0),
      0,
    );
    const prevTotalOrders = prevActive.length;
    const prevAov = prevTotalOrders > 0 ? prevGrossSales / prevTotalOrders : 0;

    // Payment method distribution
    const paymentMap = new Map<string, { count: number; total: number }>();
    for (const order of activeOrders) {
      const method = order.paymentMethod;
      const amount = Number(order.totalAmount || 0);
      const existing = paymentMap.get(method) || { count: 0, total: 0 };
      paymentMap.set(method, {
        count: existing.count + 1,
        total: existing.total + amount,
      });
    }

    const paymentMethods: PaymentMethodBreakdown[] = Array.from(paymentMap.entries()).map(
      ([method, data]) => ({
        method,
        label: PAYMENT_LABELS[method] || method,
        count: data.count,
        total: data.total,
        percentage: grossSales > 0 ? Math.round((data.total / grossSales) * 100) : 0,
      }),
    );

    // Order status breakdown
    const statusMap = new Map<string, number>();
    for (const order of currentOrders) {
      statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1);
    }
    const orderStatuses: OrderStatusBreakdown[] = Array.from(statusMap.entries()).map(
      ([status, count]) => ({
        status,
        label: STATUS_LABELS[status] || status,
        count,
      }),
    );

    // Top selling products
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    for (const item of orderItems) {
      const pid = item.productId;
      const qty = item.quantity;
      const rev = Number(item.unitPrice || 0) * qty;
      const existing = productMap.get(pid) || { name: item.name, quantity: 0, revenue: 0 };
      productMap.set(pid, {
        name: item.name,
        quantity: existing.quantity + qty,
        revenue: existing.revenue + rev,
      });
    }
    const topProducts: TopSellingProduct[] = Array.from(productMap.entries())
      .map(([id, p]) => ({ id, name: p.name, quantity: p.quantity, revenue: p.revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Daily time series mapping
    const dailyRevMap = new Map<string, number>();
    const dailyCountMap = new Map<string, number>();

    for (const order of activeOrders) {
      const dateKey = order.createdAt.toISOString().slice(0, 10);
      dailyRevMap.set(dateKey, (dailyRevMap.get(dateKey) || 0) + Number(order.totalAmount || 0));
      dailyCountMap.set(dateKey, (dailyCountMap.get(dateKey) || 0) + 1);
    }

    const revPoints: DailyPoint[] = [];
    const countPoints: DailyPoint[] = [];
    const cursor = new Date(`${current.start}T00:00:00Z`);
    const endDate = new Date(`${current.end}T00:00:00Z`);

    while (cursor <= endDate) {
      const iso = cursor.toISOString().slice(0, 10);
      const label = shortDate(iso);
      revPoints.push({
        date: iso,
        label,
        value: dailyRevMap.get(iso) || 0,
      });
      countPoints.push({
        date: iso,
        label,
        value: dailyCountMap.get(iso) || 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const series: Series[] = [
      {
        key: "store_revenue",
        label: "Store Revenue",
        unit: "currency",
        points: revPoints,
      },
      {
        key: "store_orders",
        label: "Order Volume",
        unit: "count",
        points: countPoints,
      },
    ];

    const metrics: UnifiedMetric[] = [
      {
        key: "storeGrossSales",
        label: "Store Sales",
        value: formatCompactBDT(grossSales),
        raw: grossSales,
        unit: "currency",
        source: "store",
        trend: buildTrend(grossSales, prevGrossSales),
      },
      {
        key: "storeTotalOrders",
        label: "Store Orders",
        value: totalOrdersCount.toLocaleString(),
        raw: totalOrdersCount,
        unit: "count",
        source: "store",
        trend: buildTrend(totalOrdersCount, prevTotalOrders),
      },
      {
        key: "storeAov",
        label: "Avg. Order Value (AOV)",
        value: formatCompactBDT(aov),
        raw: aov,
        unit: "currency",
        source: "store",
        trend: buildTrend(aov, prevAov),
      },
      {
        key: "storeDeliveredSales",
        label: "Delivered Revenue",
        value: formatCompactBDT(deliveredRevenue),
        raw: deliveredRevenue,
        unit: "currency",
        source: "store",
        trend: { value: `${deliveredOrders.length} delivered`, direction: "flat" },
      },
    ];

    return {
      grossSales,
      deliveredRevenue,
      totalOrders: totalOrdersCount,
      deliveredOrders: deliveredOrders.length,
      pendingOrders,
      averageOrderValue: aov,
      topProducts,
      paymentMethods,
      orderStatuses,
      metrics,
      series,
    };
  } catch (err) {
    console.error("[store:queryStoreAnalytics] Failed to fetch orders from database:", err);
    return createEmptyStoreSummary();
  }
}

export const fetchStoreAnalytics = cache(
  async (days = DEFAULT_WINDOW_DAYS) => queryStoreAnalytics(days),
  ["analytics", "store"],
  { revalidate: REVALIDATE_SECONDS },
);
