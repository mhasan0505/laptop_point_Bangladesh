import type { Product } from "@/types/product";


export interface ProductFilters {
  priceMin: string;
  priceMax: string;
  availability: string[];
  series: string[];
  brands: string[];
  processorTypes: string[];
  processorModels: string[];
  generations: string[];
  displaySizes: string[];
  displayTypes: string[];
  ramSizes: string[];
  ramTypes: string[];
  ssdSizes: string[];
  graphics: string[];
  operatingSystems: string[];
  specialFeatures: string[];
  sortBy: string;
  // Backward compatibility aliases
  categories?: string[];
  processors?: string[];
  rams?: string[];
  storages?: string[];
  grades?: string[];
  inStockOnly?: boolean;
  touchscreenOnly?: boolean;
}

export const EMPTY_FILTERS: ProductFilters = {
  priceMin: "",
  priceMax: "",
  availability: [],
  series: [],
  brands: [],
  processorTypes: [],
  processorModels: [],
  generations: [],
  displaySizes: [],
  displayTypes: [],
  ramSizes: [],
  ramTypes: [],
  ssdSizes: [],
  graphics: [],
  operatingSystems: [],
  specialFeatures: [],
  sortBy: "featured",
  categories: [],
  processors: [],
  rams: [],
  storages: [],
  grades: [],
  inStockOnly: false,
  touchscreenOnly: false,
};

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface FilterFacets {
  availability: FacetOption[];
  series: FacetOption[];
  brands: FacetOption[];
  processorTypes: FacetOption[];
  processorModels: FacetOption[];
  generations: FacetOption[];
  displaySizes: FacetOption[];
  displayTypes: FacetOption[];
  ramSizes: FacetOption[];
  ramTypes: FacetOption[];
  ssdSizes: FacetOption[];
  graphics: FacetOption[];
  operatingSystems: FacetOption[];
  specialFeatures: FacetOption[];
  minPrice: number;
  maxPrice: number;
  totalCount: number;
}

/** Check if any filters are actively set (ignoring default sort) */
export function hasActiveFilters(filters: ProductFilters): boolean {
  return (
    Boolean(filters.priceMin) ||
    Boolean(filters.priceMax) ||
    (filters.availability?.length ?? 0) > 0 ||
    (filters.series?.length ?? 0) > 0 ||
    (filters.brands?.length ?? 0) > 0 ||
    (filters.processorTypes?.length ?? 0) > 0 ||
    (filters.processorModels?.length ?? 0) > 0 ||
    (filters.generations?.length ?? 0) > 0 ||
    (filters.displaySizes?.length ?? 0) > 0 ||
    (filters.displayTypes?.length ?? 0) > 0 ||
    (filters.ramSizes?.length ?? 0) > 0 ||
    (filters.ramTypes?.length ?? 0) > 0 ||
    (filters.ssdSizes?.length ?? 0) > 0 ||
    (filters.graphics?.length ?? 0) > 0 ||
    (filters.operatingSystems?.length ?? 0) > 0 ||
    (filters.specialFeatures?.length ?? 0) > 0 ||
    Boolean(filters.inStockOnly) ||
    Boolean(filters.touchscreenOnly) ||
    (filters.categories?.length ?? 0) > 0 ||
    (filters.processors?.length ?? 0) > 0 ||
    (filters.rams?.length ?? 0) > 0 ||
    (filters.storages?.length ?? 0) > 0
  );
}

/** Get total count of active filter dimensions */
export function getActiveFilterCount(filters: ProductFilters): number {
  let count = 0;
  if (filters.priceMin || filters.priceMax) count += 1;
  count += filters.availability?.length ?? 0;
  count += filters.series?.length ?? 0;
  count += filters.brands?.length ?? 0;
  count += filters.processorTypes?.length ?? 0;
  count += filters.processorModels?.length ?? 0;
  count += filters.generations?.length ?? 0;
  count += filters.displaySizes?.length ?? 0;
  count += filters.displayTypes?.length ?? 0;
  count += filters.ramSizes?.length ?? 0;
  count += filters.ramTypes?.length ?? 0;
  count += filters.ssdSizes?.length ?? 0;
  count += filters.graphics?.length ?? 0;
  count += filters.operatingSystems?.length ?? 0;
  count += filters.specialFeatures?.length ?? 0;
  if (filters.inStockOnly) count += 1;
  if (filters.touchscreenOnly) count += 1;
  return count;
}

/** Normalize a brand/name token for case- and punctuation-insensitive matching. */
export function normalizeToken(value?: string): string {
  return (
    value
      ?.toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .trim() ?? ""
  );
}

// ─── Matching Helpers ────────────────────────────────────────────────────────

function isDedicatedGpu(graphics: string): boolean {
  const g = graphics.toLowerCase();
  return (
    g.includes("dedicated") ||
    g.includes("nvidia") ||
    g.includes("geforce") ||
    g.includes("rtx") ||
    g.includes("gtx") ||
    g.includes("radeon pro")
  );
}

export function isTouchscreen(product: Product): boolean {
  return (
    Boolean(product.specs?.touchscreen) ||
    (product.specs?.display || "").toLowerCase().includes("touch") ||
    (product.features || []).some((feat) => feat.toLowerCase().includes("touch"))
  );
}

export function matchesAvailability(product: Product, filter: string): boolean {
  const f = filter.toLowerCase();
  if (f === "in stock") return Boolean(product.inStock);
  if (f === "pre order") return !product.inStock;
  if (f === "up coming") return !product.inStock;
  return true;
}

export function matchesSeries(product: Product, filter: string): boolean {
  const f = filter.toLowerCase();
  const cat = (product.category || "").toLowerCase();
  const name = (product.name || "").toLowerCase();
  const desc = `${product.description?.short || ""} ${product.description?.full || ""}`.toLowerCase();
  const features = (product.features || []).join(" ").toLowerCase();

  if (f.includes("business")) {
    return (
      cat.includes("business") ||
      name.includes("probook") ||
      name.includes("elitebook") ||
      name.includes("thinkpad") ||
      name.includes("latitude") ||
      features.includes("business") ||
      desc.includes("business")
    );
  }
  if (f.includes("gaming")) {
    const gpu = product.specs?.graphics || "";
    return (
      cat.includes("gaming") ||
      name.includes("gaming") ||
      name.includes("omen") ||
      name.includes("legion") ||
      name.includes("victus") ||
      name.includes("rog") ||
      name.includes("tuf") ||
      isDedicatedGpu(gpu)
    );
  }
  if (f.includes("premium") || f.includes("ultrabook")) {
    return (
      cat.includes("ultrabook") ||
      name.includes("ultrabook") ||
      name.includes("xps") ||
      name.includes("spectre") ||
      name.includes("zenbook") ||
      name.includes("surface") ||
      name.includes("x1 carbon")
    );
  }
  if (f.includes("mainstream")) {
    return cat === "laptop" || (!cat.includes("workstation") && !cat.includes("gaming"));
  }
  return cat.includes(f) || name.includes(f);
}

export function matchesProcessorType(processor: string, filter: string): boolean {
  const p = processor.toLowerCase();
  const f = filter.toLowerCase();

  if (f === "intel") {
    return (
      p.includes("intel") ||
      p.includes("core") ||
      p.includes("celeron") ||
      p.includes("pentium") ||
      /\bi[3579]-/.test(p)
    );
  }
  if (f === "amd") {
    return p.includes("amd") || p.includes("ryzen");
  }
  if (f === "apple") {
    return p.includes("apple") || /\bm[1-4]\b/.test(p);
  }
  if (f === "snapdragon") {
    return p.includes("snapdragon") || p.includes("qualcomm");
  }
  return p.includes(f);
}

export function matchesProcessorModel(processor: string, filter: string): boolean {
  const p = processor.toLowerCase();
  const f = filter.toLowerCase();

  if (f === "intel celeron" || f.includes("celeron")) return p.includes("celeron");
  if (f === "intel pentium" || f.includes("pentium")) return p.includes("pentium");
  if (f === "intel core i3" || f.includes("core i3")) return p.includes("core i3") || /\bi3-/.test(p);
  if (f === "intel core i5" || f.includes("core i5")) return p.includes("core i5") || /\bi5-/.test(p);
  if (f === "intel core i7" || f.includes("core i7")) return p.includes("core i7") || /\bi7-/.test(p);
  if (f === "intel core i9" || f.includes("core i9")) return p.includes("core i9") || /\bi9-/.test(p);
  if (f.includes("ultra 5")) return p.includes("ultra 5");
  if (f.includes("ultra 7")) return p.includes("ultra 7");
  if (f.includes("ryzen 3")) return p.includes("ryzen 3") || /\br3-/.test(p);
  if (f.includes("ryzen 5")) return p.includes("ryzen 5") || /\br5-/.test(p);
  if (f.includes("ryzen 7")) return p.includes("ryzen 7") || /\br7-/.test(p);
  if (f.includes("ryzen 9")) return p.includes("ryzen 9") || /\br9-/.test(p);
  if (f.includes("m1") || f.includes("m2") || f.includes("m3") || f.includes("apple")) {
    return p.includes("apple") || /\bm[1-4]\b/.test(p);
  }
  return p.includes(f);
}

export function matchesGeneration(processor: string, filter: string): boolean {
  const p = processor.toLowerCase();
  const f = filter.toLowerCase();

  if (f.includes("14th")) return p.includes("14th") || /\b14\d{3}\b/.test(p);
  if (f.includes("13th")) return p.includes("13th") || /\b13\d{3}\b/.test(p);
  if (f.includes("12th")) return p.includes("12th") || /\b12\d{3}\b/.test(p);
  if (f.includes("11th")) {
    return p.includes("11th") || /\b11\d{3}\b/.test(p) || p.includes("1135g7") || p.includes("1165g7");
  }
  if (f.includes("10th")) return p.includes("10th") || /\b10\d{3}\b/.test(p);
  if (f.includes("8th")) return p.includes("8th") || /\b8\d{3}\b/.test(p);
  if (f.includes("6th")) return p.includes("6th") || /\b6\d{3}\b/.test(p);
  if (f.includes("4000")) return /\b4\d{3}\b/.test(p);
  if (f.includes("5000")) return /\b5\d{3}\b/.test(p);
  if (f.includes("6000")) return /\b6\d{3}\b/.test(p);
  if (f.includes("7000")) return /\b7\d{3}\b/.test(p);
  if (f.includes("8000")) return /\b8\d{3}\b/.test(p);
  return p.includes(f);
}

export function matchesDisplaySize(display: string, filter: string): boolean {
  const match = display.match(/(\d+(\.\d+)?)/);
  if (!match) return false;
  const size = parseFloat(match[1]);
  const f = filter.toLowerCase();

  if (f.includes("below 13") || f.includes("<13")) {
    return size < 13.0;
  }
  if (f.includes("13") && (f.includes("13.9") || f.includes("to 13"))) {
    return size >= 13.0 && size < 14.0;
  }
  if (f.includes("14") && (f.includes("14.9") || f.includes("to 14") || f === "14 inch")) {
    return size >= 14.0 && size < 15.0;
  }
  if (f.includes("15") && (f.includes("15.9") || f.includes("to 15") || f === "15 inch")) {
    return size >= 15.0 && size < 16.0;
  }
  if (f.includes("16") && (f.includes("16.9") || f.includes("to 16"))) {
    return size >= 16.0 && size < 17.0;
  }
  if (f.includes("17") && (f.includes("17.9") || f.includes("to 17"))) {
    return size >= 17.0;
  }
  return false;
}

export function matchesDisplayType(product: Product, filter: string): boolean {
  const f = filter.toLowerCase();
  const d = `${product.specs?.display || ""} ${product.specs?.displayType || ""}`.toLowerCase();

  if (f === "touchscreen" || f.includes("touch")) {
    return isTouchscreen(product);
  }
  if (f === "ips" || f.includes("ips")) {
    return d.includes("ips");
  }
  if (f === "oled" || f.includes("oled")) {
    return d.includes("oled");
  }
  return d.includes(f);
}

export function matchesRamSize(ram: string, filter: string): boolean {
  const r = ram.toLowerCase();
  const numMatch = filter.match(/\d+/);
  if (!numMatch) return r.includes(filter.toLowerCase());
  const num = numMatch[0];
  const rx = new RegExp(`\\b${num}\\s*gb\\b`, "i");
  return rx.test(r);
}

export function matchesRamType(ram: string, filter: string): boolean {
  const r = ram.toLowerCase();
  const f = filter.toLowerCase();

  if (f.includes("lpddr5")) return r.includes("lpddr5");
  if (f.includes("lpddr4")) return r.includes("lpddr4");
  if (f.includes("ddr5")) return r.includes("ddr5");
  if (f.includes("ddr4")) return r.includes("ddr4");
  if (f.includes("ddr3")) return r.includes("ddr3");
  return r.includes(f);
}

export function matchesSsdSize(storage: string, filter: string): boolean {
  const s = storage.toLowerCase();
  const f = filter.toLowerCase();

  if (f.includes("128")) return /\b128\s*gb\b/i.test(s);
  if (f.includes("256")) return /\b256\s*gb\b/i.test(s);
  if (f.includes("512")) return /\b512\s*gb\b/i.test(s);
  if (f.includes("1 tb") || f.includes("1tb")) return /\b(1tb|1\s*tb|1024gb)\b/i.test(s);
  if (f.includes("2 tb") || f.includes("2tb")) return /\b(2tb|2\s*tb|2048gb)\b/i.test(s);
  return s.includes(f);
}

export function matchesGraphicsDetail(graphics: string, filter: string): boolean {
  const g = graphics.toLowerCase();
  const f = filter.toLowerCase();
  const isDedicated = isDedicatedGpu(graphics);

  if (f.includes("shared") || f.includes("integrated")) return !isDedicated;
  if (f.includes("dedicated 2gb") || f.includes("2gb")) return isDedicated && g.includes("2gb");
  if (f.includes("dedicated 4gb") || f.includes("4gb")) return isDedicated && g.includes("4gb");
  if (f.includes("dedicated 6gb") || f.includes("6gb")) return isDedicated && g.includes("6gb");
  if (f.includes("dedicated 8gb") || f.includes("8gb")) return isDedicated && g.includes("8gb");
  if (f.includes("dedicated")) return isDedicated;
  if (f.includes("nvidia")) return g.includes("nvidia") || g.includes("geforce") || g.includes("rtx");
  if (f.includes("radeon")) return g.includes("radeon");
  return g.includes(f);
}

export function matchesOperatingSystem(product: Product, filter: string): boolean {
  const os = (product.specs?.os || "").toLowerCase();
  const f = filter.toLowerCase();

  if (f === "free dos" || f.includes("dos")) return os.includes("dos");
  if (f === "windows 10") return os.includes("windows 10");
  if (f === "windows 11") return os.includes("windows 11");
  if (f === "windows") return os.includes("windows");
  if (f === "macos" || f.includes("mac")) return os.includes("mac");
  return os.includes(f);
}

export function matchesSpecialFeature(product: Product, filter: string): boolean {
  const f = filter.toLowerCase();
  const features = (product.features || []).join(" ").toLowerCase();
  const desc = `${product.description?.short || ""} ${product.description?.full || ""}`.toLowerCase();
  const ports = (product.specs?.ports || []).join(" ").toLowerCase();

  if (f.includes("backlit")) return features.includes("backlit") || desc.includes("backlit");
  if (f.includes("fingerprint")) return features.includes("fingerprint") || desc.includes("fingerprint");
  if (f.includes("webcam") || f.includes("camera")) {
    return features.includes("webcam") || desc.includes("webcam") || desc.includes("camera");
  }
  if (f.includes("touch")) return isTouchscreen(product);
  if (f.includes("dual display")) return features.includes("dual display") || desc.includes("dual display");
  if (f.includes("type-c") || f.includes("usb-c")) {
    return ports.includes("usb-c") || ports.includes("type-c") || features.includes("type-c");
  }
  if (f.includes("rj45") || f.includes("lan")) {
    return ports.includes("rj-45") || ports.includes("rj45") || ports.includes("lan");
  }
  return features.includes(f) || desc.includes(f);
}

// ─── Single Item Matcher ───────────────────────────────────────────────────

function matchItem(
  product: Product,
  key: keyof ProductFilters,
  filters: ProductFilters,
): boolean {
  switch (key) {
    case "priceMin": {
      if (!filters.priceMin) return true;
      const min = parseFloat(filters.priceMin);
      return Number.isNaN(min) ? true : product.price >= min;
    }
    case "priceMax": {
      if (!filters.priceMax) return true;
      const max = parseFloat(filters.priceMax);
      return Number.isNaN(max) ? true : product.price <= max;
    }
    case "availability": {
      if (!filters.availability || filters.availability.length === 0) return true;
      return filters.availability.some((a) => matchesAvailability(product, a));
    }
    case "series": {
      if (!filters.series || filters.series.length === 0) return true;
      return filters.series.some((s) => matchesSeries(product, s));
    }
    case "brands": {
      if (!filters.brands || filters.brands.length === 0) return true;
      const normalizedBrands = filters.brands.map(normalizeToken);
      const productBrand = normalizeToken(product.brand);
      if (productBrand && normalizedBrands.includes(productBrand)) return true;
      const productName = normalizeToken(product.name);
      return normalizedBrands.some((b) => productName.includes(b));
    }
    case "processorTypes": {
      if (!filters.processorTypes || filters.processorTypes.length === 0) return true;
      const processor = product.specs?.processor || "";
      return filters.processorTypes.some((t) => matchesProcessorType(processor, t));
    }
    case "processorModels": {
      if (!filters.processorModels || filters.processorModels.length === 0) return true;
      const processor = product.specs?.processor || "";
      return filters.processorModels.some((m) => matchesProcessorModel(processor, m));
    }
    case "generations": {
      if (!filters.generations || filters.generations.length === 0) return true;
      const processor = product.specs?.processor || "";
      return filters.generations.some((g) => matchesGeneration(processor, g));
    }
    case "displaySizes": {
      if (!filters.displaySizes || filters.displaySizes.length === 0) return true;
      const display = product.specs?.display || "";
      return filters.displaySizes.some((d) => matchesDisplaySize(display, d));
    }
    case "displayTypes": {
      if (!filters.displayTypes || filters.displayTypes.length === 0) return true;
      return filters.displayTypes.some((dt) => matchesDisplayType(product, dt));
    }
    case "ramSizes": {
      if (!filters.ramSizes || filters.ramSizes.length === 0) return true;
      const ram = product.specs?.ram || "";
      return filters.ramSizes.some((r) => matchesRamSize(ram, r));
    }
    case "ramTypes": {
      if (!filters.ramTypes || filters.ramTypes.length === 0) return true;
      const ram = product.specs?.ram || "";
      return filters.ramTypes.some((rt) => matchesRamType(ram, rt));
    }
    case "ssdSizes": {
      if (!filters.ssdSizes || filters.ssdSizes.length === 0) return true;
      const storage = product.specs?.storage || "";
      return filters.ssdSizes.some((s) => matchesSsdSize(storage, s));
    }
    case "graphics": {
      if (!filters.graphics || filters.graphics.length === 0) return true;
      const graphics = product.specs?.graphics || "";
      return filters.graphics.some((g) => matchesGraphicsDetail(graphics, g));
    }
    case "operatingSystems": {
      if (!filters.operatingSystems || filters.operatingSystems.length === 0) return true;
      return filters.operatingSystems.some((os) => matchesOperatingSystem(product, os));
    }
    case "specialFeatures": {
      if (!filters.specialFeatures || filters.specialFeatures.length === 0) return true;
      return filters.specialFeatures.some((sf) => matchesSpecialFeature(product, sf));
    }
    case "inStockOnly": {
      if (!filters.inStockOnly) return true;
      return Boolean(product.inStock);
    }
    case "touchscreenOnly": {
      if (!filters.touchscreenOnly) return true;
      return isTouchscreen(product);
    }
    default:
      return true;
  }
}

// ─── Filter Products ─────────────────────────────────────────────────────────

export function filterProducts(
  products: Product[],
  filters: ProductFilters,
  searchQuery?: string | null,
): Product[] {
  let result = [...products];

  // 1. Keyword search (if present)
  if (searchQuery) {
    const rawTerm = searchQuery.trim().toLowerCase();
    const tokens = rawTerm.split(/\s+/).filter(Boolean);

    if (tokens.length > 0) {
      const scored: Array<{ product: Product; score: number }> = [];

      for (const product of result) {
        const pId = String(product.id || "");
        const pName = (product.name || "").toLowerCase();
        const pBrand = (product.brand || "").toLowerCase();
        const pCat = (product.category || "").toLowerCase();
        const pSku = (product.sku || "").toLowerCase();
        const pProc = (product.specs?.processor || "").toLowerCase();
        const searchable = `${pId} ${pName} ${pBrand} ${pCat} ${pSku} ${pProc}`;

        const allMatch = tokens.every((t) => {
          if (t.length <= 2) {
            if (pId === t) return true;
            const rx = new RegExp(`\\b${t}\\b`, "i");
            return rx.test(pName) || rx.test(pBrand) || rx.test(pSku) || rx.test(pProc);
          }
          return searchable.includes(t);
        });

        if (allMatch) {
          let score = 0;
          if (pId === rawTerm) score += 3000;
          if (pSku === rawTerm) score += 2500;
          if (pName === rawTerm) score += 2000;
          else if (pName.startsWith(rawTerm)) score += 1000;
          else if (pName.includes(rawTerm)) score += 500;

          const tokensInName = tokens.filter((t) => pName.includes(t));
          score += (tokensInName.length / tokens.length) * 300;

          scored.push({ product, score });
        }
      }

      scored.sort((a, b) => b.score - a.score);
      result = scored.map((s) => s.product);
    }
  }

  // 2. Multi-facet filters
  result = result.filter((product) => {
    return (
      matchItem(product, "priceMin", filters) &&
      matchItem(product, "priceMax", filters) &&
      matchItem(product, "availability", filters) &&
      matchItem(product, "series", filters) &&
      matchItem(product, "brands", filters) &&
      matchItem(product, "processorTypes", filters) &&
      matchItem(product, "processorModels", filters) &&
      matchItem(product, "generations", filters) &&
      matchItem(product, "displaySizes", filters) &&
      matchItem(product, "displayTypes", filters) &&
      matchItem(product, "ramSizes", filters) &&
      matchItem(product, "ramTypes", filters) &&
      matchItem(product, "ssdSizes", filters) &&
      matchItem(product, "graphics", filters) &&
      matchItem(product, "operatingSystems", filters) &&
      matchItem(product, "specialFeatures", filters) &&
      matchItem(product, "inStockOnly", filters) &&
      matchItem(product, "touchscreenOnly", filters)
    );
  });

  // 3. Sorting
  switch (filters.sortBy) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "discount":
      result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
      break;
    case "rating":
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case "name-asc":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "newest":
    case "featured":
    default:
      result.sort((a, b) => Number(b.id) - Number(a.id));
      break;
  }

  return result;
}

// ─── Facet Counts Calculator ─────────────────────────────────────────────────

export function computeFilterFacets(
  allProducts: Product[],
  currentFilters: ProductFilters,
  searchQuery?: string | null,
): FilterFacets {
  let basePool = allProducts;
  if (searchQuery) {
    basePool = filterProducts(allProducts, EMPTY_FILTERS, searchQuery);
  }

  const filterExcept = (dim: keyof ProductFilters): Product[] => {
    return basePool.filter((p) => {
      const keys: (keyof ProductFilters)[] = [
        "priceMin",
        "priceMax",
        "availability",
        "series",
        "brands",
        "processorTypes",
        "processorModels",
        "generations",
        "displaySizes",
        "displayTypes",
        "ramSizes",
        "ramTypes",
        "ssdSizes",
        "graphics",
        "operatingSystems",
        "specialFeatures",
      ];
      for (const k of keys) {
        if (k === dim) continue;
        if (!matchItem(p, k, currentFilters)) return false;
      }
      return true;
    });
  };

  // Availability
  const availList = ["In Stock", "Pre Order", "Up Coming"];
  const availPool = filterExcept("availability");
  const availability: FacetOption[] = availList.map((a) => ({
    value: a,
    label: a,
    count: availPool.filter((p) => matchesAvailability(p, a)).length,
  }));

  // Series
  const seriesList = [
    "Mainstream Laptops",
    "Business Laptops",
    "Gaming Laptops",
    "Premium & Ultrabook Laptops",
  ];
  const seriesPool = filterExcept("series");
  const series: FacetOption[] = seriesList.map((s) => ({
    value: s,
    label: s,
    count: seriesPool.filter((p) => matchesSeries(p, s)).length,
  }));

  // Brands
  const brandList = [
    "Apple",
    "Microsoft",
    "HP",
    "Dell",
    "Lenovo",
    "ASUS",
    "Acer",
    "MSI",
    "Gigabyte",
  ];
  const brandPool = filterExcept("brands");
  const brands: FacetOption[] = brandList.map((b) => ({
    value: b,
    label: b,
    count: brandPool.filter((p) => {
      const pBrand = normalizeToken(p.brand);
      const target = normalizeToken(b);
      return pBrand === target || normalizeToken(p.name).includes(target);
    }).length,
  }));

  // Processor Type
  const procTypeList = ["Intel", "AMD", "Apple", "Snapdragon"];
  const procTypePool = filterExcept("processorTypes");
  const processorTypes: FacetOption[] = procTypeList.map((pt) => ({
    value: pt,
    label: pt,
    count: procTypePool.filter((p) =>
      matchesProcessorType(p.specs?.processor || "", pt),
    ).length,
  }));

  // Processor Model
  const procModelList = [
    "Intel Celeron",
    "Intel Pentium",
    "Intel Core i3",
    "Intel Core i5",
    "Intel Core i7",
    "Intel Core i9",
    "Intel Core Ultra 5",
    "Intel Core Ultra 7",
    "AMD Ryzen 3",
    "AMD Ryzen 5",
    "AMD Ryzen 7",
    "AMD Ryzen 9",
    "Apple M1 / M2 / M3",
  ];
  const procModelPool = filterExcept("processorModels");
  const processorModels: FacetOption[] = procModelList.map((pm) => ({
    value: pm,
    label: pm,
    count: procModelPool.filter((p) =>
      matchesProcessorModel(p.specs?.processor || "", pm),
    ).length,
  }));

  // Generation / Series
  const genList = [
    "Intel 14th Gen",
    "Intel 13th Gen",
    "Intel 12th Gen",
    "Intel 11th Gen",
    "Intel 10th Gen",
    "Intel 8th Gen",
    "Intel 6th Gen",
    "Ryzen 4000 Series",
    "Ryzen 5000 Series",
    "Ryzen 6000 Series",
    "Ryzen 7000 Series",
  ];
  const genPool = filterExcept("generations");
  const generations: FacetOption[] = genList.map((g) => ({
    value: g,
    label: g,
    count: genPool.filter((p) =>
      matchesGeneration(p.specs?.processor || "", g),
    ).length,
  }));

  // Display Size
  const dispSizeList = [
    "Below 13 Inch",
    "13 Inch to 13.9 Inch",
    "14 Inch to 14.9 Inch",
    "15 Inch to 15.9 Inch",
    "16 Inch to 16.9 Inch",
    "17 Inch to 17.9 Inch",
  ];
  const dispSizePool = filterExcept("displaySizes");
  const displaySizes: FacetOption[] = dispSizeList.map((ds) => ({
    value: ds,
    label: ds,
    count: dispSizePool.filter((p) =>
      matchesDisplaySize(p.specs?.display || "", ds),
    ).length,
  }));

  // Display Type
  const dispTypeList = ["IPS", "OLED", "Touchscreen"];
  const dispTypePool = filterExcept("displayTypes");
  const displayTypes: FacetOption[] = dispTypeList.map((dt) => ({
    value: dt,
    label: dt,
    count: dispTypePool.filter((p) => matchesDisplayType(p, dt)).length,
  }));

  // RAM Size
  const ramSizeList = [
    "4 GB",
    "8 GB",
    "12 GB",
    "16 GB",
    "24 GB",
    "32 GB",
    "64 GB",
  ];
  const ramSizePool = filterExcept("ramSizes");
  const ramSizes: FacetOption[] = ramSizeList.map((rs) => ({
    value: rs,
    label: rs,
    count: ramSizePool.filter((p) =>
      matchesRamSize(p.specs?.ram || "", rs),
    ).length,
  }));

  // RAM Type
  const ramTypeList = [
    "DDR4",
    "DDR5",
    "LPDDR4 / LPDDR4x",
    "LPDDR5 / LPDDR5x",
  ];
  const ramTypePool = filterExcept("ramTypes");
  const ramTypes: FacetOption[] = ramTypeList.map((rt) => ({
    value: rt,
    label: rt,
    count: ramTypePool.filter((p) =>
      matchesRamType(p.specs?.ram || "", rt),
    ).length,
  }));

  // SSD
  const ssdList = ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB"];
  const ssdPool = filterExcept("ssdSizes");
  const ssdSizes: FacetOption[] = ssdList.map((s) => ({
    value: s,
    label: s,
    count: ssdPool.filter((p) =>
      matchesSsdSize(p.specs?.storage || "", s),
    ).length,
  }));

  // Graphics
  const gpuList = [
    "Shared / Integrated",
    "Dedicated 2GB",
    "Dedicated 4GB",
    "Dedicated 6GB",
    "Dedicated 8GB",
    "Dedicated Graphics",
  ];
  const gpuPool = filterExcept("graphics");
  const graphics: FacetOption[] = gpuList.map((g) => ({
    value: g,
    label: g,
    count: gpuPool.filter((p) =>
      matchesGraphicsDetail(p.specs?.graphics || "", g),
    ).length,
  }));

  // Operating System
  const osList = ["Free DOS", "Windows", "macOS"];
  const osPool = filterExcept("operatingSystems");
  const operatingSystems: FacetOption[] = osList.map((os) => ({
    value: os,
    label: os,
    count: osPool.filter((p) => matchesOperatingSystem(p, os)).length,
  }));

  // Special Features
  const sfList = [
    "Backlit Keyboard",
    "Fingerprint",
    "FHD Webcam",
    "Touch Screen",
    "Dual Display",
    "Type-C Port",
    "RJ45 (LAN) Port",
  ];
  const sfPool = filterExcept("specialFeatures");
  const specialFeatures: FacetOption[] = sfList.map((sf) => ({
    value: sf,
    label: sf,
    count: sfPool.filter((p) => matchesSpecialFeature(p, sf)).length,
  }));

  let minPrice = Infinity;
  let maxPrice = 0;
  for (const p of allProducts) {
    if (p.price > 0) {
      if (p.price < minPrice) minPrice = p.price;
      if (p.price > maxPrice) maxPrice = p.price;
    }
  }
  if (minPrice === Infinity) minPrice = 0;

  return {
    availability,
    series,
    brands,
    processorTypes,
    processorModels,
    generations,
    displaySizes,
    displayTypes,
    ramSizes,
    ramTypes,
    ssdSizes,
    graphics,
    operatingSystems,
    specialFeatures,
    minPrice,
    maxPrice,
    totalCount: basePool.length,
  };
}