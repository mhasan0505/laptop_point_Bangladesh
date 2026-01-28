"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Filters {
  priceMin: string;
  priceMax: string;
  brands: string[];
  processors: string[];
  rams: string[];
}

interface FilterSidebarProps {
  onFilterChange: (filters: Filters) => void;
}

export default function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState({
    price: true,
    brand: true,
    processor: true,
    ram: true,
  });

  const [filters, setFilters] = useState<Filters>({
    priceMin: "",
    priceMax: "",
    brands: [],
    processors: [],
    rams: [],
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = (
    key: keyof Filters,
    value: string | string[]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleArrayFilter = (
    key: "brands" | "processors" | "rams",
    value: string
  ) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-8">
      {/* Price Range */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full text-left font-bold text-gray-900 mb-4"
        >
          <span>Price Range</span>
          {openSections.price ? (
            <ChevronUp className="text-sm" />
          ) : (
            <ChevronDown className="text-sm" />
          )}
        </button>
        {openSections.price && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) => updateFilter("priceMin", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) => updateFilter("priceMax", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Brand */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection("brand")}
          className="flex items-center justify-between w-full text-left font-bold text-gray-900 mb-4"
        >
          <span>Brand</span>
          {openSections.brand ? (
            <ChevronUp className="text-sm" />
          ) : (
            <ChevronDown className="text-sm" />
          )}
        </button>
        {openSections.brand && (
          <div className="space-y-2">
            {["HP", "Dell", "Lenovo", "Microsoft", "Apple", "Asus"].map(
              (brand) => (
                <label
                  key={brand}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => toggleArrayFilter("brands", brand)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-gray-600 group-hover:text-primary transition-colors">
                    {brand}
                  </span>
                </label>
              ),
            )}
          </div>
        )}
      </div>

      {/* Processor */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection("processor")}
          className="flex items-center justify-between w-full text-left font-bold text-gray-900 mb-4"
        >
          <span>Processor</span>
          {openSections.processor ? (
            <ChevronUp className="text-sm" />
          ) : (
            <ChevronDown className="text-sm" />
          )}
        </button>
        {openSections.processor && (
          <div className="space-y-2">
            {[
              "Intel Core i5",
              "Intel Core i7",
              "Intel Core i9",
              "AMD Ryzen 5",
              "AMD Ryzen 7",
              "Apple M1/M2/M3",
            ].map((cpu) => (
              <label
                key={cpu}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.processors.includes(cpu)}
                  onChange={() => toggleArrayFilter("processors", cpu)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-gray-600 group-hover:text-primary transition-colors">
                  {cpu}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* RAM */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection("ram")}
          className="flex items-center justify-between w-full text-left font-bold text-gray-900 mb-4"
        >
          <span>RAM</span>
          {openSections.ram ? (
            <ChevronUp className="text-sm" />
          ) : (
            <ChevronDown className="text-sm" />
          )}
        </button>
        {openSections.ram && (
          <div className="space-y-2">
            {["8GB", "16GB", "32GB", "64GB"].map((ram) => (
              <label
                key={ram}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.rams.includes(ram)}
                  onChange={() => toggleArrayFilter("rams", ram)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-gray-600 group-hover:text-primary transition-colors">
                  {ram}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
