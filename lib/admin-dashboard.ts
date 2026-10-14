import { db } from "@/lib/db";
import { getBanners, readBanners } from "@/lib/banners/storage";
import { getPowerDealConfig, getPowerDeals } from "@/lib/power-deal-data";
import { getQuestions } from "@/lib/questions-storage";

export const DHAKA_TIMEZONE = "Asia/Dhaka";

export interface SparklinePoint {
  date: string;
  label: string;
  value: number;
}

export interface DailySalesPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface MetricSummary {
  revenue: number;
  orders: number;
  averageOrderValue: number;
  unitsSold: number;
}

export interface TopProductItem {
  id: string;
  name: string;
  image: string | null;
  units: number;
  revenue: number;
}

export interface BrandRevenueItem {
  brand: string;
  revenue: number;
  percentage: number;
}

export interface AttentionItem {
  id: string;
  label: string;
  count: number;
  href: string;
  description: string;
}

export interface DashboardOrderItem {
  id: string;
  productId: string | null;
  sku: string | null;
  name: string;
  unitPrice: number;
  quantity: number;
  variantLabel?: string | null;
}

export interface DashboardOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  address: string | null;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  notes: string | null;
  createdAt: string;
  itemsCount: number;
  items: DashboardOrderItem[];
}

export interface StorefrontNowData {
  heroBanner: {
    id: string;
    title: string;
    imageUrl: string;
    linkHref: string;
    placement: string;
  } | null;
  powerDeal: {
    id: string;
    name: string;
    image: string;
    originalPrice: number;
    salePrice: number;
    targetDate: string | null;
  } | null;
}

export interface AdminDashboardData {
  today: MetricSummary;
  yesterday: MetricSummary;
  sparklines: {
    revenue: SparklinePoint[];
    orders: SparklinePoint[];
    averageOrderValue: SparklinePoint[];
    unitsSold: SparklinePoint[];
  };
  salesSeries: DailySalesPoint[];
  selectedRange: number;
  orderCountsByStatus: Record<string, number>;
  pipeline: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    total: number;
  };
  attentionItems: AttentionItem[];
  topProductsMonth: TopProductItem[];
  brandRevenueMonth: BrandRevenueItem[];
  latestOrders: DashboardOrder[];
  storefrontNow: StorefrontNowData;
  currentTimeDhaka: string;
}

/**
 * Returns YYYY-MM-DD string for a date in Asia/Dhaka.
 */
export function formatDhakaDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DHAKA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date to "10 Oct" or "Oct 10" in Asia/Dhaka.
 */
export function formatDhakaDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: DHAKA_TIMEZONE,
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Returns a UTC Date corresponding to 00:00:00.000 in Asia/Dhaka (+06:00) on a given YYYY-MM-DD.
 */
export function getDhakaMidnight(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000+06:00`);
}

/**
 * Check if an order status is cancelled (case-insensitive).
 */
export function isCancelledStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  const s = status.trim().toLowerCase();
  return s === "cancelled" || s === "canceled";
}

/**
 * Computes all dashboard aggregates on the server.
 */
export async function getAdminDashboardData(rangeDays: number = 7): Promise<AdminDashboardData> {
  const validRange = [7, 30, 90].includes(rangeDays) ? rangeDays : 7;
  try {
    const now = new Date();

  // Time boundaries in Asia/Dhaka
  const todayStr = formatDhakaDate(now);
  const startOfToday = getDhakaMidnight(todayStr);
  const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

  const [yearStr, monthStr] = todayStr.split("-");
  const startOfMonth = getDhakaMidnight(`${yearStr}-${monthStr}-01`);

  const startOfRange = new Date(startOfToday.getTime() - (validRange - 1) * 24 * 60 * 60 * 1000);
  const startOfSparkline = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);

  // Determine earliest date needed for order calculations
  let earliestDate = startOfRange.getTime() < startOfSparkline.getTime() ? startOfRange : startOfSparkline;
  if (startOfMonth.getTime() < earliestDate.getTime()) {
    earliestDate = startOfMonth;
  }
  if (startOfYesterday.getTime() < earliestDate.getTime()) {
    earliestDate = startOfYesterday;
  }

  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Execute database queries concurrently
  const [
    allOrdersInRange,
    allOrdersCountByStatus,
    pendingOlderThan24hCount,
    outOfStockProductsCount,
    outOfStockVariantsCount,
    activeProductsWithStock,
    lowStockVariantsCount,
    unansweredQuestionsCount,
    expiringBannersCount,
    settingsRecords,
    latestOrdersRaw,
    liveHeroBannerRaw,
    powerDealConfigRaw,
    activePowerDealRaw,
  ] = await Promise.all([
    // 1. Orders within the historical calculation range with line items and product metadata
    db.order.findMany({
      where: {
        createdAt: {
          gte: earliestDate,
          lt: startOfTomorrow,
        },
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productId: true,
            name: true,
            quantity: true,
            unitPrice: true,
          },
        },
      },
    }).catch((e) => {
      console.warn("[Dashboard] db.order.findMany failed:", e?.message);
      return [];
    }),

    // 2. Counts grouped by status across entire database
    db.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }).catch((e) => {
      console.warn("[Dashboard] db.order.groupBy failed:", e?.message);
      return [];
    }),

    // 3. Pending orders older than 24 hours
    db.order.count({
      where: {
        status: { equals: "pending", mode: "insensitive" },
        createdAt: { lt: twentyFourHoursAgo },
      },
    }).catch((e) => {
      console.warn("[Dashboard] db.order.count pending failed:", e?.message);
      return 0;
    }),

    // 4. Out of stock products
    ((db as any).inventory?.count
      ? (db as any).inventory.count({ where: { quantity: { lte: 0 } } })
      : Promise.resolve(0)
    ).catch((e: any) => {
      console.warn("[Dashboard] db.inventory.count outOfStock failed:", e?.message);
      return 0;
    }),
    Promise.resolve(0),

    // 5. Active products strictly with stock > 0
    ((db as any).inventory?.findMany
      ? (db as any).inventory.findMany({
          where: { quantity: { gt: 0 } },
          select: { quantity: true },
        })
      : Promise.resolve([])
    ).catch((e: any) => {
      console.warn("[Dashboard] db.inventory.findMany activeProductsWithStock failed:", e?.message);
      return [];
    }),
    Promise.resolve(0),

    // 6. Unanswered customer questions
    // 6. Unanswered customer questions
    getQuestions()
      .then((qs) => qs.filter((q) => !q.answer).length)
      .catch(() => 0),

    // 7. Banners ending within 3 days
    readBanners()
      .then(
        (bs) =>
          bs.filter(
            (b) =>
              b.active &&
              b.endsAt &&
              new Date(b.endsAt) >= now &&
              new Date(b.endsAt) <= threeDaysFromNow
          ).length
      )
      .catch(() => 0),

    // 8. Settings for setup completeness
    ((db as any).setting?.findMany
      ? (db as any).setting.findMany({ select: { key: true, value: true } })
      : Promise.resolve([])
    ).catch((e: any) => {
      console.warn("[Dashboard] db.setting.findMany failed:", e?.message);
      return [];
    }),

    // 9. Six latest orders for recent transactions table
    db.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    }).catch((e: any) => {
      console.warn("[Dashboard] db.order.findMany latestOrders failed:", e?.message);
      return [];
    }),

    // 10. Live home.hero banner
    getBanners("home.hero")
      .then((banners) => banners.find((b) => b.active) || null)
      .catch(() => null),

    // 11. Power Deal configuration and active deal
    getPowerDealConfig().catch(() => null),
    getPowerDeals()
      .then((deals) => deals.find((d) => d.active) || null)
      .catch(() => null),
  ]);

  // Aggregate orders by Dhaka calendar date
  interface DayAggregate {
    date: string;
    revenue: number;
    orders: number;
    unitsSold: number;
  }

  const dayAggregatesMap = new Map<string, DayAggregate>();

  // Filter out cancelled orders for revenue, orders, AOV, and units sold
  for (const order of allOrdersInRange) {
    if (isCancelledStatus(order.status)) {
      continue;
    }

    const orderDateStr = formatDhakaDate(order.createdAt);
    const existing = dayAggregatesMap.get(orderDateStr) || {
      date: orderDateStr,
      revenue: 0,
      orders: 0,
      unitsSold: 0,
    };

    const orderTotal =
      typeof (order as any).totalAmount === "number" && !isNaN((order as any).totalAmount)
        ? (order as any).totalAmount
        : typeof (order as any).total === "number" && !isNaN((order as any).total)
        ? (order as any).total
        : 0;
    existing.revenue += orderTotal;
    existing.orders += 1;

    let units = 0;
    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        const qty = typeof item.quantity === "number" && !isNaN(item.quantity) ? item.quantity : 1;
        units += qty;
      }
    }
    existing.unitsSold += units;

    dayAggregatesMap.set(orderDateStr, existing);
  }

  // Helper to extract or default metrics for any Dhaka date
  const getMetricsForDate = (dateStr: string): MetricSummary => {
    const agg = dayAggregatesMap.get(dateStr) || { revenue: 0, orders: 0, unitsSold: 0 };
    return {
      revenue: Math.round(agg.revenue),
      orders: agg.orders,
      averageOrderValue: agg.orders > 0 ? Math.round(agg.revenue / agg.orders) : 0,
      unitsSold: agg.unitsSold,
    };
  };

  const yesterdayStr = formatDhakaDate(startOfYesterday);
  const todayMetrics = getMetricsForDate(todayStr);
  const yesterdayMetrics = getMetricsForDate(yesterdayStr);

  // 7-day sparklines (ending with today)
  const sparklineRevenue: SparklinePoint[] = [];
  const sparklineOrders: SparklinePoint[] = [];
  const sparklineAov: SparklinePoint[] = [];
  const sparklineUnits: SparklinePoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(startOfToday.getTime() - i * 24 * 60 * 60 * 1000);
    const dStr = formatDhakaDate(d);
    const label = formatDhakaDayLabel(d);
    const metrics = getMetricsForDate(dStr);

    sparklineRevenue.push({ date: dStr, label, value: metrics.revenue });
    sparklineOrders.push({ date: dStr, label, value: metrics.orders });
    sparklineAov.push({ date: dStr, label, value: metrics.averageOrderValue });
    sparklineUnits.push({ date: dStr, label, value: metrics.unitsSold });
  }

  // 7/30/90-day daily sales chart series
  const salesSeries: DailySalesPoint[] = [];
  for (let i = validRange - 1; i >= 0; i--) {
    const d = new Date(startOfToday.getTime() - i * 24 * 60 * 60 * 1000);
    const dStr = formatDhakaDate(d);
    const label = formatDhakaDayLabel(d);
    const metrics = getMetricsForDate(dStr);

    salesSeries.push({
      date: dStr,
      label,
      revenue: metrics.revenue,
      orders: metrics.orders,
    });
  }

  // Order counts per status
  const orderCountsByStatus: Record<string, number> = {
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  for (const group of allOrdersCountByStatus) {
    const key = (group.status || "pending").toLowerCase();
    const count = (group._count && typeof group._count.id === "number") ? group._count.id : 0;
    orderCountsByStatus[key] = (orderCountsByStatus[key] || 0) + count;
  }

  const pipeline = {
    pending: orderCountsByStatus.pending || 0,
    processing: orderCountsByStatus.processing || 0,
    shipped: orderCountsByStatus.shipped || 0,
    delivered: orderCountsByStatus.delivered || 0,
    total:
      (orderCountsByStatus.pending || 0) +
      (orderCountsByStatus.processing || 0) +
      (orderCountsByStatus.shipped || 0) +
      (orderCountsByStatus.delivered || 0),
  };

  // Setup items needing attention
  const settingsMap: Record<string, unknown> = {};
  for (const rec of settingsRecords) {
    settingsMap[rec.key] = rec.value;
  }

  let setupSectionsNeedingAttentionCount = 0;
  const setupKeys = ["store_profile", "homepage_layout", "navigation", "delivery_payments", "policies", "tracking", "seo"];
  for (const key of setupKeys) {
    if (!settingsMap[key]) {
      setupSectionsNeedingAttentionCount++;
    }
  }

  // Low stock calculation: stock > 0 AND stock <= threshold (strictly excludes out of stock)
  const lowStockProductsCount = (activeProductsWithStock as any[]).filter(
    (p: any) => (p.quantity ?? p.stockQty ?? 0) <= (p.lowStockThreshold ?? 10)
  ).length;

  const totalOutOfStock = outOfStockProductsCount + outOfStockVariantsCount;
  const totalLowStock = lowStockProductsCount + lowStockVariantsCount;

  const attentionItems: AttentionItem[] = [
    {
      id: "pending_orders_24h",
      label: "Pending Orders Older Than 24h",
      count: pendingOlderThan24hCount,
      href: "/admin/orders?status=pending",
      description: "Orders awaiting staff processing for more than a day",
    },
    {
      id: "out_of_stock",
      label: "Out of Stock Products",
      count: totalOutOfStock,
      href: "/admin/inventory",
      description: "Active catalog products or variants with 0 units remaining",
    },
    {
      id: "low_stock",
      label: "Low Stock Inventory",
      count: totalLowStock,
      href: "/admin/inventory",
      description: "Active catalog items strictly with stock > 0 and <= threshold",
    },
    {
      id: "unanswered_questions",
      label: "Unanswered Questions",
      count: unansweredQuestionsCount,
      href: "/admin/questions",
      description: "Customer inquiries waiting for official store replies",
    },
    {
      id: "banners_ending_soon",
      label: "Banners Expiring in 3 Days",
      count: expiringBannersCount,
      href: "/admin/banners",
      description: "Active marketing campaigns scheduled to end within 72 hours",
    },
    {
      id: "setup_incomplete",
      label: "Setup Sections Incomplete",
      count: setupSectionsNeedingAttentionCount,
      href: "/admin/setup",
      description: "Core store configuration sections needing action",
    },
  ];

  // Top 5 products this month (non-cancelled orders)
  const productMonthMap = new Map<
    string,
    { id: string; name: string; image: string | null; units: number; revenue: number }
  >();

  // Revenue by brand this month (non-cancelled orders)
  const brandMonthMap = new Map<string, number>();
  let totalMonthRevenue = 0;

  for (const order of allOrdersInRange) {
    if (isCancelledStatus(order.status)) continue;
    if (order.createdAt < startOfMonth) continue;

    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        const prodKey = item.productId || item.name || "item";
        const price =
          typeof (item as any).unitPrice === "number" && !isNaN((item as any).unitPrice)
            ? (item as any).unitPrice
            : typeof (item as any).price === "number" && !isNaN((item as any).price)
            ? (item as any).price
            : 0;
        const qty = typeof item.quantity === "number" && !isNaN(item.quantity) ? item.quantity : 1;
        const itemRev = price * qty;
        totalMonthRevenue += itemRev;

        const itemProd = (item as any).product;
        const existingProd = productMonthMap.get(prodKey) || {
          id: item.productId || item.name || "item",
          name: item.name || "Product",
          image: itemProd?.images?.[0] || null,
          units: 0,
          revenue: 0,
        };
        existingProd.units += qty;
        existingProd.revenue += itemRev;
        if (!existingProd.image && itemProd?.images?.[0]) {
          existingProd.image = itemProd.images[0];
        }
        productMonthMap.set(prodKey, existingProd);

        const brand = (itemProd?.brand || "Unbranded").trim();
        brandMonthMap.set(brand, (brandMonthMap.get(brand) || 0) + itemRev);
      }
    }
  }

  const topProductsMonth: TopProductItem[] = Array.from(productMonthMap.values())
    .sort((a, b) => b.units - a.units || b.revenue - a.revenue)
    .slice(0, 5)
    .map((p) => ({
      ...p,
      revenue: Math.round(p.revenue),
    }));

  const brandRevenueMonth: BrandRevenueItem[] = Array.from(brandMonthMap.entries())
    .map(([brand, rev]) => ({
      brand,
      revenue: Math.round(rev),
      percentage: totalMonthRevenue > 0 ? Math.round((rev / totalMonthRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Latest 6 orders formatted
  const latestOrders: DashboardOrder[] = (latestOrdersRaw || []).map((o) => {
    let paymentMethod = "Cash on Delivery";
    if (o.notes && o.notes.includes("Payment:")) {
      const match = o.notes.match(/Payment:\s*([^,\n]+)/i);
      if (match) paymentMethod = match[1].trim();
    }

    const orderTotal =
      typeof (o as any).totalAmount === "number" && !isNaN((o as any).totalAmount)
        ? (o as any).totalAmount
        : typeof (o as any).total === "number" && !isNaN((o as any).total)
        ? (o as any).total
        : 0;
    const subtotal = typeof (o as any).subtotal === "number" ? (o as any).subtotal : orderTotal;
    const shippingCost = typeof (o as any).shippingCost === "number" ? (o as any).shippingCost : 0;
    let createdAtStr = new Date().toISOString();
    try {
      if (o.createdAt instanceof Date && !isNaN(o.createdAt.getTime())) {
        createdAtStr = o.createdAt.toISOString();
      } else if (o.createdAt) {
        const cd = new Date(o.createdAt);
        if (!isNaN(cd.getTime())) createdAtStr = cd.toISOString();
      }
    } catch {}

    const items = Array.isArray(o.items) ? o.items : [];

    return {
      id: o.id || "",
      orderNumber: o.orderNumber || "",
      customerName: (o as any).customerName || "Customer",
      customerPhone: (o as any).customerPhone || "",
      customerEmail: (o as any).customerEmail || null,
      address: (o as any).address || null,
      subtotal,
      shippingCost,
      totalAmount: orderTotal,
      status: o.status || "pending",
      paymentMethod,
      notes: o.notes || null,
      createdAt: createdAtStr,
      itemsCount: items.length,
      items: items.map((item: any) => ({
        id: item.id || "",
        productId: item.productId || null,
        sku: item.sku || null,
        name: item.name || "Item",
        unitPrice:
          typeof item.unitPrice === "number" && !isNaN(item.unitPrice)
            ? item.unitPrice
            : typeof item.price === "number" && !isNaN(item.price)
            ? item.price
            : 0,
        quantity: typeof item.quantity === "number" && !isNaN(item.quantity) ? item.quantity : 1,
        variantLabel: item.variantLabel || null,
      })),
    };
  });

  // Storefront Now
  let heroBanner: StorefrontNowData["heroBanner"] = null;
  if (liveHeroBannerRaw) {
    const rawAsset = (liveHeroBannerRaw as any).desktopAsset;
    const imageUrl = rawAsset?.storageKey
      ? `/uploads/${rawAsset.storageKey}`
      : liveHeroBannerRaw.desktopImageUrl || "";
    heroBanner = {
      id: liveHeroBannerRaw.id,
      title: liveHeroBannerRaw.headline || liveHeroBannerRaw.title,
      imageUrl,
      linkHref: liveHeroBannerRaw.linkHref || "/shop",
      placement: liveHeroBannerRaw.placement,
    };
  }

  let powerDeal: StorefrontNowData["powerDeal"] = null;
  if (activePowerDealRaw) {
    let targetDateStr: string | null = null;
    try {
      if (powerDealConfigRaw?.targetDate) {
        const td = new Date(powerDealConfigRaw.targetDate);
        if (!isNaN(td.getTime())) targetDateStr = td.toISOString();
      }
    } catch {}

    powerDeal = {
      id: activePowerDealRaw.id,
      name: activePowerDealRaw.name || "",
      image: activePowerDealRaw.image || "",
      originalPrice: activePowerDealRaw.originalPrice || 0,
      salePrice: activePowerDealRaw.salePrice || 0,
      targetDate: targetDateStr,
    };
  }

  return {
    today: todayMetrics,
    yesterday: yesterdayMetrics,
    sparklines: {
      revenue: sparklineRevenue,
      orders: sparklineOrders,
      averageOrderValue: sparklineAov,
      unitsSold: sparklineUnits,
    },
    salesSeries,
    selectedRange: validRange,
    orderCountsByStatus,
    pipeline,
    attentionItems,
    topProductsMonth,
    brandRevenueMonth,
    latestOrders,
    storefrontNow: {
      heroBanner,
      powerDeal,
    },
    currentTimeDhaka: new Intl.DateTimeFormat("en-US", {
      timeZone: DHAKA_TIMEZONE,
      dateStyle: "full",
      timeStyle: "medium",
    }).format(now),
  };
  } catch (err) {
    console.warn("[Dashboard] getAdminDashboardData error, using fallback:", err);
    return getFallbackAdminDashboardData(validRange);
  }
}

export function getFallbackAdminDashboardData(rangeDays = 7): AdminDashboardData {
  const now = new Date();
  const validRange = [7, 30, 90].includes(rangeDays) ? rangeDays : 7;
  const todayStr = formatDhakaDate(now);
  const startOfToday = getDhakaMidnight(todayStr);

  const sparklineRevenue: SparklinePoint[] = [];
  const sparklineOrders: SparklinePoint[] = [];
  const sparklineAov: SparklinePoint[] = [];
  const sparklineUnits: SparklinePoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(startOfToday.getTime() - i * 24 * 60 * 60 * 1000);
    const dStr = formatDhakaDate(d);
    const label = formatDhakaDayLabel(d);
    sparklineRevenue.push({ date: dStr, label, value: 0 });
    sparklineOrders.push({ date: dStr, label, value: 0 });
    sparklineAov.push({ date: dStr, label, value: 0 });
    sparklineUnits.push({ date: dStr, label, value: 0 });
  }

  const salesSeries: DailySalesPoint[] = [];
  for (let i = validRange - 1; i >= 0; i--) {
    const d = new Date(startOfToday.getTime() - i * 24 * 60 * 60 * 1000);
    const dStr = formatDhakaDate(d);
    const label = formatDhakaDayLabel(d);
    salesSeries.push({ date: dStr, label, revenue: 0, orders: 0 });
  }

  const emptyMetric: MetricSummary = {
    revenue: 0,
    orders: 0,
    averageOrderValue: 0,
    unitsSold: 0,
  };

  return {
    today: emptyMetric,
    yesterday: emptyMetric,
    sparklines: {
      revenue: sparklineRevenue,
      orders: sparklineOrders,
      averageOrderValue: sparklineAov,
      unitsSold: sparklineUnits,
    },
    salesSeries,
    selectedRange: validRange,
    orderCountsByStatus: {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    },
    pipeline: {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      total: 0,
    },
    attentionItems: [
      {
        id: "pending_orders_24h",
        label: "Pending Orders Older Than 24h",
        count: 0,
        href: "/admin/orders?status=pending",
        description: "Orders awaiting staff processing for more than a day",
      },
      {
        id: "out_of_stock",
        label: "Out of Stock Products",
        count: 0,
        href: "/admin/inventory",
        description: "Active catalog products or variants with 0 units remaining",
      },
      {
        id: "low_stock",
        label: "Low Stock Inventory",
        count: 0,
        href: "/admin/inventory",
        description: "Active catalog items strictly with stock > 0 and <= threshold",
      },
      {
        id: "unanswered_questions",
        label: "Unanswered Questions",
        count: 0,
        href: "/admin/questions",
        description: "Customer inquiries waiting for official store replies",
      },
      {
        id: "banners_ending_soon",
        label: "Banners Expiring in 3 Days",
        count: 0,
        href: "/admin/banners",
        description: "Active marketing campaigns scheduled to end within 72 hours",
      },
      {
        id: "setup_incomplete",
        label: "Setup Sections Incomplete",
        count: 0,
        href: "/admin/setup",
        description: "Core store configuration sections needing action",
      },
    ],
    topProductsMonth: [],
    brandRevenueMonth: [],
    latestOrders: [],
    storefrontNow: {
      heroBanner: null,
      powerDeal: null,
    },
    currentTimeDhaka: new Intl.DateTimeFormat("en-US", {
      timeZone: DHAKA_TIMEZONE,
      dateStyle: "full",
      timeStyle: "medium",
    }).format(now),
  };
}
