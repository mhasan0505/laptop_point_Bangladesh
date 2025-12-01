"use client";

import { useCart } from "@/contexts/CartContext";
import { ArrowRight, Tag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CartSummary() {
  const { getSubtotal, getTax, getShipping, getCartTotal, items } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const subtotal = getSubtotal();
  const tax = getTax();
  const shipping = getShipping();
  const total = getCartTotal();

  const handleApplyCoupon = () => {
    // Placeholder for coupon logic
    if (couponCode.trim()) {
      setCouponApplied(true);
    }
  };

  const FREE_SHIPPING_THRESHOLD = 50000;
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="bg-white dark:bg-card rounded-xl border border-border/30 p-6 sticky top-24">
      <h2 className="text-xl font-bold mb-6">Order Summary</h2>

      {/* Free Shipping Progress */}
      {shipping > 0 && remainingForFreeShipping > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
            Add{" "}
            <span className="font-bold">
              ৳{remainingForFreeShipping.toLocaleString()}
            </span>{" "}
            more for FREE shipping!
          </p>
          <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Coupon Code */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">Coupon Code</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter code"
              className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              disabled={couponApplied}
            />
          </div>
          <button
            onClick={handleApplyCoupon}
            disabled={!couponCode.trim() || couponApplied}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Apply
          </button>
        </div>
        {couponApplied && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            ✓ Coupon applied successfully!
          </p>
        )}
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
      <div className="flex justify-between items-center mb-6">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-2xl font-bold text-primary">
          ৳{total.toLocaleString()}
        </span>
      </div>

      {/* Checkout Button */}
      <Link
        href="/checkout"
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group"
      >
        Proceed to Checkout
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* Continue Shopping */}
      <Link
        href="/"
        className="w-full block text-center mt-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        Continue Shopping
      </Link>

      {/* Security Badge */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Secure Checkout</span>
        </div>
      </div>
    </div>
  );
}
