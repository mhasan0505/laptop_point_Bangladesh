"use client";

import { laptopData } from "@/app/data/data";
import RecentlyViewed from "@/components/product/RecentlyViewed";
import FilterSidebar from "@/components/shop/FilterSidebar";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import ProductsCard from "@/components/ui/ProductsCard";
import TrustBadges from "@/components/ui/TrustBadges";
import {
  EMPTY_FILTERS,
  filterProducts,
  ProductFilters,
} from "@/lib/product-filter";
import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const ShopContent = () => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>(EMPTY_FILTERS);
  const searchParams = useSearchParams();
  const searchQuery =
    searchParams.get("search") ||
    searchParams.get("q") ||
    searchParams.get("query");

  let products = [...(laptopData.laptops || [])].sort(
    (a, b) => Number(b.id) - Number(a.id),
  );

  products = filterProducts(products, filters, searchQuery);

  return (
    <>
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
            <FilterSidebar onFilterChange={setFilters} />
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : "All Products"}
            </h1>
            <span className="text-sm text-muted-foreground">
              {products.length} Products
            </span>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {products.map((product) => (
                <ProductsCard key={product.sku || product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No products found matching your search.
              </p>
              <Button
                variant="link"
                onClick={() => (window.location.href = "/shop")}
                className="mt-2 text-primary"
              >
                Clear Search
              </Button>
            </div>
          )}
        </main>
      </div>

      <RecentlyViewed />
    </>
  );
};

export default function ShopPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Trust Badges - Top for reassurance */}
      <TrustBadges variant="row" />

      <Suspense
        fallback={
          <div className="min-h-[400px] flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <ShopContent />
      </Suspense>
    </div>
  );
}
