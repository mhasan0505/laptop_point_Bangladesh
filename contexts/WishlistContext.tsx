"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Product } from "@/types/product";
import { createContext, useContext } from "react";

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string | number) => void;
  isInWishlist: (productId: string | number) => boolean;
  getWishlistCount: () => number;
  clearWishlist: () => void;
}

const STORAGE_KEY = "wishlist";

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export const WishlistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [wishlistItems, setWishlistItems] = useLocalStorage<Product[]>(
    STORAGE_KEY,
    [],
  );

  const addToWishlist = (product: Product) => {
    setWishlistItems((prev) => {
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