"use server";

import { prisma } from "@/lib/prisma";

type DateRange = "7d" | "30d" | "90d" | "6m" | "1y";

function getStartDate(range: DateRange): Date {
  const date = new Date();
  switch (range) {
    case "7d":
      date.setDate(date.getDate() - 7);
      break;
    case "30d":
      date.setDate(date.getDate() - 30);
      break;
    case "90d":
      date.setDate(date.getDate() - 90);
      break;
    case "6m":
      date.setMonth(date.getMonth() - 6);
      break;
    case "1y":
      date.setFullYear(date.getFullYear() - 1);
      break;
    default:
      date.setMonth(date.getMonth() - 6);
  }
  return date;
}

export async function getAnalyticsData(range: DateRange = "6m") {
  try {
    const startDate = getStartDate(range);

    // 1. Total Orders and Revenue (Filtered by date range)
    const ordersResult = await prisma.order.aggregate({
      _count: { id: true },
      _sum: { totalAmount: true },
      where: {
        status: { not: "Cancelled" },
        createdAt: { gte: startDate }
      }
    });

    const totalOrders = ordersResult._count.id;
    const totalRevenue = ordersResult._sum.totalAmount || 0;

    // 2. Sales Distribution (Top Categories for the range)
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          status: { not: "Cancelled" },
          createdAt: { gte: startDate }
        }
      },
      select: {
        unitPrice: true,
        quantity: true,
        productId: true,
      }
    });

    const productIds = [...new Set(orderItems.map(item => item.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, category: true, sanityId: true }
    });
    
    const productCategoryMap = new Map();
    products.forEach(p => {
      productCategoryMap.set(p.id, p.category);
      productCategoryMap.set(p.sanityId, p.category);
    });

    const categorySales: Record<string, number> = {};
    orderItems.forEach(item => {
      const category = productCategoryMap.get(item.productId) || 'Uncategorized';
      if (!categorySales[category]) categorySales[category] = 0;
      categorySales[category] += (item.unitPrice * item.quantity);
    });

    const salesDistribution = Object.entries(categorySales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // 3. Trend Data (Revenue over time)
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: "Cancelled" }
      },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: 'asc' }
    });

    // Grouping logic depends on the range
    const trendMap: Record<string, number> = {};
    recentOrders.forEach(order => {
      let key = "";
      if (range === "7d" || range === "30d") {
        // Daily grouping
        key = order.createdAt.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      } else {
        // Monthly grouping
        key = order.createdAt.toLocaleDateString('default', { month: 'short', year: 'numeric' });
      }
      
      if (!trendMap[key]) trendMap[key] = 0;
      trendMap[key] += order.totalAmount;
    });

    // Build the final array ensuring chronological order
    const trendData = [];
    if (range === "7d" || range === "30d") {
       const days = range === "7d" ? 7 : 30;
       for (let i = days - 1; i >= 0; i--) {
         const d = new Date();
         d.setDate(d.getDate() - i);
         const key = d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
         trendData.push({ label: key, revenue: trendMap[key] || 0 });
       }
    } else {
       const months = range === "90d" ? 3 : range === "6m" ? 6 : 12;
       for (let i = months - 1; i >= 0; i--) {
         const d = new Date();
         d.setMonth(d.getMonth() - i);
         const key = d.toLocaleDateString('default', { month: 'short', year: 'numeric' });
         trendData.push({ label: key, revenue: trendMap[key] || 0 });
       }
    }

    return {
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        salesDistribution,
        trendData
      }
    };

  } catch (error: any) {
    console.error("Error fetching analytics data:", error);
    return { success: false, error: error.message || "Failed to fetch analytics data" };
  }
}

export async function getGoogleAnalyticsData(range: DateRange = "6m") {
  try {
    const propertyId = process.env.GA_PROPERTY_ID;
    if (!propertyId) return { success: false, error: "GA_PROPERTY_ID not configured" };

    const { BetaAnalyticsDataClient } = await import('@google-analytics/data');
    const analyticsDataClient = new BetaAnalyticsDataClient();

    let gaDateRange = '180daysAgo';
    if (range === "7d") gaDateRange = '7daysAgo';
    else if (range === "30d") gaDateRange = '30daysAgo';
    else if (range === "90d") gaDateRange = '90daysAgo';
    else if (range === "1y") gaDateRange = '365daysAgo';

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: gaDateRange, endDate: 'today' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }, { name: 'sessions' }],
    });

    let totalUsers = 0;
    let totalPageViews = 0;
    let totalSessions = 0;
    const trafficSources: { name: string; value: number }[] = [];

    response.rows?.forEach(row => {
      if (row.metricValues && row.dimensionValues) {
        const users = parseInt(row.metricValues[0].value || '0');
        const pageViews = parseInt(row.metricValues[1].value || '0');
        const sessions = parseInt(row.metricValues[2].value || '0');
        const source = row.dimensionValues[0].value || 'Unknown';

        totalUsers += users;
        totalPageViews += pageViews;
        totalSessions += sessions;
        
        trafficSources.push({ name: source, value: sessions });
      }
    });

    trafficSources.sort((a, b) => b.value - a.value);

    return {
      success: true,
      data: { totalUsers, totalPageViews, totalSessions, trafficSources }
    };
  } catch (error: any) {
    console.error("Error fetching Google Analytics data:", error);
    return { success: false, error: error.message || "Failed to fetch Google Analytics data" };
  }
}
