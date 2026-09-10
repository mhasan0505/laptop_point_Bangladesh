"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { computeOrderTotals } from "@/lib/pricing";
import { CartContextType, CartItem } from "@/types/cart";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>(STORAGE_KEY, []);

  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prevItems) => {
        const existingItem = prevItems.find((i) => i.id === item.id);

        if (existingItem) {
          return prevItems.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i,
          );
        }
        return [...prevItems, { ...item, quantity }];
      });
    },
    [setItems],
  );

  const removeFromCart = useCallback(
    (id: string) => {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    },
    [setItems],
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
        return;
      }
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)),
      );
    },
    [setItems],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, [setItems]);

  const totals = useMemo(() => computeOrderTotals(items), [items]);

  // Stable function identities so context consumers don't re-render in loops.
  const getSubtotal = useCallback(() => totals.subtotal, [totals]);
  const getTax = useCallback(() => totals.tax, [totals]);
  const getShipping = useCallback(() => totals.shipping, [totals]);
  const getCartTotal = useCallback(() => totals.total, [totals]);
  const getCartCount = useCallback(
    () => items.reduce((count, item) => count + item.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextType>(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      getSubtotal,
      getTax,
      getShipping,
    }),
    [
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      getSubtotal,
      getTax,
      getShipping,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
