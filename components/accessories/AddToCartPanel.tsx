"use client";

import { useCart } from "@/contexts/CartContext";
import { ACCESSORY_PLACEHOLDER, type PublicAccessory } from "@/lib/accessory-types";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AddToCartPanel({ accessory }: { accessory: PublicAccessory }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const max = Math.max(1, Math.min(accessory.stock, 10));

  const add = () => {
    if (!accessory.inStock) return;
    addToCart(
      {
        id: accessory.id,
        name: accessory.name,
        brand: accessory.brand,
        price: accessory.price,
        originalPrice: accessory.originalPrice,
        image: accessory.images[0] || ACCESSORY_PLACEHOLDER,
        condition: accessory.condition,
        color: accessory.color || undefined,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (!accessory.inStock) {
    return (
      <p className="rounded-[var(--radius-md)] bg-surface-3 px-4 py-3 text-small font-medium text-muted-text">
        Currently out of stock. Call us and we will tell you when it is back.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex h-12 items-center rounded-[var(--radius-md)] border border-line">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="flex h-12 w-11 items-center justify-center text-ink-2 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="w-8 text-center text-body font-semibold tabular-nums" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            disabled={qty >= max}
            aria-label="Increase quantity"
            className="flex h-12 w-11 items-center justify-center text-ink-2 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={add}
          className={`inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] px-6 text-body font-semibold text-white shadow-soft transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 ${
            added ? "bg-success" : "bg-brand-red hover:bg-brand-red-hover"
          }`}
        >
          {added ? (
            <>
              <Check className="h-5 w-5" aria-hidden="true" /> Added to cart
            </>
          ) : (
            <>
              <ShoppingBag className="h-5 w-5" aria-hidden="true" /> Add to cart
            </>
          )}
        </button>
      </div>
      {added && (
        <Link
          href="/cart"
          className="inline-block text-small font-semibold text-brand-navy underline underline-offset-4"
        >
          View cart and check out
        </Link>
      )}
    </div>
  );
}
