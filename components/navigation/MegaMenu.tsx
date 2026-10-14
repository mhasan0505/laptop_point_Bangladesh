"use client";

import type { MegaMenuFeaturedProduct } from "@/lib/public-content";
import { isCategoryHrefAvailable } from "@/lib/nav-filter";
import { motion } from "framer-motion";
import { ChevronRight, Laptop } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  featuredProducts?: Record<string, MegaMenuFeaturedProduct[]>;
}

const MegaMenu = ({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
  featuredProducts,
}: MegaMenuProps) => {
  // Get unique categories from laptop data matching sitemap, hiding any with 0 products
  const categories = [
    { name: "Workstations", cat: "Workstation", icon: "💼" },
    { name: "Ultrabooks", cat: "Ultrabook", icon: "🎯" },
    { name: "Convertibles", cat: "Convertible 2-in-1", icon: "🔄" },
    { name: "Laptops", cat: "Laptop", icon: "💻" },
  ].filter((c) => isCategoryHrefAvailable(`/shop?category=${encodeURIComponent(c.cat)}`));

  const [hoveredCategory, setHoveredCategory] = useState<string>(
    categories[0]?.cat ?? "Workstation"
  );

  // Get featured products for each category
  const getFeaturedProducts = (category: string) => {
    return featuredProducts?.[category] || [];
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        style={{ top: "140px" }}
      />

      {/* MegaMenu Panel */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute left-0 right-0 top-full mt-1 bg-white shadow-2xl border-t border-gray-100 z-50"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Categories List */}
            <div className="col-span-3 border-r border-gray-100 pr-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Browse by Category
              </h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <div
                    key={category.cat}
                    onMouseEnter={() => setHoveredCategory(category.cat)}
                    onMouseLeave={() => setHoveredCategory(categories[0]?.cat ?? "Workstation")}
                  >
                    <Link
                      href={`/shop?category=${encodeURIComponent(category.cat)}`}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all group ${
                        hoveredCategory === category.cat
                          ? "bg-[#002b60]/10 text-[#002b60] font-semibold"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          hoveredCategory === category.cat
                            ? "translate-x-1 text-[#002b60]"
                            : "text-gray-400"
                        }`}
                      />
                    </Link>
                  </div>
                ))}
              </div>

              {/* View All Link */}
              <Link
                href="/shop"
                onClick={onClose}
                className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#002b60] hover:text-[#dc0303] transition-colors"
              >
                <Laptop className="w-4 h-4" />
                View All Products
              </Link>
            </div>

            {/* Featured Products */}
            <div className="col-span-9">
              {hoveredCategory ? (
                <motion.div
                  key={hoveredCategory}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">
                      {categories.find((c) => c.cat === hoveredCategory)?.name ?? hoveredCategory} Laptops
                    </h3>
                    <Link
                      href={`/shop?category=${encodeURIComponent(hoveredCategory)}`}
                      onClick={onClose}
                      className="text-sm font-medium text-[#002b60] hover:text-[#dc0303] flex items-center gap-1"
                    >
                      See All
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {getFeaturedProducts(hoveredCategory).map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={onClose}
                        className="group bg-white border border-gray-100 rounded-xl p-4 hover:shadow-lg hover:border-[#002b60]/20 transition-all"
                      >
                        <div className="aspect-square relative mb-3 bg-gray-50 rounded-lg overflow-hidden">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-[#002b60] transition-colors">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            ৳{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ৳{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {product.discount && (
                          <div className="mt-2">
                            <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                              {product.discount}% OFF
                            </span>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Laptop className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">
                      Hover over a category to see products
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default MegaMenu;
