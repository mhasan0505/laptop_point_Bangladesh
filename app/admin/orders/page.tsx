"use client";

import { OrderCreateDialog } from "@/components/admin/OrderCreateDialog";
import { OrderDocumentDialog } from "@/components/admin/OrderDocumentDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminProduct, OrderData } from "@/lib/admin-data";
import { fetchAdminProducts } from "@/lib/admin-products-api";
import {
  ArrowUpDown,
  Check,
  Copy,
  Download,
  Eye,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Truck,
} from "lucide-react";
import { useCallback, useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

const STATUS_TABS = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

type OrderRow = OrderData & { dbId: string };

type VariantOption = {
  name?: string;
  price?: number;
  originalPrice?: number;
  sku?: string;
};

type ApiOrderItem = {
  id: string;
  productId: string;
  variantId?: string;
  variantLabel?: string;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  variantOptions?: VariantOption[];
};

type ApiOrderStatusEvent = {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
};

function paymentLabel(method?: string | null): string {
  const normalized = (method ?? "cod").toLowerCase();
  const map: Record<string, string> = {
    cod: "Cash on Delivery",
    bkash: "bKash",
    nagad: "Nagad",
    card: "Card",
    bank_transfer: "Bank Transfer",
  };
  return map[normalized] ?? (method ?? "Cash on Delivery");
}

interface ApiOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  postalCode: string | null;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  status: string;
  paymentMethod?: string | null;
  notes: string | null;
  createdAt: string;
  items: ApiOrderItem[];
  statusHistory?: ApiOrderStatusEvent[];
}

type DetailedOrderRow = OrderRow & {
  totalAmount: number;
  customerPhone: string;
  customerEmail: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  postalCode: string | null;
  subtotal: number;
  shippingCost: number;
  createdAt: string;
  notes: string | null;
  items: ApiOrderItem[];
  statusHistory: ApiOrderStatusEvent[];
};

function mapApiOrder(o: ApiOrder): DetailedOrderRow {
  return {
    dbId: o.id,
    id: o.orderNumber,
    customer: o.customerName,
    amount: `৳${o.totalAmount.toLocaleString()}`,
    status: o.status,
    date: o.createdAt ? o.createdAt.slice(0, 10) : "Today",
    paymentMethod: paymentLabel(o.paymentMethod ?? "cod"),
    totalAmount: o.totalAmount,
    customerPhone: o.customerPhone,
    customerEmail: o.customerEmail,
    address: o.address,
    city: o.city,
    district: o.district,
    postalCode: o.postalCode,
    subtotal: o.subtotal,
    shippingCost: o.shippingCost,
    createdAt: o.createdAt,
    notes: o.notes,
    items: o.items || [],
    statusHistory: o.statusHistory || [],
  };
}

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const paramStatus = searchParams?.get("status");
  const paramSearch = searchParams?.get("search") || searchParams?.get("q") || "";

  const initialStatus = useMemo(() => {
    if (!paramStatus) return "All";
    const found = STATUS_TABS.find((t) => t.toLowerCase() === paramStatus.trim().toLowerCase());
    return found || "All";
  }, [paramStatus]);

  const [orders, setOrders] = useState<DetailedOrderRow[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState(paramSearch);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc" | "customer_asc">("date_desc");
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DetailedOrderRow | null>(null);
  const [docOrder, setDocOrder] = useState<DetailedOrderRow | null>(null);
  const [docTab, setDocTab] = useState<"invoice" | "challan">("invoice");
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { success: showToast, error: showErrorToast } = useToast();

  useEffect(() => {
    if (paramStatus) {
      const found = STATUS_TABS.find((t) => t.toLowerCase() === paramStatus.trim().toLowerCase());
      if (found) {
        setStatusFilter(found);
      }
    }
  }, [paramStatus]);

  useEffect(() => {
    if (paramSearch) {
      setSearchQuery(paramSearch);
    }
  }, [paramSearch]);

  const openDocument = (order: DetailedOrderRow, tab: "invoice" | "challan" = "invoice") => {
    setDocOrder(order);
    setDocTab(tab);
    setDocDialogOpen(true);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsData] = await Promise.all([
        fetch("/api/orders", { cache: "no-store" }),
        fetchAdminProducts(),
      ]);

      if (ordersRes.ok) {
        const data = (await ordersRes.json()) as ApiOrder[];
        setOrders(data.map(mapApiOrder));
      }
      setProducts(productsData);
    } catch (err) {
      console.error("Failed to load orders:", err);
      showErrorToast("Could not load latest orders data.");
    } finally {
      setIsLoading(false);
    }
  }, [showErrorToast]);

  useEffect(() => {
    let ignore = false;
    const fetchInitial = async () => {
      try {
        const [ordersRes, productsData] = await Promise.all([
          fetch("/api/orders", { cache: "no-store" }),
          fetchAdminProducts(),
        ]);
        if (ordersRes.ok && !ignore) {
          const data = (await ordersRes.json()) as ApiOrder[];
          setOrders(data.map(mapApiOrder));
        }
        if (!ignore) {
          setProducts(productsData);
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
        showErrorToast("Could not load latest orders data.");
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };
    fetchInitial();
    return () => {
      ignore = true;
    };
  }, [showErrorToast]);

  const handleStatusChange = async (order: DetailedOrderRow, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${order.dbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      setOrders((prev) =>
        prev.map((o) => (o.dbId === order.dbId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.dbId === order.dbId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`Order #${order.id} updated to ${newStatus}`);
    } catch {
      showErrorToast("Could not update order status.");
    }
  };

  const filteredOrders = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const result = orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.customerPhone.toLowerCase().includes(query) ||
        (order.customerEmail?.toLowerCase() || "").includes(query) ||
        (order.city?.toLowerCase() || "").includes(query) ||
        (order.address?.toLowerCase() || "").includes(query) ||
        (order.notes?.toLowerCase() || "").includes(query) ||
        order.items.some(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.sku.toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "All" ||
        order.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    return result.sort((a, b) => {
      if (sortBy === "date_desc") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === "date_asc") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === "amount_desc") {
        return b.totalAmount - a.totalAmount;
      }
      if (sortBy === "amount_asc") {
        return a.totalAmount - b.totalAmount;
      }
      if (sortBy === "customer_asc") {
        return a.customer.localeCompare(b.customer);
      }
      return 0;
    });
  }, [orders, searchQuery, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status.toLowerCase() === "pending").length;
    const processing = orders.filter((o) => o.status.toLowerCase() === "processing").length;
    const shipped = orders.filter((o) => o.status.toLowerCase() === "shipped").length;
    const delivered = orders.filter((o) => o.status.toLowerCase() === "delivered").length;
    const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return { total, pending, processing, shipped, delivered, revenue };
  }, [orders]);

  const exportOrdersCSV = () => {
    if (orders.length === 0) {
      showErrorToast("No orders available to export.");
      return;
    }

    const headers = [
      "Order Number",
      "Customer Name",
      "Phone",
      "Email",
      "Address",
      "City",
      "Payment Method",
      "Total (BDT)",
      "Status",
      "Date",
      "Items Count",
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.id}"`,
      `"${o.customer.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.customerEmail || ""}"`,
      `"${(o.address || "").replace(/"/g, '""')}"`,
      `"${o.city || ""}"`,
      `"${o.paymentMethod}"`,
      o.totalAmount,
      `"${o.status}"`,
      `"${o.date}"`,
      o.items.length,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `blg-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Orders manifest exported successfully!");
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "pending":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      case "processing":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
      case "shipped":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20";
      case "delivered":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      case "cancelled":
      case "canceled":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border border-border";
    }
  };

  // STATUS_TABS is declared at module scope

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Fulfillment & Dispatch
            </p>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Orders & Delivery Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Process incoming orders, track courier statuses, print shipping invoices, and manage customer dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadData();
              showToast("Orders refreshed");
            }}
            className="h-9 text-xs font-semibold rounded-sm border-border gap-1.5"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportOrdersCSV}
            className="h-9 text-xs font-semibold rounded-sm border-border gap-1.5"
            title="Export filtered orders to CSV"
          >
            <Download size={13} />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="h-9 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-sm gap-1.5 shadow-xs"
          >
            <Plus size={14} />
            Create Manual Order
          </Button>
        </div>
      </div>

      {/* Mini KPI summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Orders</p>
          <p className="text-lg font-bold text-foreground mt-1">{stats.total}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending</p>
          <p className="text-lg font-bold text-foreground mt-1">{stats.pending}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Processing</p>
          <p className="text-lg font-bold text-foreground mt-1">{stats.processing}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Delivered</p>
          <p className="text-lg font-bold text-foreground mt-1">{stats.delivered}</p>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-md border border-border bg-card p-3.5 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Revenue</p>
          <p className="text-lg font-bold text-foreground mt-1">৳{stats.revenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Status Filter Tabs, Search & Sort Bar */}
      <div className="space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-clean">
          {STATUS_TABS.map((tab) => {
            const count =
              tab === "All"
                ? orders.length
                : orders.filter((o) => o.status.toLowerCase() === tab.toLowerCase()).length;
            const isSelected = statusFilter === tab;

            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  isSelected
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs"
                    : "bg-card text-muted-foreground border-border hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:text-foreground"
                }`}
              >
                {tab}
                <span
                  className={`text-[10px] rounded-xs px-1.5 py-0.2 ${
                    isSelected
                      ? "bg-white/20 dark:bg-black/20 text-white dark:text-black font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders by Order #, Customer, Phone, City, Notes, or Model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-sm border border-border bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-card border border-border rounded-sm px-2 h-9">
              <ArrowUpDown size={13} className="text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date_desc" | "date_asc" | "amount_desc" | "amount_asc" | "customer_asc")}
                className="text-xs bg-transparent text-foreground font-semibold focus:outline-none"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="amount_desc">Highest Amount</option>
                <option value="amount_asc">Lowest Amount</option>
                <option value="customer_asc">Customer (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-md border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No orders found matching your search.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer & Location</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.dbId}
                    className="hover:bg-zinc-100 dark:hover:bg-zinc-850/60 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <span>{order.id}</span>
                        <button
                          onClick={() => copyToClipboard(order.id, order.id)}
                          className="text-muted-foreground hover:text-foreground"
                          title="Copy Order ID"
                        >
                          {copiedId === order.id ? (
                            <Check size={11} className="text-emerald-500" />
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-foreground">{order.customer}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="flex items-center gap-0.5 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Call Customer"
                        >
                          <Phone size={10} /> {order.customerPhone}
                        </a>
                        {order.city && (
                          <span className="flex items-center gap-0.5">
                            <MapPin size={10} /> {order.city}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground font-medium">
                      {order.date}
                    </td>

                    <td className="py-3 px-4 font-bold text-foreground">
                      {order.amount}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-foreground">
                        {order.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDocument(order, "invoice")}
                          className="h-7 text-xs font-semibold px-2 rounded-xs border-border gap-1 text-blue-600 hover:text-blue-500 hover:bg-blue-500/10 dark:text-blue-400"
                          title="View / Print Invoice"
                        >
                          <FileText size={12} />
                          Invoice
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDocument(order, "challan")}
                          className="h-7 text-xs font-semibold px-2 rounded-xs border-border gap-1 text-purple-600 hover:text-purple-500 hover:bg-purple-500/10 dark:text-purple-400"
                          title="View / Print Delivery Challan"
                        >
                          <Truck size={12} />
                          Challan
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                          className="h-7 text-xs font-semibold px-2 rounded-xs border-border gap-1"
                          title="View Order Details"
                        >
                          <Eye size={12} />
                          Details
                        </Button>

                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order, e.target.value)}
                          className="h-7 rounded-xs border border-border bg-background px-1.5 text-[11px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Manual Order Creation Dialog */}
      <OrderCreateDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        products={products.map((p) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          price: p.price,
          stock: p.stock,
          variants: p.variants,
        }))}
        onSuccess={loadData}
      />

      {/* Detailed Order View Modal */}
      <Dialog
        open={Boolean(selectedOrder)}
        onOpenChange={(open: boolean) => {
          if (!open) setSelectedOrder(null);
        }}
      >
        <DialogContent className="max-w-2xl bg-card border-border max-h-[85vh] overflow-y-auto scrollbar-clean">
          {selectedOrder && (
            <div className="space-y-5">
              <DialogHeader className="border-b border-border pb-3">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-base font-bold text-foreground">
                    Order Details #{selectedOrder.id}
                  </DialogTitle>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-xs text-[10px] font-bold ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
              </DialogHeader>

              {/* Fulfillment Documents Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-md bg-muted/40 border border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <FileText size={14} className="text-blue-500" />
                  <span>Generate official fulfillment documents:</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => openDocument(selectedOrder, "invoice")}
                    className="h-7.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold gap-1.5 shadow-xs"
                  >
                    <Printer size={13} />
                    Print Invoice
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDocument(selectedOrder, "challan")}
                    className="h-7.5 border-border text-xs font-semibold gap-1.5 hover:bg-muted"
                  >
                    <Truck size={13} />
                    Print Challan
                  </Button>
                </div>
              </div>

              {/* Customer & Shipping Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-md border border-border bg-background/60 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-foreground uppercase tracking-wider text-[10px]">
                      Customer Info
                    </p>
                    <button
                      onClick={() => copyToClipboard(`${selectedOrder.customer} - ${selectedOrder.customerPhone}`, "customer")}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Copy Info
                    </button>
                  </div>
                  <p className="font-semibold text-foreground">{selectedOrder.customer}</p>
                  <p className="text-muted-foreground flex items-center gap-1.5">
                    <Phone size={11} />
                    <a href={`tel:${selectedOrder.customerPhone}`} className="hover:underline">
                      {selectedOrder.customerPhone}
                    </a>
                  </p>
                  {selectedOrder.customerEmail && (
                    <p className="text-muted-foreground flex items-center gap-1.5">
                      <Mail size={11} />
                      <a href={`mailto:${selectedOrder.customerEmail}`} className="hover:underline">
                        {selectedOrder.customerEmail}
                      </a>
                    </p>
                  )}
                </div>

                <div className="rounded-md border border-border bg-background/60 p-3 space-y-1.5">
                  <p className="font-bold text-foreground uppercase tracking-wider text-[10px]">
                    Delivery Destination
                  </p>
                  <p className="text-foreground">{selectedOrder.address || "Standard Delivery"}</p>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin size={11} />
                    {[selectedOrder.city, selectedOrder.district, selectedOrder.postalCode]
                      .filter(Boolean)
                      .join(", ") || "Dhaka, Bangladesh"}
                  </p>
                </div>
              </div>

              {/* Order Line Items */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Purchased Items ({selectedOrder.items.length})
                </p>
                <div className="rounded-md border border-border divide-y divide-border overflow-hidden">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 text-xs">
                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          SKU: {item.sku} · Qty: {item.quantity} × ৳{item.unitPrice.toLocaleString()}
                        </p>
                        {(item.variantLabel || (item.variantOptions && item.variantOptions.length > 0)) && (
                          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                            Variant: {item.variantLabel || item.variantOptions?.map((v) => v.name).filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                      <p className="font-bold text-foreground">
                        ৳{(item.unitPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="rounded-md border border-border bg-background/60 p-3 space-y-1 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>৳{selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Cost</span>
                  <span>
                    {selectedOrder.shippingCost === 0 ? "FREE" : `৳${selectedOrder.shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-foreground border-t border-border pt-1.5 text-sm">
                  <span>Total Amount</span>
                  <span>৳{selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="rounded-md border border-border p-3 text-xs">
                  <p className="font-bold text-foreground text-[10px] uppercase">Customer Notes</p>
                  <p className="text-muted-foreground mt-0.5">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Status History & Audit Trail */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Status History & Audit Trail
                  </p>
                  <div className="rounded-md border border-border bg-background/60 p-3 space-y-2 text-xs">
                    {selectedOrder.statusHistory.map((hist, i) => (
                      <div key={hist.id || i} className="flex items-start justify-between border-b border-border/50 pb-1.5 last:border-0 last:pb-0">
                        <div>
                          <span className="font-semibold text-foreground">{hist.status}</span>
                          {hist.note && <p className="text-[11px] text-muted-foreground">{hist.note}</p>}
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                          {hist.createdAt ? new Date(hist.createdAt).toLocaleString("en-GB") : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice & Challan Document Dialog */}
      <OrderDocumentDialog
        isOpen={docDialogOpen}
        onClose={() => setDocDialogOpen(false)}
        order={docOrder}
        initialTab={docTab}
      />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading orders console...</div>}>
      <OrdersPageContent />
    </Suspense>
  );
}
