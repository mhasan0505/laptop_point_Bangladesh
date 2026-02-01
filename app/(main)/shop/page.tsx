"use client";

import { laptopData } from "@/app/data/data";
import RecentlyViewed from "@/components/product/RecentlyViewed";
import FilterSidebar from "@/components/shop/FilterSidebar";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import ProductsCard from "@/components/ui/ProductsCard";
import TrustBadges from "@/components/ui/TrustBadges";
import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

interface Filters {
  priceMin: string;
  priceMax: string;
  brands: string[];
  processors: string[];
  rams: string[];
}

const ShopContent = () => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    priceMin: "",
    priceMax: "",
    brands: [],
    processors: [],
    rams: [],
  });
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search");

  const normalizeBrand = (value?: string) =>
    value
      ?.toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .trim() || "";

  let products = laptopData.laptops || [];

  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    products = products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        (product.brand && product.brand.toLowerCase().includes(query)) ||
        (product.category && product.category.toLowerCase().includes(query)),
    );
  }

  // Apply price filter
  if (filters.priceMin) {
    const minPrice = parseFloat(filters.priceMin);
    products = products.filter((product) => product.price >= minPrice);
  }
  if (filters.priceMax) {
    const maxPrice = parseFloat(filters.priceMax);
    products = products.filter((product) => product.price <= maxPrice);
  }

  // Apply brand filter
  if (filters.brands.length > 0) {
    const normalizedBrands = filters.brands.map((brand) =>
      normalizeBrand(brand),
    );
    products = products.filter((product) => {
      const productBrand = normalizeBrand(product.brand);
      if (productBrand) {
        return normalizedBrands.includes(productBrand);
      }
      const productName = normalizeBrand(product.name);
      return normalizedBrands.some((brand) => productName.includes(brand));
    });
  }

  // Apply processor filter
  if (filters.processors.length > 0) {
    products = products.filter((product) => {
      if (!product.specs?.processor) return false;
      const processor = product.specs.processor.toLowerCase();
      return filters.processors.some((filterProc) => {
        const filterLower = filterProc.toLowerCase();
        if (filterLower.includes("intel core i5")) {
          return processor.includes("core i5") || /\bi5-/.test(processor);
        }
        if (filterLower.includes("intel core i7")) {
          return processor.includes("core i7") || /\bi7-/.test(processor);
        }
        if (filterLower.includes("intel core i9")) {
          return processor.includes("core i9") || /\bi9-/.test(processor);
        }
        if (filterLower.includes("ryzen 5")) {
          return processor.includes("ryzen 5");
        }
        if (filterLower.includes("ryzen 7")) {
          return processor.includes("ryzen 7");
        }
        if (
          filterLower.includes("apple m1") ||
          filterLower.includes("m2") ||
          filterLower.includes("m3")
        ) {
          return (
            processor.includes("apple m1") ||
            processor.includes("apple m2") ||
            processor.includes("apple m3") ||
            /\bm1\b/.test(processor) ||
            /\bm2\b/.test(processor) ||
            /\bm3\b/.test(processor)
          );
        }
        return false;
      });
    });
  }

  // Apply RAM filter
  if (filters.rams.length > 0) {
    products = products.filter((product) => {
      if (!product.specs?.ram) return false;
      const ram = product.specs.ram.toLowerCase();
      return filters.rams.some((filterRam) => {
        const ramValue = filterRam.toLowerCase();
        return ram.includes(ramValue);
      });
    });
  }

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
            <h1 className="text-2xl font-bold text-gray-900">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : "All Products"}
            </h1>
            <span className="text-sm text-gray-500">
              {products.length} Products
            </span>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {products.map((product) => (
                <ProductsCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">
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
