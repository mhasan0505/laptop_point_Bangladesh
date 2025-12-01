"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";

export default function OrderSummary() {
  const { items, getSubtotal, getTax, getShipping, getCartTotal } = useCart();

  const subtotal = getSubtotal();
  const tax = getTax();
  const shipping = getShipping();
  const total = getCartTotal();

  return (
    <div className="bg-white dark:bg-card rounded-xl border border-border/30 p-6 sticky top-24">
      <h2 className="text-xl font-bold mb-6">Order Summary</h2>

      {/* Cart Items */}
      <div className="space-y-3 mb-6 pb-6 border-b border-border max-h-64 overflow-y-auto">
        {items.map((item) => {
          const imageUrl =
            typeof item.image === "string"
              ? item.image
              : (item.image as { src: string }).src;
          return (
            <div key={item.id} className="flex gap-3">
              <div className="relative w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={imageUrl}
                  alt={item.name}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium line-clamp-2 mb-1">
                  {item.name}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </span>
                  <span className="text-sm font-semibold">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6 pb-6 border-b border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({items.length} items)
          </span>
          <span className="font-medium">৳{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (5%)</span>
          <span className="font-medium">৳{tax.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          {shipping === 0 ? (
            <span className="font-medium text-green-600 dark:text-green-400">
              FREE
            </span>
          ) : (
            <span className="font-medium">৳{shipping.toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-2xl font-bold text-primary">
          ৳{total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
