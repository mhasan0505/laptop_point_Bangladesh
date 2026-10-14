"use client";

import { createContext, useContext, useEffect, useReducer, useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────
export type CartItem = {
  id: string; // Keyed on `${productId}:${variantId || "default"}`
  productId?: string;
  variantId?: string;
  variantLabel?: string;
  sku?: string;
  slug: string;
  name: string;
  sub: string;
  price: number;
  original: number;
  thumbnail: string;
  qty: number;
  badge: string;
  badgeColor: string;
};

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: "ADD"; item: Omit<CartItem, "qty">; qty: number }
  | { type: "REMOVE"; id: string }
  | { type: "UPDATE_QTY"; id: string; qty: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

// ─── Reducer ───────────────────────────────────────────────────────────────────
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items };

    case "ADD": {
      const existing = state.items.find((i) => i.id === action.item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === action.item.id
              ? { ...i, qty: i.qty + action.qty }
              : i
          ),
        };
      }
      return {
        items: [...state.items, { ...action.item, qty: action.qty }],
      };
    }

    case "REMOVE":
      return { items: state.items.filter((i) => i.id !== action.id) };

    case "UPDATE_QTY":
      if (action.qty <= 0) {
        return { items: state.items.filter((i) => i.id !== action.id) };
      }
      return {
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, qty: action.qty } : i
        ),
      };

    case "CLEAR":
      return { items: [] };

    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────
type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "techdrive_cart";

// ─── Provider ──────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [isOpen, setIsOpen] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", items: parsed });
        }
      }
    } catch {
      // ignore invalid storage
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const itemCount = state.items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addItem = (item: Omit<CartItem, "qty">, qty = 1) => {
    dispatch({ type: "ADD", item, qty });
    setIsOpen(true); // Automatically open the slide-over cart drawer on add
  };

  const removeItem = (id: string) => dispatch({ type: "REMOVE", id });

  const updateQty = (id: string, qty: number) =>
    dispatch({ type: "UPDATE_QTY", id, qty });

  const clearCart = () => dispatch({ type: "CLEAR" });

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemCount,
        subtotal,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
