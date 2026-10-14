"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecentlyViewedItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  thumbnail: string;
};

const STORAGE_KEY = "techdrive_recently_viewed";
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentlyViewedItem[];
        if (Array.isArray(parsed)) {
          queueMicrotask(() => setItems(parsed));
        }
      }
    } catch {
      // ignore
    }
    hydrated.current = true;
  }, []);

  const trackView = useCallback((item: RecentlyViewedItem) => {
    setItems((prev) => {
      if (prev.length > 0 && prev[0].id === item.id) {
        return prev;
      }
      const filtered = prev.filter((i) => i.id !== item.id);
      const updated = [item, ...filtered].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  return { items, trackView };
}
