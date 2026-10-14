"use client";

import {
  EMPTY_FILTERS,
  FilterFacets,
  hasActiveFilters,
  ProductFilters,
} from "@/lib/product-filter";
import { ChevronDown, ChevronUp, RotateCcw, X } from "lucide-react";
import React, { useEffect, useId, useState } from "react";

export interface FilterSidebarProps {
  filters?: ProductFilters;
  facets?: FilterFacets;
  onFilterChange: (filters: ProductFilters) => void;
  onResetFilters?: () => void;
  className?: string;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
  totalMatchingCount?: number;
}

export default function FilterSidebar({
  filters: controlledFilters,
  facets,
  onFilterChange,
  onResetFilters,
  className = "",
  isMobileDrawer = false,
  onCloseMobile,
  totalMatchingCount,
}: FilterSidebarProps) {
  const [internalFilters, setInternalFilters] = useState<ProductFilters>(
    controlledFilters ?? EMPTY_FILTERS,
  );
  const activeFilters = controlledFilters ?? internalFilters;

  // Track accordion open/closed states
  const [openSections, setOpenSections] = useState({
    price: true,
    availability: true,
    series: true,
    brand: true,
    processorType: true,
    processorModel: true,
    generation: true,
    displaySize: true,
    displayType: true,
    ramSize: true,
    ramType: true,
    ssd: true,
    graphics: true,
    os: true,
    specialFeatures: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilters = (newFilters: ProductFilters) => {
    if (!controlledFilters) {
      setInternalFilters(newFilters);
    }
    onFilterChange(newFilters);
  };

  const setFilterField = <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K],
  ) => {
    updateFilters({ ...activeFilters, [key]: value });
  };

  const toggleArrayFilter = (
    key:
      | "availability"
      | "series"
      | "brands"
      | "processorTypes"
      | "processorModels"
      | "generations"
      | "displaySizes"
      | "displayTypes"
      | "ramSizes"
      | "ramTypes"
      | "ssdSizes"
      | "graphics"
      | "operatingSystems"
      | "specialFeatures",
    value: string,
  ) => {
    const current = (activeFilters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setFilterField(key, updated as any);
  };

  // Slider price range bounds
  const sliderMin = 0;
  const sliderMax = 470000;

  const currentMinPrice = activeFilters.priceMin
    ? Number(activeFilters.priceMin)
    : sliderMin;
  const currentMaxPrice = activeFilters.priceMax
    ? Number(activeFilters.priceMax)
    : sliderMax;

  const [minSliderVal, setMinSliderVal] = useState(currentMinPrice);
  const [maxSliderVal, setMaxSliderVal] = useState(currentMaxPrice);

  useEffect(() => {
    setMinSliderVal(
      activeFilters.priceMin ? Number(activeFilters.priceMin) : sliderMin,
    );
  }, [activeFilters.priceMin, sliderMin]);

  useEffect(() => {
    setMaxSliderVal(
      activeFilters.priceMax ? Number(activeFilters.priceMax) : sliderMax,
    );
  }, [activeFilters.priceMax, sliderMax]);

  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxSliderVal - 1000);
    setMinSliderVal(val);
    setFilterField("priceMin", val <= sliderMin ? "" : String(val));
  };

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minSliderVal + 1000);
    setMaxSliderVal(val);
    setFilterField("priceMax", val >= sliderMax ? "" : String(val));
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFilterField("priceMin", val);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFilterField("priceMax", val);
  };

  const minPercent = Math.min(
    100,
    Math.max(0, ((minSliderVal - sliderMin) / (sliderMax - sliderMin)) * 100),
  );
  const maxPercent = Math.min(
    100,
    Math.max(0, ((maxSliderVal - sliderMin) / (sliderMax - sliderMin)) * 100),
  );

  const isFiltered = hasActiveFilters(activeFilters);

  const handleReset = () => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      updateFilters(EMPTY_FILTERS);
    }
  };

  // Section options data lists
  const AVAILABILITY_OPTIONS = [
    { label: "In Stock", value: "In Stock" },
    { label: "Pre Order", value: "Pre Order" },
    { label: "Up Coming", value: "Up Coming" },
  ];

  const SERIES_OPTIONS = [
    { label: "Mainstream Laptops", value: "Mainstream Laptops" },
    { label: "Business Laptops", value: "Business Laptops" },
    { label: "Gaming Laptops", value: "Gaming Laptops" },
    { label: "Premium & Ultrabook Laptops", value: "Premium & Ultrabook Laptops" },
  ];

  const BRAND_OPTIONS = [
    { label: "Apple", value: "Apple" },
    { label: "Microsoft", value: "Microsoft" },
    { label: "HP", value: "HP" },
    { label: "Dell", value: "Dell" },
    { label: "Lenovo", value: "Lenovo" },
    { label: "ASUS", value: "ASUS" },
    { label: "Acer", value: "Acer" },
    { label: "MSI", value: "MSI" },
    { label: "Gigabyte", value: "Gigabyte" },
  ];

  const PROCESSOR_TYPE_OPTIONS = [
    { label: "Intel", value: "Intel" },
    { label: "AMD", value: "AMD" },
    { label: "Apple", value: "Apple" },
    { label: "Snapdragon", value: "Snapdragon" },
  ];

  const PROCESSOR_MODEL_OPTIONS = [
    { label: "Intel Celeron", value: "Intel Celeron" },
    { label: "Intel Pentium", value: "Intel Pentium" },
    { label: "Intel Core i3", value: "Intel Core i3" },
    { label: "Intel Core i5", value: "Intel Core i5" },
    { label: "Intel Core i7", value: "Intel Core i7" },
    { label: "Intel Core i9", value: "Intel Core i9" },
    { label: "Intel Core Ultra 5", value: "Intel Core Ultra 5" },
    { label: "Intel Core Ultra 7", value: "Intel Core Ultra 7" },
    { label: "AMD Ryzen 3", value: "AMD Ryzen 3" },
    { label: "AMD Ryzen 5", value: "AMD Ryzen 5" },
    { label: "AMD Ryzen 7", value: "AMD Ryzen 7" },
    { label: "AMD Ryzen 9", value: "AMD Ryzen 9" },
    { label: "Apple M1 / M2 / M3", value: "Apple M1 / M2 / M3" },
  ];

  const GENERATION_OPTIONS = [
    { label: "Intel 14th Gen", value: "Intel 14th Gen" },
    { label: "Intel 13th Gen", value: "Intel 13th Gen" },
    { label: "Intel 12th Gen", value: "Intel 12th Gen" },
    { label: "Intel 11th Gen", value: "Intel 11th Gen" },
    { label: "Intel 10th Gen", value: "Intel 10th Gen" },
    { label: "Intel 8th Gen", value: "Intel 8th Gen" },
    { label: "Intel 6th Gen", value: "Intel 6th Gen" },
    { label: "Ryzen 4000 Series", value: "Ryzen 4000 Series" },
    { label: "Ryzen 5000 Series", value: "Ryzen 5000 Series" },
    { label: "Ryzen 6000 Series", value: "Ryzen 6000 Series" },
    { label: "Ryzen 7000 Series", value: "Ryzen 7000 Series" },
  ];

  const DISPLAY_SIZE_OPTIONS = [
    { label: "Below 13 Inch", value: "Below 13 Inch" },
    { label: "13 Inch to 13.9 Inch", value: "13 Inch to 13.9 Inch" },
    { label: "14 Inch to 14.9 Inch", value: "14 Inch to 14.9 Inch" },
    { label: "15 Inch to 15.9 Inch", value: "15 Inch to 15.9 Inch" },
    { label: "16 Inch to 16.9 Inch", value: "16 Inch to 16.9 Inch" },
    { label: "17 Inch to 17.9 Inch", value: "17 Inch to 17.9 Inch" },
  ];

  const DISPLAY_TYPE_OPTIONS = [
    { label: "IPS", value: "IPS" },
    { label: "OLED", value: "OLED" },
    { label: "Touchscreen", value: "Touchscreen" },
  ];

  const RAM_SIZE_OPTIONS = [
    { label: "4 GB", value: "4 GB" },
    { label: "8 GB", value: "8 GB" },
    { label: "12 GB", value: "12 GB" },
    { label: "16 GB", value: "16 GB" },
    { label: "24 GB", value: "24 GB" },
    { label: "32 GB", value: "32 GB" },
    { label: "64 GB", value: "64 GB" },
  ];

  const RAM_TYPE_OPTIONS = [
    { label: "DDR4", value: "DDR4" },
    { label: "DDR5", value: "DDR5" },
    { label: "LPDDR4 / LPDDR4x", value: "LPDDR4 / LPDDR4x" },
    { label: "LPDDR5 / LPDDR5x", value: "LPDDR5 / LPDDR5x" },
  ];

  const SSD_OPTIONS = [
    { label: "128 GB", value: "128 GB" },
    { label: "256 GB", value: "256 GB" },
    { label: "512 GB", value: "512 GB" },
    { label: "1 TB", value: "1 TB" },
    { label: "2 TB", value: "2 TB" },
  ];

  const GRAPHICS_OPTIONS = [
    { label: "Shared / Integrated", value: "Shared / Integrated" },
    { label: "Dedicated 2GB", value: "Dedicated 2GB" },
    { label: "Dedicated 4GB", value: "Dedicated 4GB" },
    { label: "Dedicated 6GB", value: "Dedicated 6GB" },
    { label: "Dedicated 8GB", value: "Dedicated 8GB" },
    { label: "Dedicated Graphics", value: "Dedicated Graphics" },
  ];

  const OS_OPTIONS = [
    { label: "Free DOS", value: "Free DOS" },
    { label: "Windows", value: "Windows" },
    { label: "macOS", value: "macOS" },
  ];

  const SPECIAL_FEATURES_OPTIONS = [
    { label: "Backlit Keyboard", value: "Backlit Keyboard" },
    { label: "Fingerprint", value: "Fingerprint" },
    { label: "FHD Webcam", value: "FHD Webcam" },
    { label: "Touch Screen", value: "Touch Screen" },
    { label: "Dual Display", value: "Dual Display" },
    { label: "Type-C Port", value: "Type-C Port" },
    { label: "RJ45 (LAN) Port", value: "RJ45 (LAN) Port" },
  ];

  return (
    <div
      className={`bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg shadow-2xs divide-y divide-gray-100 dark:divide-border/60 text-gray-800 dark:text-gray-200 ${className}`}
    >
      {/* ─── Top Header (Reset & Active Summary) ────────────────────────── */}
      {isFiltered && (
        <div className="p-3 bg-gray-50/80 dark:bg-muted/40 flex items-center justify-between rounded-t-lg">
          <span className="text-xs font-semibold text-[#002b60] dark:text-foreground">
            Filters Applied
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-[#dc0303] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset All
          </button>
        </div>
      )}

      {/* ─── 1. Price Range ────────────────────────────────────────────── */}
      <div className="p-4">
        <h3 className="font-semibold text-[14px] text-[#002b60] dark:text-foreground mb-4">
          Price Range
        </h3>

        {/* Dual Range Track */}
        <div className="relative h-6 flex items-center px-1 mb-4 select-none">
          {/* Gray Track */}
          <div className="absolute left-1 right-1 h-1.5 bg-gray-200 dark:bg-muted rounded-full" />
          {/* Active Highlight Track in #dc0303 */}
          <div
            className="absolute h-1.5 bg-[#dc0303] rounded-full pointer-events-none"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`,
            }}
          />

          {/* Left Thumb */}
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={1000}
            value={minSliderVal}
            onChange={handleMinSliderChange}
            aria-label="Minimum price slider"
            className="dual-range-input absolute inset-0 w-full appearance-none bg-transparent pointer-events-none z-10 cursor-pointer"
          />

          {/* Right Thumb */}
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={1000}
            value={maxSliderVal}
            onChange={handleMaxSliderChange}
            aria-label="Maximum price slider"
            className="dual-range-input absolute inset-0 w-full appearance-none bg-transparent pointer-events-none z-20 cursor-pointer"
          />
        </div>

        {/* Min and Max Price Input Boxes */}
        <div className="grid grid-cols-2 gap-3 items-center">
          <div>
            <input
              type="number"
              value={activeFilters.priceMin}
              onChange={handleMinInputChange}
              placeholder="0"
              className="w-full text-center py-1.5 px-2 bg-white dark:bg-card border border-gray-300 dark:border-border rounded text-[13px] font-mono text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#002b60] dark:focus:border-primary shadow-2xs"
            />
          </div>
          <div>
            <input
              type="number"
              value={activeFilters.priceMax}
              onChange={handleMaxInputChange}
              placeholder="470,000"
              className="w-full text-center py-1.5 px-2 bg-white dark:bg-card border border-gray-300 dark:border-border rounded text-[13px] font-mono text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#002b60] dark:focus:border-primary shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* ─── 2. Availability ───────────────────────────────────────────── */}
      <FilterAccordionSection
        title="Availability"
        isOpen={openSections.availability}
        onToggle={() => toggleSection("availability")}
      >
        <div className="space-y-2.5">
          {AVAILABILITY_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              isChecked={(activeFilters.availability || []).includes(opt.value)}
              onChange={() => toggleArrayFilter("availability", opt.value)}
            />
          ))}
        </div>
      </FilterAccordionSection>

      {/* ─── 3. Series ─────────────────────────────────────────────────── */}
      <FilterAccordionSection
        title="Series"
        isOpen={openSections.series}
        onToggle={() => toggleSection("series")}
      >
        <div className="space-y-2.5">
          {SERIES_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              isChecked={(activeFilters.series || []).includes(opt.value)}
              onChange={() => toggleArrayFilter("series", opt.value)}
            />
          ))}
        </div>
      </FilterAccordionSection>

      {/* ─── 4. Brand ──────────────────────────────────────────────────── */}
      <FilterAccordionSection
        title="Brand"
        isOpen={openSections.brand}
        onToggle={() => toggleSection("brand")}
      >
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {BRAND_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              isChecked={(activeFilters.brands || []).includes(opt.value)}
              onChange={() => toggleArrayFilter("brands", opt.value)}
            />
          ))}
        </div>
      </FilterAccordionSection>

      {/* ─── 5. Processor Type ─────────────────────────────────────────── */}
      <FilterAccordionSection
        title="Processor Type"
        isOpen={openSections.processorType}
        onToggle={() => toggleSection("processorType")}
      >
        <div className="space-y-2.5">
          {PROCESSOR_TYPE_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              isChecked={(activeFilters.processorTypes || []).includes(opt.value)}
              onChange={() => toggleArrayFilter("processorTypes", opt.value)}
            />
          ))}
        </div>
      </FilterAccordionSection>

      {/* ─── 6. Processor Model ────────────────────────────────────────── */}
      <FilterAccordionSection
        title="Processor Model"
        isOpen={openSections.processorModel}
        onToggle={() => toggleSection("processorModel")}
      >
        <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
          {PROCESSOR_MODEL_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              isChecked={(activeFilters.processorModels || []).includes(opt.value)}
              onChange={() => toggleArrayFilter("processorModels", opt.value)}
            />
          ))}
        </div>
      </FilterAccordionSection>

      {/* ─── 7. Generation / Series ────────────────────────────────────── */}
      <FilterAccordionSection
        title="Generation / Series"
        isOpen={openSections.generation}
        onToggle={() => toggleSection("generation")}
      >
        <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
          {GENERATION_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              isChecked={(activeFilters.generations || []).includes(opt.value)}
              onChange={() => toggleArrayFilter("generations", opt.value)}
            />
          ))}
        </div>
      </FilterAccordionSection>

      {/* ─── 8. Display Size ───────────────────────────────────────────── */}
      <FilterAccordionSection
        title="Display Size"
        isOpen={openSections.displaySize}
        onToggle={() => toggleSection("displaySize")}
      >
        <div className="space-y-2.5">
          {DISPLAY_SIZE_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              isChecked={(activeFilters.displaySizes || []).includes(opt.value)}
              onChange={() => toggleArrayFilter("displaySizes", opt.value)}
            />
          ))}
        </div>
      </FilterAccordionSection>

      {/* ─── 9. Display Type ───────────────────────────────────────────── */}
      <FilterAccordionSection
        title="Display Type"
        isOpen={openSections.displayType}
        onToggle={() => toggleSection("displayType")}
      >
        <div className="space-y-2.5">
          {DISPLAY_TYPE_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              isChecked={(activeFilters.displayTypes || []).includes(opt.value)}
              onChange={() => toggleArrayFilter("displayTypes", opt.value)}
            />
          ))}
        </div>
      </FilterAccordionSection>

      {/* ─── 10. RAM Size ──────────────────────────────────────────────── */}
      <FilterAccordionSection
        title="RAM Size"
        isOpen={openSections.ramSize}
        onToggle={() => toggleSection("ramSize")}
      >
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
          {RAM_SIZE_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              isChecked={(activeFilters.ramSizes || []).includes(opt.value)}
              onChange={() => toggleArrayFilter("ramSizes", opt.value)}
            />
          ))}
        </div>
      </FilterAccordionSection>

      {/* ─── 11. RAM Type ──────────────────────────────────────────────── */}
      <FilterAccordionSection
        title="RAM Type"
        isOpen={openSections.ramType}
        onToggle={() => toggleSection("ramType")}
      >
        <div className="space-y-2.5">
          {RAM_TYPE_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              isChecked={(activeFilters.ramTypes || []).includes(opt.value)}
              onChange={() => toggleArrayFilter("ramTypes", opt.value)}
            />
          ))}
        </div>
      </FilterAccordionSection>

      {/* ─── 12. SSD ───────────────────────────────────────────────────── */}
      <FilterAccordionSection
        title="SSD"
        isOpen={openSections.ssd}
        onToggle={() => toggleSection("ssd")}
      >
        <div className="space-y-2.5">
          {SSD_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              isChecked={(activeFilters.ssdSizes || []).includes(opt.value)}
              onChange={() => toggleArrayFilter("ssdSizes", opt.value)}
            />
          ))}
        </div>
      </FilterAccordionSection>

      {/* ─── 13. Graphics ──────────────────────────────────────────────── */}
      <FilterAccordionSection
        title="Graphics"
        isOpen={openSections.graphics}
        onToggle={() => toggleSection("graphics")}
      >
        <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
          {GRAPHICS_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              isChecked={(activeFilters.graphics || []).includes(opt.value)}
              onChange={() => toggleArrayFilter("graphics", opt.value)}
            />
          ))}
        </div>
      </FilterAccordionSection>

      {/* ─── 14. Operating System ──────────────────────────────────────── */}
      <FilterAccordionSection
        title="Operating System"
        isOpen={openSections.os}
        onToggle={() => toggleSection("os")}
      >
        <div className="space-y-2.5">
          {OS_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              isChecked={(activeFilters.operatingSystems || []).includes(
                opt.value,
              )}
              onChange={() => toggleArrayFilter("operatingSystems", opt.value)}
            />
          ))}
        </div>
      </FilterAccordionSection>

      {/* ─── 15. Special Features ──────────────────────────────────────── */}
      <FilterAccordionSection
        title="Special Features"
        isOpen={openSections.specialFeatures}
        onToggle={() => toggleSection("specialFeatures")}
      >
        <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
          {SPECIAL_FEATURES_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              label={opt.label}
              isChecked={(activeFilters.specialFeatures || []).includes(
                opt.value,
              )}
              onChange={() => toggleArrayFilter("specialFeatures", opt.value)}
            />
          ))}
        </div>
      </FilterAccordionSection>

      {/* Mobile Drawer Footer */}
      {isMobileDrawer && (
        <div className="p-4 bg-white dark:bg-card border-t border-gray-200 dark:border-border sticky bottom-0 z-20 flex gap-2">
          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-3 border border-gray-300 dark:border-border text-xs font-semibold text-gray-700 dark:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-muted"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onCloseMobile}
            className="flex-1 py-2 px-3 bg-[#dc0303] text-white text-xs font-semibold rounded hover:bg-[#b80202] transition-colors"
          >
            {totalMatchingCount !== undefined
              ? `Show ${totalMatchingCount} Laptops`
              : "Apply Filters"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface FilterAccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterAccordionSection({
  title,
  isOpen,
  onToggle,
  children,
}: FilterAccordionSectionProps) {
  return (
    <div className="py-2.5 px-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left py-1 text-[13px] font-semibold text-[#002b60] dark:text-foreground hover:text-[#dc0303] transition-colors cursor-pointer select-none"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>

      {isOpen && <div className="pt-2 pb-1">{children}</div>}
    </div>
  );
}

interface CheckboxRowProps {
  label: string;
  isChecked: boolean;
  onChange: () => void;
}

function CheckboxRow({ label, isChecked, onChange }: CheckboxRowProps) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2.5 cursor-pointer text-[13px] text-gray-700 dark:text-gray-300 hover:text-[#002b60] dark:hover:text-white select-none group"
    >
      <input
        id={id}
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        className="w-3.5 h-3.5 rounded-xs border-gray-300 text-[#dc0303] focus:ring-[#dc0303] focus:ring-offset-0 cursor-pointer accent-[#dc0303]"
      />
      <span className="truncate group-hover:translate-x-0.5 transition-transform duration-150">
        {label}
      </span>
    </label>
  );
}
