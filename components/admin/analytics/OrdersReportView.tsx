"use client";

import { useState } from "react";
import { AnalyticsSubNav } from "./AnalyticsSubNav";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  Eye,
  RotateCcw,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

export interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  address?: string | null;
  city?: string | null;
  itemsCount: number;
  itemsSummary: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  trackingNumber?: string | null;
}

interface OrdersReportViewProps {
  initialOrders: OrderRow[];
  days: number;
}

export function OrdersReportView({ initialOrders, days }: OrdersReportViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered orders
  const filteredOrders = initialOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);

    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    const matchesPayment =
      paymentMethodFilter === "All" || order.paymentMethod.toLowerCase() === paymentMethodFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Calculate Summary Strip
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const refundsCancellations = filteredOrders.filter(
    (o) => o.status === "Cancelled" || o.paymentStatus === "refunded"
  ).length;

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "Order Number,Date,Customer,Phone,Items,Total (BDT),Payment Method,Payment Status,Fulfillment Status",
        ...filteredOrders.map(
          (o) =>
            `"${o.orderNumber}","${o.createdAt}","${o.customerName}","${o.customerPhone}","${o.itemsSummary}","${o.totalAmount}","${o.paymentMethod}","${o.paymentStatus}","${o.status}"`
        ),
      ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `store-orders-report-${days}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Shipped":
      case "Processing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "refunded":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  return (
    <div className="space-y-6">
      <AnalyticsSubNav
        title="Store Orders Report"
        description={`Transaction ledger, fulfillment performance, and financial status over ${days} days.`}
        breadcrumbs={[
          { label: "Analytics", href: "/admin/analytics/kpi-overview" },
          { label: "Orders Report" },
        ]}
        onExport={handleExport}
      />

      {/* 1. Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-500 font-medium">Filtered Orders</span>
            <div className="text-xl font-bold text-zinc-900">{totalOrders}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-500 font-medium">Total Revenue</span>
            <div className="text-xl font-bold text-zinc-900">
              ৳{totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-500 font-medium">Avg Order Value (AOV)</span>
            <div className="text-xl font-bold text-zinc-900">
              ৳{aov.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-500 font-medium">Refunds / Cancelled</span>
            <div className="text-xl font-bold text-zinc-900">
              {refundsCancellations}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by order ID (#LP-...), customer name, or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={paymentMethodFilter}
            onChange={(e) => {
              setPaymentMethodFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All">All Payments</option>
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="card">Card / Online</option>
          </select>
        </div>
      </div>

      {/* 3. Orders Table */}
      <div className="rounded-xl bg-white border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-50/70 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                      {order.createdAt}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900">
                        {order.customerName}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {order.customerPhone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-700 max-w-[200px] truncate" title={order.itemsSummary}>
                      <span className="font-semibold text-zinc-900">
                        {order.itemsCount}x
                      </span>{" "}
                      {order.itemsSummary}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-zinc-900 whitespace-nowrap">
                      ৳{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="uppercase text-[11px] font-semibold text-zinc-600">
                          {order.paymentMethod}
                        </span>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getPaymentBadge(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    No orders matched your search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 text-xs text-zinc-500">
          <span>
            Showing <strong>{filteredOrders.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{" "}
            <strong>{Math.min(currentPage * pageSize, filteredOrders.length)}</strong> of{" "}
            <strong>{filteredOrders.length}</strong> orders
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Side Drawer for Order Details */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    Order {selectedOrder.orderNumber}
                  </h3>
                  <span className="text-xs text-zinc-500">
                    Placed on {selectedOrder.createdAt}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status & Amount */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Total Amount</span>
                  <span className="text-lg font-bold text-zinc-900">
                    ৳{selectedOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Fulfillment Status</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-semibold border ${getStatusBadge(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Payment</span>
                  <span className="font-semibold text-zinc-800">
                    {selectedOrder.paymentMethod.toUpperCase()} ({selectedOrder.paymentStatus})
                  </span>
                </div>
              </div>

              {/* Customer Snapshot */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Customer & Shipping
                </h4>
                <div className="p-4 rounded-xl border border-zinc-200 space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-400 block">Name</span>
                    <strong className="text-zinc-900 text-sm">
                      {selectedOrder.customerName}
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Phone</span>
                    <span className="font-mono text-zinc-800 font-semibold">
                      {selectedOrder.customerPhone}
                    </span>
                  </div>
                  {selectedOrder.address && (
                    <div>
                      <span className="text-zinc-400 block">Delivery Address</span>
                      <span className="text-zinc-700">
                        {selectedOrder.address}
                        {selectedOrder.city ? `, ${selectedOrder.city}` : ""}
                      </span>
                    </div>
                  )}
                  {selectedOrder.trackingNumber && (
                    <div>
                      <span className="text-zinc-400 block">Tracking ID</span>
                      <span className="font-mono font-bold text-indigo-600">
                        {selectedOrder.trackingNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Ordered Hardware
                </h4>
                <div className="p-4 rounded-xl border border-zinc-200 text-xs text-zinc-700">
                  <p className="font-semibold text-zinc-900">
                    {selectedOrder.itemsSummary}
                  </p>
                  <span className="text-zinc-400 text-[11px] block mt-1">
                    Quantity: {selectedOrder.itemsCount} item(s)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
