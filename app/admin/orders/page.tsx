"use client";

import { OrderCreateDialog } from "@/components/admin/OrderCreateDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminProduct, OrderData } from "@/lib/admin-data";
import { fetchProducts } from "@/lib/sanity-admin";
import { Plus, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Extends OrderData with the database cuid for API calls
type OrderRow = OrderData & { dbId: string };

function paymentLabel(method: string): string {
  const map: Record<string, string> = {
    cod: "Cash on Delivery",
    bkash: "bKash",
    nagad: "Nagad",
    card: "Card",
  };
  return map[method] ?? method;
}

interface ApiOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

function mapApiOrder(o: ApiOrder): OrderRow {
  return {
    dbId: o.id,
    id: o.orderNumber,
    customer: o.customerName,
    amount: `৳${o.totalAmount.toLocaleString()}`,
    status: o.status,
    date: o.createdAt.slice(0, 10),
    paymentMethod: paymentLabel(o.paymentMethod),
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsData] = await Promise.all([
        fetch("/api/orders"),
        fetchProducts(),
      ]);
      if (ordersRes.ok) {
        const apiOrders = (await ordersRes.json()) as ApiOrder[];
        setOrders(apiOrders.map(mapApiOrder));
      }
      setProducts(productsData.filter((p) => p.stock > 0));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "Processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "Shipped":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "Delivered":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const handleStatusChange = async (order: OrderRow, newStatus: string) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) =>
        o.dbId === order.dbId ? { ...o, status: newStatus } : o,
      ),
    );
    try {
      await fetch(`/api/orders/${order.dbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Roll back on failure
      setOrders((prev) =>
        prev.map((o) =>
          o.dbId === order.dbId ? { ...o, status: order.status } : o,
        ),
      );
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black mb-2">
            Orders & Delivery
          </h1>
          <p className="text-gray-600">
            Manage your store&apos;s orders, track deliveries, and update
            statuses.
          </p>
        </div>
        <Button
          className="bg-black hover:bg-gray-800 text-white"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Order
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
        </div>
      ) : (
        <Card className="border-0 shadow-sm pt-6 rounded-lg bg-white">
          <div className="px-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search by Order ID or Customer..."
                className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Filter:</span>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-45 bg-gray-50 border-gray-200 focus:ring-black">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-900 border-b-0 pl-6 h-12">
                    Order ID
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 border-b-0 h-12">
                    Customer
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 border-b-0 h-12">
                    Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 border-b-0 h-12">
                    Amount
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 border-b-0 h-12">
                    Payment
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 border-b-0 h-12">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 border-b-0 text-right pr-6 h-12">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-black pl-6 py-4">
                        {order.id}
                      </TableCell>
                      <TableCell className="text-gray-600 py-4">
                        {order.customer}
                      </TableCell>
                      <TableCell className="text-gray-600 py-4">
                        {order.date}
                      </TableCell>
                      <TableCell className="font-medium text-black py-4">
                        {order.amount}
                      </TableCell>
                      <TableCell className="text-gray-600 py-4">
                        {order.paymentMethod}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="secondary"
                          className={`font-medium shadow-none border-0 ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            handleStatusChange(order, value)
                          }
                        >
                          <SelectTrigger className="w-32.5 ml-auto h-8 text-xs bg-white border-gray-200">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent align="end">
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Processing">
                              Processing
                            </SelectItem>
                            <SelectItem value="Shipped">Shipped</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Canceled">Canceled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-gray-500 font-medium"
                    >
                      No orders found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <OrderCreateDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
        }))}
        onSuccess={loadData}
      />
    </div>
  );
}
