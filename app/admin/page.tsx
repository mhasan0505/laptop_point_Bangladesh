"use client";

export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AdminProduct, AdminStats, OrderData } from "@/lib/admin-data";
import { fetchAdminProducts } from "@/lib/admin-products-api";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Flame,
  Image as ImageIcon,
  Laptop,
  PackageOpen,
  Plus,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Truck,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ApiOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

function paymentLabel(method: string): string {
  const map: Record<string, string> = {
    cod: "Cash on Delivery",
    bkash: "bKash",
    nagad: "Nagad",
    card: "Card",
  };
  return map[method] ?? method;
}

const AdminDashboard = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: "৳0",
    lowStockItems: 0,
    deliveredToday: 0,
  });
  const [recentOrders, setRecentOrders] = useState<OrderData[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<
    Array<{
      id?: string;
      name: string;
      stock: number;
      category: string;
    }>
  >([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const [ordersRes, productsData] = await Promise.all([
        fetch("/api/orders", { cache: "no-store" }),
        fetchAdminProducts(),
      ]);

      let apiOrders: ApiOrder[] = [];
      if (ordersRes.ok) {
        apiOrders = (await ordersRes.json()) as ApiOrder[];
      }

      const recent = apiOrders.slice(0, 5).map((o) => ({
        id: o.orderNumber,
        customer: o.customerName,
        amount: `৳${o.totalAmount.toLocaleString()}`,
        status: o.status,
        date: o.createdAt ? o.createdAt.slice(0, 10) : "Today",
        paymentMethod: paymentLabel(o.paymentMethod),
      }));

      const lowStockList = productsData.filter((p: AdminProduct) => p.stock < 10 && p.stock >= 0);
      const lowStockCount = lowStockList.length;
      const pendingCount = apiOrders.filter((o) => o.status === "Pending").length;
      const deliveredToday = apiOrders.filter((o) => {
        if (o.status !== "Delivered") return false;
        return o.createdAt?.slice(0, 10) === new Date().toISOString().slice(0, 10);
      }).length;
      const totalRevenue = apiOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      setStats({
        totalProducts: productsData.length,
        totalOrders: apiOrders.length,
        pendingOrders: pendingCount,
        totalRevenue: `৳${totalRevenue.toLocaleString()}`,
        lowStockItems: lowStockCount,
        deliveredToday,
      });

      setRecentOrders(recent);
      setLowStockProducts(
        lowStockList.slice(0, 5).map((p: AdminProduct) => ({
          id: p.id,
          name: p.name,
          stock: p.stock,
          category: p.category,
        }))
      );
    } catch (err) {
      console.error("Error loading admin stats:", err);
    } finally {
      setDataLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated || dataLoading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading console data...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      case "Processing":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
      case "Shipped":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20";
      case "Delivered":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      default:
        return "bg-muted text-muted-foreground border border-border";
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Welcome & Controls Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Live System Status: Normal
            </p>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Welcome back, Administrator
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Here is your real-time store performance, incoming orders, and inventory summary.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={isRefreshing}
            className="h-9 text-xs font-semibold rounded-sm border-border gap-1.5"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
            Refresh Data
          </Button>

          <Link href="/admin/products/new">
            <Button
              size="sm"
              className="h-9 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-sm gap-1.5 shadow-xs"
            >
              <Plus size={14} />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Revenue */}
        <div className="flex flex-col justify-between rounded-md border border-border bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </p>
            <div className="grid h-8 w-8 place-items-center rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CircleDollarSign size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
              {stats.totalRevenue}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUp size={11} />
              <span>All-time Gross</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="flex flex-col justify-between rounded-md border border-border bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Orders
            </p>
            <div className="grid h-8 w-8 place-items-center rounded-sm bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
              {stats.totalOrders}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              <Clock size={11} />
              <span>{stats.pendingOrders} Pending Action</span>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="flex flex-col justify-between rounded-md border border-border bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Catalog Items
            </p>
            <div className="grid h-8 w-8 place-items-center rounded-sm bg-zinc-500/10 text-zinc-600 dark:text-zinc-400">
              <Laptop size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
              {stats.totalProducts}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
              <Boxes size={11} />
              <span>Active Hardware</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="flex flex-col justify-between rounded-md border border-border bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Low Stock Alerts
            </p>
            <div className="grid h-8 w-8 place-items-center rounded-sm bg-red-500/10 text-red-600 dark:text-red-400">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400 tracking-tight">
              {stats.lowStockItems}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400 font-semibold">
              <span>Restock recommended</span>
            </div>
          </div>
        </div>

        {/* Delivered Today */}
        <div className="col-span-2 sm:col-span-1 flex flex-col justify-between rounded-md border border-border bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Fulfilled Today
            </p>
            <div className="grid h-8 w-8 place-items-center rounded-sm bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <PackageOpen size={16} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
              {stats.deliveredToday}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
              <CheckCircle2 size={11} />
              <span>Delivered packages</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dashboard Operations Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2 rounded-md border border-border bg-card shadow-2xs flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border">
            <div>
              <h2 className="text-sm font-bold text-foreground">Recent Customer Orders</h2>
              <p className="text-[11px] text-muted-foreground">
                Showing latest transaction activities
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              All Orders <ArrowRight size={12} />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No orders received yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground">
                    <th className="py-2.5 px-4">Order ID</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Payment</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => router.push("/admin/orders")}
                      className="hover:bg-zinc-100 dark:hover:bg-zinc-850/60 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-foreground">
                        {order.id}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-foreground">{order.customer}</p>
                        <p className="text-[10px] text-muted-foreground">{order.date}</p>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-medium">
                        {order.paymentMethod}
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground">
                        {order.amount}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low Stock Watchlist & Shortcuts (1 Column) */}
        <div className="space-y-6">
          {/* Critical Low Stock Alert Card */}
          <div className="rounded-md border border-border bg-card shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-red-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Low Stock Watchlist
                </h3>
              </div>
              <Link
                href="/admin/inventory"
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-2.5">
              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  All inventory levels are healthy.
                </p>
              ) : (
                lowStockProducts.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-sm border border-border bg-background/60 text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.category}</p>
                    </div>
                    <span className="rounded-xs bg-red-500/10 text-red-600 dark:text-red-400 font-bold px-2 py-0.5 text-[10px] shrink-0">
                      {item.stock} left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Management Navigation Shortcuts */}
          <div className="rounded-md border border-border bg-card shadow-2xs p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 border-b border-border pb-2">
              Quick Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/products"
                className="flex flex-col items-center justify-center p-3 rounded-sm border border-border bg-background hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors text-center group"
              >
                <Laptop size={18} className="text-muted-foreground group-hover:text-blue-500 mb-1" />
                <span className="text-xs font-bold text-foreground">Products</span>
                <span className="text-[9px] text-muted-foreground">Manage catalog</span>
              </Link>

              <Link
                href="/admin/inventory"
                className="flex flex-col items-center justify-center p-3 rounded-sm border border-border bg-background hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors text-center group"
              >
                <Warehouse size={18} className="text-muted-foreground group-hover:text-blue-500 mb-1" />
                <span className="text-xs font-bold text-foreground">Inventory</span>
                <span className="text-[9px] text-muted-foreground">Adjust stock</span>
              </Link>

              <Link
                href="/admin/hero-banners"
                className="flex flex-col items-center justify-center p-3 rounded-sm border border-border bg-background hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors text-center group"
              >
                <ImageIcon size={18} className="text-muted-foreground group-hover:text-blue-500 mb-1" />
                <span className="text-xs font-bold text-foreground">Hero Banners</span>
                <span className="text-[9px] text-muted-foreground">Homepage slides</span>
              </Link>

              <Link
                href="/admin/hot-deal"
                className="flex flex-col items-center justify-center p-3 rounded-sm border border-border bg-background hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors text-center group"
              >
                <Flame size={18} className="text-muted-foreground group-hover:text-blue-500 mb-1" />
                <span className="text-xs font-bold text-foreground">Flash Deals</span>
                <span className="text-[9px] text-muted-foreground">Promotions</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
