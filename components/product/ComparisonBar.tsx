"use client";

import { useComparison } from "@/contexts/ComparisonContext";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const ComparisonBar = () => {
  const { comparisonItems, removeFromComparison, clearComparison } =
    useComparison();

  if (comparisonItems.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-yellow-400 shadow-2xl z-40"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left Side - Title */}
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-gray-900 whitespace-nowrap">
                Compare Products
              </h3>
              <span className="text-sm text-gray-500">
                {comparisonItems.length}/3 selected
              </span>
            </div>

            {/* Middle - Product Items (Scrollable on mobile) */}
            <div className="flex-1 overflow-x-auto">
              <div className="flex items-center gap-3">
                {comparisonItems.map((product) => (
                  <div
                    key={product.id}
                    className="relative shrink-0 w-20 h-20 bg-gray-50 rounded-lg p-2 border border-gray-200"
                  >
                    <button
                      onClick={() => removeFromComparison(product.id)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                      aria-label="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="object-contain w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={clearComparison}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear All
              </button>
              {comparisonItems.length >= 2 && (
                <Link
                  href="/compare"
                  className="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                >
                  Compare Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ComparisonBar;
