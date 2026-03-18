"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AdminStats, OrderData } from "@/lib/admin-data";
import {
  fetchOrders,
  fetchProducts,
  getAdminStatsFromSanity,
} from "@/lib/sanity-admin";
import {
  CircleDollarSign,
  Laptop,
  PackageOpen,
  Siren,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      name: string;
      stock: number;
      category: string;
    }>
  >([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, ordersData, productsData] = await Promise.all([
          getAdminStatsFromSanity(),
          fetchOrders(),
          fetchProducts(),
        ]);

        setStats(statsData);
        setRecentOrders(ordersData.slice(0, 4));
        setLowStockProducts(
          productsData
            .filter((p) => p.stock < 10 && p.stock > 0)
            .slice(0, 4)
            .map((p) => ({
              name: p.name,
              stock: p.stock,
              category: p.category,
            })),
        );
      } finally {
        setDataLoading(false);
      }
    };

    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const navigateTo = (href: string) => {
    router.push(href);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            Welcome back! Here&apos;s what&apos;s happening with your store
            today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            className="bg-black hover:bg-gray-800 text-white"
            size="sm"
            onClick={() => navigateTo("/admin/products/add")}
          >
            Add New Product
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo("/admin/orders")}
          >
            View All Orders
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="bg-white shadow-sm border border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Products
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Laptop className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {stats.totalProducts}
            </div>
            <p className="text-xs text-blue-600 mt-1">+12 from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Orders
            </CardTitle>
            <div className="p-2 bg-orange-50 rounded-lg">
              <Truck className="w-5 h-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {stats.totalOrders}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              {stats.pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Revenue
            </CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <CircleDollarSign className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {stats.totalRevenue}
            </div>
            <p className="text-xs text-green-600 mt-1">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Low Stock Alert
            </CardTitle>
            <div className="p-2 bg-red-50 rounded-lg">
              <Siren className="w-5 h-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-red-600 mt-1">Items need restocking</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Delivered Today
            </CardTitle>
            <div className="p-2 bg-violet-50 rounded-lg">
              <PackageOpen className="w-5 h-5 text-violet-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {stats.deliveredToday}
            </div>
            <p className="text-xs text-violet-600 mt-1">
              On-time delivery rate: 95%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Recent Orders */}
        <Card className="flex flex-col h-full shadow-sm border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-black">
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
                >
                  <div>
                    <p className="font-medium text-black">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                    <p className="text-xs text-gray-500">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-black">{order.amount}</p>
                    <span
                      className={`inline-block px-2 py-1 mt-1 text-xs rounded-full ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigateTo("/admin/orders")}
              >
                View All Orders
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="flex flex-col h-full shadow-sm border border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold text-black">
              Low Stock Alert
            </CardTitle>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Top 4
            </span>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <div className="space-y-4">
              {lowStockProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-red-100 transition-colors group"
                >
                  <div>
                    <p className="font-medium text-black group-hover:text-red-700 transition-colors">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600 text-sm mb-2">
                      {product.stock} {product.stock === 1 ? "unit" : "units"}{" "}
                      left
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      Restock
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigateTo("/admin/inventory")}
              >
                Manage Inventory
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminDashboard;
