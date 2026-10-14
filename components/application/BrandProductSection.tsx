"use client";

import SectionHeader from "@/components/home/SectionHeader";
import HomeProductCard from "@/components/home/HomeProductCard";
import type { Product } from "@/types/product";
import { useState } from "react";

interface BrandProductSectionProps {
  brand: string;
  title: string;
  description: string;
  badgeText: string;
  theme?: "hp" | "dell" | "lenovo" | "microsoft" | string;
  initialProducts?: Product[];
}

export default function BrandProductSection({
  brand,
  title,
  description,
  badgeText,
  initialProducts = [],
}: BrandProductSectionProps) {
  const [activeCategory, setActiveCategory] = useState("All Series");

  // Filter for this brand
  const brandProducts = initialProducts.filter(
    (product) => product.brand?.toLowerCase() === brand.toLowerCase()
  );

  if (brandProducts.length === 0) return null;

  // Extract unique categories
  const rawCategories = Array.from(
    new Set(brandProducts.map((p) => p.category || "Standard"))
  ).filter(Boolean);
  const categories = ["All Series", ...rawCategories];

  // Filter products based on selected category, max 4 products
  const filteredProducts =
    activeCategory === "All Series"
      ? brandProducts
      : brandProducts.filter((p) => p.category === activeCategory);

  const displayProducts = filteredProducts.slice(0, 4);

  return (
    <section
      aria-labelledby={`brand-heading-${brand.toLowerCase()}`}
      className="py-12 sm:py-16 lg:py-20 bg-surface border-t border-line/60"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header with "See all {brand}" link */}
        <SectionHeader
          id={`brand-heading-${brand.toLowerCase()}`}
          eyebrow={badgeText || `${brand} Collection`}
          title={title}
          subheading={description}
          viewAllHref={`/shop?brand=${encodeURIComponent(brand)}`}
          viewAllLabel={`See all ${brand}`}
        />

        {/* Minimal Category Tabs (only if multiple categories exist) */}
        {categories.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-caption font-medium transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-navy ${
                    isActive
                      ? "bg-brand-navy text-white shadow-xs"
                      : "bg-surface-2 text-ink-2 hover:bg-surface-3 border border-line"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* 4-up Product Grid (2-up on mobile) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {displayProducts.map((product) => (
            <HomeProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
