"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

interface StatusEvent {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
}

interface OrderDetail {
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
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  notes: string | null;
  trackingNumber: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  statusHistory: StatusEvent[];
}

interface OrderDetailDialogProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (orderId: string, newStatus: string) => void;
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

function paymentStatusColor(status: string): string {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "refunded":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Processing":
      return "bg-blue-100 text-blue-800";
    case "Shipped":
      return "bg-purple-100 text-purple-800";
    case "Delivered":
      return "bg-green-100 text-green-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function OrderDetailDialog({
  orderId,
  isOpen,
  onClose,
}: OrderDetailDialogProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !orderId) {
      setOrder(null);
      return;
    }

    async function fetchOrder() {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          setOrder(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch order details", err);
      } finally {
        setLoading(false);
      }
    }

    void fetchOrder();
  }, [isOpen, orderId]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-black">
            {order ? `Order ${order.orderNumber}` : "Order Details"}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
          </div>
        )}

        {!loading && !order && (
          <p className="text-gray-500 text-center py-12">
            {orderId ? "Could not load order details." : "Select an order to view details."}
          </p>
        )}

        {!loading && order && (
          <div className="space-y-6">
            {/* Status Badge + Order Date */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className={`font-medium shadow-none border-0 text-sm px-3 py-1 ${statusColor(order.status)}`}
                >
                  {order.status}
                </Badge>
                <span className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("en-BD", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <span className="text-sm text-gray-400">
                Last updated:{" "}
                {new Date(order.updatedAt).toLocaleDateString("en-BD", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-black mb-3 text-sm uppercase tracking-wider">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Name</span>
                  <p className="font-medium text-black">{order.customerName}</p>
                </div>
                <div>
                  <span className="text-gray-500">Phone</span>
                  <p className="font-medium text-black">{order.customerPhone}</p>
                </div>
                {order.customerEmail && (
                  <div className="sm:col-span-2">
                    <span className="text-gray-500">Email</span>
                    <p className="font-medium text-black">{order.customerEmail}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            {(order.address || order.city || order.district) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-black mb-3 text-sm uppercase tracking-wider">
                  Shipping Address
                </h3>
                <div className="text-sm text-black">
                  <p>{order.address}</p>
                  <p>
                    {[order.city, order.district, order.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-black mb-3 text-sm uppercase tracking-wider">
                Payment Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Method</span>
                  <p className="font-medium text-black">
                    {paymentLabel(order.paymentMethod)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Status</span>
                  <p>
                    <Badge
                      variant="secondary"
                      className={`font-medium shadow-none border-0 ${paymentStatusColor(order.paymentStatus)}`}
                    >
                      {order.paymentStatus.charAt(0).toUpperCase() +
                        order.paymentStatus.slice(1)}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Total Amount</span>
                  <p className="font-bold text-black text-lg">
                    ৳{order.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mt-2">
                <div>
                  <span className="text-gray-500">Subtotal</span>
                  <p className="font-medium text-black">
                    ৳{order.subtotal.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Shipping</span>
                  <p className="font-medium text-black">
                    {order.shippingCost > 0
                      ? `৳${order.shippingCost.toLocaleString()}`
                      : "Free"}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-black mb-2 text-sm uppercase tracking-wider">
                  Notes
                </h3>
                <p className="text-sm text-gray-700">{order.notes}</p>
              </div>
            )}

            {/* Tracking */}
            {order.trackingNumber && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-black mb-2 text-sm uppercase tracking-wider">
                  Tracking Number
                </h3>
                <p className="text-sm font-medium text-black">
                  {order.trackingNumber}
                </p>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-black mb-3 text-sm uppercase tracking-wider">
                Order Items ({order.items.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left font-medium text-gray-500 pb-2">
                        Product
                      </th>
                      <th className="text-left font-medium text-gray-500 pb-2">
                        SKU
                      </th>
                      <th className="text-right font-medium text-gray-500 pb-2">
                        Price
                      </th>
                      <th className="text-right font-medium text-gray-500 pb-2">
                        Qty
                      </th>
                      <th className="text-right font-medium text-gray-500 pb-2">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-2 font-medium text-black">
                          {item.name}
                        </td>
                        <td className="py-2 text-gray-500">{item.sku}</td>
                        <td className="py-2 text-right text-black">
                          ৳{item.unitPrice.toLocaleString()}
                        </td>
                        <td className="py-2 text-right text-black">
                          {item.quantity}
                        </td>
                        <td className="py-2 text-right font-medium text-black">
                          ৳{(item.unitPrice * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Status History */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-black mb-3 text-sm uppercase tracking-wider">
                Status History
              </h3>
              <div className="space-y-3">
                {order.statusHistory.map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="mt-1.5">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${statusColor(event.status)}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="secondary"
                          className={`font-medium shadow-none border-0 text-xs ${statusColor(event.status)}`}
                        >
                          {event.status}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(event.createdAt).toLocaleString("en-BD", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {event.note && (
                        <p className="text-sm text-gray-600 mt-0.5">
                          {event.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-300"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
