"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CircleDollarSign,
  Laptop,
  PackageOpen,
  Siren,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const AdminDashboard = () => {
  const [stats] = useState({
    totalProducts: 156,
    totalOrders: 89,
    pendingOrders: 12,
    totalRevenue: "৳245,670",
    lowStockItems: 8,
    deliveredToday: 15,
  });

  const recentOrders = [
    {
      id: "#ORD001",
      customer: "Ahmed Hassan",
      amount: "৳82,450",
      status: "Pending",
      date: "2025-01-20",
    },
    {
      id: "#ORD002",
      customer: "Rafiq Islam",
      amount: "৳45,890",
      status: "Shipped",
      date: "2025-01-20",
    },
    {
      id: "#ORD003",
      customer: "Karim Rahman",
      amount: "৳153,200",
      status: "Delivered",
      date: "2025-01-19",
    },
    {
      id: "#ORD004",
      customer: "Nasir Ahmed",
      amount: "৳1,650",
      status: "Processing",
      date: "2025-01-19",
    },
  ];

  const lowStockProducts = [
    { name: "HP EliteBook 840 G7", stock: 1, category: "Business Laptops" },
    { name: "Dell XPS 13 9310", stock: 2, category: "Premium Laptops" },
    { name: "MacBook Air M1", stock: 3, category: "Apple" },
    { name: "Lenovo ThinkPad X1", stock: 1, category: "Business Laptops" },
  ];

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

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Welcome back! Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-blue-100 shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Products
            </CardTitle>
            <Laptop className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {stats.totalProducts}
            </div>
            <p className="text-xs text-blue-600 mt-1">+12 from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-100 shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Orders
            </CardTitle>
            <Truck className="w-5 h-5 text-orange-600" />
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

        <Card className="bg-green-100 shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Revenue
            </CardTitle>
            <CircleDollarSign className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {stats.totalRevenue}
            </div>
            <p className="text-xs text-green-600 mt-1">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-red-100 shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Low Stock Alert
            </CardTitle>
            <Siren className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-red-600 mt-1">Items need restocking</p>
          </CardContent>
        </Card>

        <Card className="bg-violet-100 shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Delivered Today
            </CardTitle>
            <PackageOpen className="w-5 h-5 text-violet-600" />
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

        <Card className="bg-gray-100 shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/products/add">
              <Button
                className="w-full bg-black hover:bg-gray-800 text-white"
                size="sm"
              >
                Add New Product
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full" size="sm">
                View All Orders
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-black">
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-black">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                    <p className="text-xs text-gray-500">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-black">{order.amount}</p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/admin/orders">
                <Button variant="outline" className="w-full">
                  View All Orders
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-black">
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                >
                  <div>
                    <p className="font-medium text-black">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">
                      {product.stock} left
                    </p>
                    <Button
                      size="sm"
                      className="mt-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Restock
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/admin/inventory">
                <Button variant="outline" className="w-full">
                  Manage Inventory
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminDashboard;
