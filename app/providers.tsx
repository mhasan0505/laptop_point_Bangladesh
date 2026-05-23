"use client";

import { CartProvider } from "@/contexts/CartContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <ComparisonProvider>{children}</ComparisonProvider>
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}
