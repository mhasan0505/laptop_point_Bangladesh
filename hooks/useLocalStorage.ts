"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * A tiny wrapper around a value that is persisted to localStorage.
 * Loads lazily (client-only) and writes back on every change, mirroring the
 * behaviour previously inlined in each of the cart / wishlist / comparison
 * contexts.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initialValue;
      return JSON.parse(raw) as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable — state still works in memory.
    }
  }, [key, value]);

  // React's state setter is already referentially stable; wrapping it in a
  // useCallback keeps the returned identity stable for consumers that put it
  // in their own memoization dependency arrays.
  const setStoredValue = useCallback(
    (updater: T | ((prev: T) => T)) => setValue(updater),
    [],
  );

  return [value, setStoredValue] as const;
}