"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Product } from "@/types/product";
import { createContext, useContext } from "react";

interface ComparisonContextType {
  comparisonItems: Product[];
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string | number) => void;
  isInComparison: (productId: string | number) => boolean;
  getComparisonCount: () => number;
  clearComparison: () => void;
  canAddMore: () => boolean;
}

const MAX_COMPARISON_ITEMS = 3;
const STORAGE_KEY = "comparison";

const ComparisonContext = createContext<ComparisonContextType | undefined>(
  undefined,
);

export const ComparisonProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [comparisonItems, setComparisonItems] = useLocalStorage<Product[]>(
    STORAGE_KEY,
    [],
  );

  const addToComparison = (product: Product) => {
    setComparisonItems((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev;
      }
      if (prev.length >= MAX_COMPARISON_ITEMS) {
        console.warn(
          `Maximum ${MAX_COMPARISON_ITEMS} products can be compared`,
        );
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromComparison = (productId: string | number) => {
    setComparisonItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const isInComparison = (productId: string | number) => {
    return comparisonItems.some((item) => item.id === productId);
  };

  const getComparisonCount = () => {
    return comparisonItems.length;
  };

  const clearComparison = () => {
    setComparisonItems([]);
  };

  const canAddMore = () => {
    return comparisonItems.length < MAX_COMPARISON_ITEMS;
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparisonItems,
        addToComparison,
        removeFromComparison,
        isInComparison,
        getComparisonCount,
        clearComparison,
        canAddMore,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within ComparisonProvider");
  }
  return context;
};