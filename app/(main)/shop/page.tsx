"use client";

import { laptopData } from "@/app/data/data";
import RecentlyViewed from "@/components/product/RecentlyViewed";
import FilterSidebar from "@/components/shop/FilterSidebar";
import { Button } from "@/components/ui/button";
import ProductsCard from "@/components/ui/ProductsCard";
import TrustBadges from "@/components/ui/TrustBadges";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export default function ShopPage() {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const products = laptopData.laptops || [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Trust Badges - Top for reassurance */}
      <TrustBadges variant="row" />

      <div className="flex flex-col lg:flex-row gap-8 relative">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex justify-end">
          <Button
            variant="outline"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Sidebar (Desktop) / Mobile Drawer Overlay */}
        <aside
          className={`
            fixed inset-0 z-40 bg-black/50 lg:static lg:bg-transparent lg:z-auto transition-opacity
            ${
              isMobileFilterOpen
                ? "opacity-100 visible"
                : "opacity-0 invisible lg:opacity-100 lg:visible"
            }
        `}
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div
            className={`
                    bg-white w-[280px] h-full lg:h-auto lg:w-auto p-4 lg:p-0 overflow-y-auto lg:overflow-visible transition-transform duration-300
                    ${
                      isMobileFilterOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                    }
                `}
            onClick={(e) => e.stopPropagation()}
          >
            <FilterSidebar />
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
            <span className="text-sm text-gray-500">
              {products.length} Products
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {products.map((product) => (
              <ProductsCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>

      {/* Recently Viewed */}
      <RecentlyViewed />
    </div>
  );
}
