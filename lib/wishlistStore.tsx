"use client";

import { createContext, useContext, useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type WishlistItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  thumbnail: string;
};

type WishlistContextValue = {
  items: WishlistItem[];
  isWishlisted: (id: string) => boolean;
  toggle: (item: WishlistItem) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "techdrive_wishlist";

// ─── Provider ─────────────────────────────────────────────────────────────────
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WishlistItem[];
        if (Array.isArray(parsed)) {
          queueMicrotask(() => setItems(parsed));
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist on change (skip initial hydration write)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const isWishlisted = (id: string) => items.some((i) => i.id === id);

  const toggle = (item: WishlistItem) => {
    setItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  };

  const clear = () => setItems([]);

  return (
    <WishlistContext.Provider value={{ items, isWishlisted, toggle, clear }}>
      {children}
    </WishlistContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
