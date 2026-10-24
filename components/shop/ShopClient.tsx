"use client";

import RecentlyViewed from "@/components/product/RecentlyViewed";
import FilterSidebar from "@/components/shop/FilterSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import ProductsCard from "@/components/ui/ProductsCard";
import TrustBadges from "@/components/ui/TrustBadges";
import {
  computeFilterFacets,
  EMPTY_FILTERS,
  filterProducts,
  getActiveFilterCount,
  hasActiveFilters,
  ProductFilters,
} from "@/lib/product-filter";
import type { Product } from "@/types/product";
import {
  ArrowDownUp,
  Grid,
  Laptop,
  List,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

interface ShopClientProps {
  initialProducts?: Product[];
  initialParams?: Record<string, string | string[] | undefined>;
}

const ShopContent = ({
  initialProducts = [],
  initialParams,
}: {
  initialProducts?: Product[];
  initialParams?: Record<string, string | string[] | undefined>;
}) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const searchParams = useSearchParams();

  const getParam = (key: string): string | undefined => {
    const fromUrl = searchParams.get(key);
    if (fromUrl !== null) return fromUrl;
    const fromServer = initialParams?.[key];
    if (Array.isArray(fromServer)) return fromServer[0];
    return fromServer;
  };

  const searchQuery =
    getParam("search") ||
    getParam("q") ||
    getParam("query");

  // Initialize filters from URL search params on mount
  const initialFiltersFromUrl = useMemo<ProductFilters>(() => {
    const parseList = (key: string) => {
      const fromUrl = searchParams.get(key);
      if (fromUrl !== null) {
        return fromUrl.split(",").filter(Boolean);
      }
      const fromServer = initialParams?.[key];
      if (Array.isArray(fromServer)) return fromServer.filter(Boolean) as string[];
      if (typeof fromServer === "string") return fromServer.split(",").filter(Boolean);
      return [];
    };

    return {
      priceMin:
        getParam("minPrice") || getParam("priceMin") || "",
      priceMax:
        getParam("maxPrice") || getParam("priceMax") || "",
      availability: parseList("availability"),
      series: parseList("series"),
      brands:
        parseList("brands").length > 0
          ? parseList("brands")
          : parseList("brand"),
      processorTypes: parseList("processorTypes"),
      processorModels: parseList("processorModels"),
      generations: parseList("generations"),
      displaySizes: parseList("displaySizes"),
      displayTypes: parseList("displayTypes"),
      ramSizes:
        parseList("ramSizes").length > 0
          ? parseList("ramSizes")
          : parseList("ram"),
      ramTypes: parseList("ramTypes"),
      ssdSizes:
        parseList("ssdSizes").length > 0
          ? parseList("ssdSizes")
          : parseList("ssd"),
      graphics: parseList("graphics"),
      operatingSystems:
        parseList("os").length > 0
          ? parseList("os")
          : parseList("operatingSystems"),
      categories:
        parseList("categories").length > 0
          ? parseList("categories")
          : parseList("category"),
      specialFeatures: parseList("specialFeatures"),
      sortBy:
        getParam("sort") ||
        getParam("sortBy") ||
        "featured",
    };
  }, [searchParams, initialParams]);

  const [filters, setFilters] = useState<ProductFilters>(initialFiltersFromUrl);

  // Sync to URL query parameters smoothly
  const syncFiltersToUrl = useCallback(
    (newFilters: ProductFilters) => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);

      const setOrDelete = (key: string, val: string | string[] | undefined) => {
        if (Array.isArray(val)) {
          if (val.length > 0) params.set(key, val.join(","));
          else params.delete(key);
        } else if (val) {
          params.set(key, val);
        } else {
          params.delete(key);
        }
      };

      setOrDelete("brands", newFilters.brands);
      setOrDelete("category", newFilters.categories);
      setOrDelete("availability", newFilters.availability);
      setOrDelete("series", newFilters.series);
      setOrDelete("processorTypes", newFilters.processorTypes);
      setOrDelete("processorModels", newFilters.processorModels);
      setOrDelete("generations", newFilters.generations);
      setOrDelete("displaySizes", newFilters.displaySizes);
      setOrDelete("displayTypes", newFilters.displayTypes);
      setOrDelete("ramSizes", newFilters.ramSizes);
      setOrDelete("ramTypes", newFilters.ramTypes);
      setOrDelete("ssdSizes", newFilters.ssdSizes);
      setOrDelete("graphics", newFilters.graphics);
      setOrDelete("os", newFilters.operatingSystems);
      setOrDelete("specialFeatures", newFilters.specialFeatures);
      setOrDelete("minPrice", newFilters.priceMin);
      setOrDelete("maxPrice", newFilters.priceMax);

      if (newFilters.sortBy && newFilters.sortBy !== "featured") {
        params.set("sort", newFilters.sortBy);
      } else {
        params.delete("sort");
      }

      const queryString = params.toString();
      const newUrl = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    },
    [],
  );

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    syncFiltersToUrl(newFilters);
  };

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    syncFiltersToUrl(EMPTY_FILTERS);
  };

  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) {
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setAllProducts(data);
          }
        })
        .catch((err) => console.error("Failed to load products:", err));
    }
  }, [initialProducts]);

  // Compute live faceted counts for all available options
  const facets = useMemo(
    () => computeFilterFacets(allProducts, filters, searchQuery),
    [allProducts, filters, searchQuery],
  );

  // Apply full filtering and sorting
  const filteredProducts = useMemo(
    () => filterProducts(allProducts, filters, searchQuery),
    [allProducts, filters, searchQuery],
  );

  const activeFilterCount = getActiveFilterCount(filters);
  const isFiltered = hasActiveFilters(filters);

  // Build active filter tags list for the chips bar
  const activeTags = useMemo(() => {
    const tags: Array<{ label: string; onRemove: () => void }> = [];

    if (filters.priceMin) {
      tags.push({
        label: `Min: ৳${Number(filters.priceMin).toLocaleString()}`,
        onRemove: () => handleFilterChange({ ...filters, priceMin: "" }),
      });
    }
    if (filters.priceMax) {
      tags.push({
        label: `Max: ৳${Number(filters.priceMax).toLocaleString()}`,
        onRemove: () => handleFilterChange({ ...filters, priceMax: "" }),
      });
    }

    const addList = (
      key: keyof ProductFilters,
      prefix?: string,
    ) => {
      const arr = (filters[key] as string[]) || [];
      arr.forEach((val) => {
        tags.push({
          label: prefix ? `${prefix}: ${val}` : val,
          onRemove: () =>
            handleFilterChange({
              ...filters,
              [key]: arr.filter((item) => item !== val),
            }),
        });
      });
    };

    addList("availability");
    addList("series");
    addList("brands");
    addList("processorTypes");
    addList("processorModels");
    addList("generations");
    addList("displaySizes");
    addList("displayTypes");
    addList("ramSizes", "RAM");
    addList("ramTypes");
    addList("ssdSizes", "SSD");
    addList("graphics");
    addList("operatingSystems", "OS");
    addList("specialFeatures");

    return tags;
  }, [filters]);

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 relative items-start">
        {/* ─── Desktop Sticky Filter Sidebar (w-64 / w-[270px]) ───────── */}
        <aside className="hidden lg:block w-64 xl:w-[270px] shrink-0 sticky top-24 self-start">
          <FilterSidebar
            filters={filters}
            facets={facets}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalMatchingCount={filteredProducts.length}
          />
        </aside>

        {/* ─── Mobile Filter Drawer ───────────────────────────────────── */}
        {isMobileFilterOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity flex"
            onClick={() => setIsMobileFilterOpen(false)}
          >
            <div
              className="bg-card w-[300px] sm:w-[340px] h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border flex items-center justify-between bg-gray-50/80 dark:bg-muted/40">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#002b60]" />
                  <span className="font-bold text-[#002b60] dark:text-foreground text-base">
                    Filter Laptops
                  </span>
                  {activeFilterCount > 0 && (
                    <Badge
                      variant="default"
                      className="text-xs px-2 py-0 bg-[#dc0303] text-white"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <FilterSidebar
                  filters={filters}
                  facets={facets}
                  onFilterChange={handleFilterChange}
                  onResetFilters={handleResetFilters}
                  isMobileDrawer={true}
                  onCloseMobile={() => setIsMobileFilterOpen(false)}
                  totalMatchingCount={filteredProducts.length}
                  className="border-0 rounded-none shadow-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── Main Shop Content & Product Catalog ────────────────────── */}
        <main className="flex-1 w-full min-w-0">
          {/* Top Control Bar / Toolbar */}
          <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg p-4 shadow-2xs mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#002b60] dark:text-foreground tracking-tight">
                  {searchQuery ? `Results for "${searchQuery}"` : "All Laptop"}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {filteredProducts.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {allProducts.length}
                  </span>{" "}
                  items
                </p>
              </div>

              {/* Toolbar Controls (Sort, View Mode, Mobile Filter Toggle) */}
              <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden gap-2 h-9 text-xs font-semibold rounded-md border-gray-300"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#dc0303]" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#dc0303] text-white text-[10px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-muted/40 border border-gray-300 dark:border-border rounded-md px-2.5 py-1.5">
                  <ArrowDownUp className="w-3.5 h-3.5 text-muted-foreground" />
                  <label htmlFor="shop-sort" className="sr-only">
                    Sort laptops by
                  </label>
                  <select
                    id="shop-sort"
                    value={filters.sortBy || "featured"}
                    onChange={(e) =>
                      handleFilterChange({
                        ...filters,
                        sortBy: e.target.value,
                      })
                    }
                    className="bg-transparent text-xs font-medium text-gray-800 dark:text-gray-100 focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="featured">Sort: Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="discount">Highest Discount</option>
                    <option value="name-asc">Model: A to Z</option>
                  </select>
                </div>

                {/* View Mode Toggle (Grid vs List) */}
                <div className="hidden sm:flex items-center bg-gray-50 dark:bg-muted/40 border border-gray-300 dark:border-border rounded-md p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-card text-[#002b60] dark:text-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === "list"
                        ? "bg-white dark:bg-card text-[#002b60] dark:text-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Pills Bar */}
            {isFiltered && activeTags.length > 0 && (
              <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-border flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-medium text-muted-foreground mr-1">
                    Filtered by:
                  </span>
                  {activeTags.map((tag) => (
                    <span
                      key={tag.label}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-300"
                    >
                      {tag.label}
                      <button
                        onClick={tag.onRemove}
                        className="hover:opacity-75 ml-0.5 cursor-pointer"
                        title="Remove filter"
                        aria-label={`Remove filter ${tag.label}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-xs h-7 px-2 text-[#dc0303] hover:bg-red-50 font-semibold gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {/* Product Grid or List View */}
          {filteredProducts.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 justify-items-center">
                {filteredProducts.map((product) => (
                  <ProductsCard
                    key={product.sku || product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.sku || product.id}
                    className="w-full flex flex-col sm:flex-row bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg p-4 gap-4 items-center hover:border-[#dc0303]/40 transition-colors shadow-2xs"
                  >
                    <div className="w-full sm:w-44 h-40 relative shrink-0 rounded-md overflow-hidden bg-gray-50 dark:bg-muted/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          typeof product.image === "string"
                            ? product.image
                            : (product.image as any)?.src || "/Hero_Image.png"
                        }
                        alt={product.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#002b60] border border-blue-100">
                          {product.brand}
                        </span>
                        {product.grade && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-muted text-gray-700 dark:text-gray-300">
                            Grade: {product.grade}
                          </span>
                        )}
                        {product.specs?.touchscreen && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            Touchscreen
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-foreground text-sm sm:text-base hover:text-[#dc0303] transition-colors line-clamp-2">
                        <a href={`/product/${product.slug}`}>{product.name}</a>
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium text-gray-800 dark:text-gray-200 block">
                            Processor
                          </span>
                          <span className="truncate block">
                            {product.specs?.processor || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-800 dark:text-gray-200 block">
                            RAM
                          </span>
                          <span>{product.specs?.ram || "N/A"}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-800 dark:text-gray-200 block">
                            Storage
                          </span>
                          <span>{product.specs?.storage || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-border">
                      <div className="text-left sm:text-right">
                        <span className="text-lg font-bold text-[#dc0303] font-mono block">
                          ৳{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <span className="text-xs text-muted-foreground line-through font-mono">
                              ৳{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                      </div>
                      <a
                        href={`/product/${product.slug}`}
                        className="px-4 py-2 text-xs font-semibold rounded bg-[#002b60] text-white hover:bg-[#002047] transition-colors"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-16 px-4 bg-white dark:bg-card border border-dashed border-gray-300 dark:border-border rounded-xl">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-muted text-gray-400 flex items-center justify-center mx-auto mb-4">
                <Laptop className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-foreground">
                No Laptops Found
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
                No laptops match your selected filters. Try widening your price
                range or unchecking some filter options.
              </p>
              <Button
                variant="default"
                onClick={handleResetFilters}
                className="gap-2 bg-[#dc0303] hover:bg-[#b80202] text-white rounded-md"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All Filters
              </Button>
            </div>
          )}
        </main>
      </div>

      <RecentlyViewed />
    </>
  );
};

export default function ShopClient({
  initialProducts = [],
  initialParams,
}: ShopClientProps) {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Trust Badges */}
      <TrustBadges variant="row" />

      <Suspense
        fallback={
          <div className="min-h-100 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <ShopContent initialProducts={initialProducts} initialParams={initialParams} />
      </Suspense>
    </div>
  );
}
