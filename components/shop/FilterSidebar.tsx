"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface FilterSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const FilterSection = ({
  title,
  isOpen,
  onToggle,
  children,
}: FilterSectionProps) => {
  return (
    <div className="border-b border-gray-100 py-4 last:border-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-2 hover:text-primary transition-colors"
      >
        {title}
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterSidebar = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    brand: true,
    processor: true,
    ram: false,
    storage: false,
  });

  const [priceRange, setPriceRange] = useState([30000, 250000]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const brands = ["HP", "Dell", "Asus", "Lenovo", "Acer", "Apple", "MSI"];
  const processors = [
    "Intel Core i3",
    "Intel Core i5",
    "Intel Core i7",
    "Intel Core i9",
    "AMD Ryzen 3",
    "AMD Ryzen 5",
    "AMD Ryzen 7",
    "Apple M1/M2/M3",
  ];
  const rams = ["4GB", "8GB", "16GB", "32GB", "64GB"];
  const storages = ["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD"];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 w-full max-w-xs h-fit sticky top-24">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <button className="text-xs text-primary font-medium hover:underline">
          Clear All
        </button>
      </div>

      <div className="space-y-1">
        {/* Price Range */}
        <FilterSection
          title="Price Range"
          isOpen={openSections.price}
          onToggle={() => toggleSection("price")}
        >
          <div className="px-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-500">
                ৳{priceRange[0].toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">
                ৳{priceRange[1].toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="500000"
              step="1000"
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], parseInt(e.target.value)])
              }
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </FilterSection>

        {/* Brands */}
        <FilterSection
          title="Brands"
          isOpen={openSections.brand}
          onToggle={() => toggleSection("brand")}
        >
          <div className="space-y-2">
            {brands.map((brand) => (
              <label
                key={brand}
                className="flex items-center cursor-pointer group"
              >
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                  />
                </div>
                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {brand}
                </span>
                <span className="ml-auto text-xs text-gray-400">(12)</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Processor */}
        <FilterSection
          title="Processor"
          isOpen={openSections.processor}
          onToggle={() => toggleSection("processor")}
        >
          <div className="space-y-2">
            {processors.map((processor) => (
              <label
                key={processor}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary/20 h-4 w-4 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {processor}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* RAM */}
        <FilterSection
          title="RAM"
          isOpen={openSections.ram}
          onToggle={() => toggleSection("ram")}
        >
          <div className="grid grid-cols-2 gap-2">
            {rams.map((ram) => (
              <label
                key={ram}
                className="flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-pointer hover:border-primary hover:text-primary transition-all peer-checked:border-primary peer-checked:bg-primary/5"
              >
                <input type="checkbox" className="hidden peer" />
                <span className="peer-checked:font-medium">{ram}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Storage */}
        <FilterSection
          title="Storage"
          isOpen={openSections.storage}
          onToggle={() => toggleSection("storage")}
        >
          <div className="space-y-2">
            {storages.map((storage) => (
              <label
                key={storage}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary/20 h-4 w-4 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {storage}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Button className="w-full bg-primary hover:bg-primary/90 text-white font-medium rounded-lg h-10 shadow-lg shadow-primary/25 cursor-pointer">
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;
