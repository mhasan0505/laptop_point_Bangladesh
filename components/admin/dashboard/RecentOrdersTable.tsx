"use client";

import Link from "next/link";
import { FileText, Truck, ArrowRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import type { DashboardOrder } from "@/lib/admin-dashboard";

interface RecentOrdersTableProps {
  orders: DashboardOrder[];
  onOpenDocument: (order: DashboardOrder, tab: "invoice" | "challan") => void;
}

export function RecentOrdersTable({
  orders,
  onOpenDocument,
}: RecentOrdersTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 border-b border-border/60">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Recent Orders
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Latest 6 customer purchases with instant document generation
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
        >
          View all orders <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        {orders.length === 0 ? (
          <div className="py-14 text-center text-xs text-muted-foreground">
            <ShoppingCart className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="font-semibold text-foreground">No customer orders yet</p>
            <p className="text-[11px] mt-0.5">Incoming orders will show up here in real time.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                <th className="py-3 px-4 sm:px-6">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {orders.map((order) => {
                const dateDisplay = order.createdAt
                  ? new Intl.DateTimeFormat("en-US", {
                      timeZone: "Asia/Dhaka",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }).format(new Date(order.createdAt))
                  : "Today";

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <td className="py-3 px-4 sm:px-6 font-mono font-bold text-foreground">
                      <Link
                        href={`/admin/orders`}
                        className="hover:text-primary hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-foreground">{order.customerName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {dateDisplay} · {order.paymentMethod}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-bold text-foreground font-mono">
                      ৳{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={order.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onOpenDocument(order, "invoice")}
                          className="h-7 text-[11px] font-semibold px-2.5 rounded-md border-border gap-1 text-primary hover:bg-primary/10"
                          title="Generate Invoice"
                        >
                          <FileText className="h-3 w-3" />
                          Invoice
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onOpenDocument(order, "challan")}
                          className="h-7 text-[11px] font-semibold px-2.5 rounded-md border-border gap-1 text-info hover:bg-info-soft"
                          title="Generate Delivery Challan"
                        >
                          <Truck className="h-3 w-3" />
                          Challan
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
