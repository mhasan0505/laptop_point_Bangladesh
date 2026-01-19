"use client";

import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface FilterSidebarProps {
  onFilterChange: (filters: Record<string, unknown>) => void;
}

export default function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState({
    price: true,
    brand: true,
    processor: true,
    ram: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
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
            <FaChevronUp className="text-sm" />
          ) : (
            <FaChevronDown className="text-sm" />
          )}
        </button>
        {openSections.price && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                onChange={(e) => onFilterChange({ priceMin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
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
            <FaChevronUp className="text-sm" />
          ) : (
            <FaChevronDown className="text-sm" />
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
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-gray-600 group-hover:text-primary transition-colors">
                    {brand}
                  </span>
                </label>
              )
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
            <FaChevronUp className="text-sm" />
          ) : (
            <FaChevronDown className="text-sm" />
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
            <FaChevronUp className="text-sm" />
          ) : (
            <FaChevronDown className="text-sm" />
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
