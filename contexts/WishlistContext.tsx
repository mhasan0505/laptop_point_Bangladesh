"use client";

import { Product } from "@/types/product";
import { createContext, useContext, useEffect, useState } from "react";

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string | number) => void;
  isInWishlist: (productId: string | number) => boolean;
  getWishlistCount: () => number;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const WishlistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>(() => {
    if (typeof window === "undefined") return [];

    const saved = localStorage.getItem("wishlist");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse wishlist", e);
        return [];
      }
    }
    return [];
  });

  // Persist to localStorage whenever wishlist changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
    }
  }, [wishlistItems]);

  const addToWishlist = (product: Product) => {
    setWishlistItems((prev) => {
      // Check if already in wishlist
      if (prev.some((item) => item.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string | number) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const isInWishlist = (productId: string | number) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getWishlistCount,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};
