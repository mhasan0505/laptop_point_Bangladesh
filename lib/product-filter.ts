import type { Product } from "@/types/product";

/**
 * Shared filter state shape used by both the shop page and the
 * FilterSidebar component. Previously this interface was re-declared
 * identically in both files.
 */
export interface ProductFilters {
  priceMin: string;
  priceMax: string;
  brands: string[];
  processors: string[];
  rams: string[];
}

export const EMPTY_FILTERS: ProductFilters = {
  priceMin: "",
  priceMax: "",
  brands: [],
  processors: [],
  rams: [],
};

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

function matchesProcessor(processor: string, filter: string): boolean {
  const p = processor.toLowerCase();
  const f = filter.toLowerCase();
  if (f.includes("intel core i5")) return p.includes("core i5") || /\bi5-/.test(p);
  if (f.includes("intel core i7")) return p.includes("core i7") || /\bi7-/.test(p);
  if (f.includes("intel core i9")) return p.includes("core i9") || /\bi9-/.test(p);
  if (f.includes("ryzen 5")) return p.includes("ryzen 5");
  if (f.includes("ryzen 7")) return p.includes("ryzen 7");
  if (f.includes("apple m1") || f.includes("m2") || f.includes("m3")) {
    return (
      p.includes("apple m1") ||
      p.includes("apple m2") ||
      p.includes("apple m3") ||
      /\bm1\b/.test(p) ||
      /\bm2\b/.test(p) ||
      /\bm3\b/.test(p)
    );
  }
  return false;
}

/**
 * Pure filtering logic used by the shop page. Kept outside the page so the
 * heavy catalog (imported from static JSON) never ships to the client bundle.
 */
export function filterProducts(
  products: Product[],
  filters: ProductFilters,
  searchQuery?: string | null,
): Product[] {
  let result = [...products];

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        (product.brand && product.brand.toLowerCase().includes(query)) ||
        (product.category && product.category.toLowerCase().includes(query)) ||
        (product.sku && product.sku.toLowerCase().includes(query)) ||
        (product.specs?.processor &&
          product.specs.processor.toLowerCase().includes(query)),
    );
  }

  if (filters.priceMin) {
    const min = parseFloat(filters.priceMin);
    if (!Number.isNaN(min)) {
      result = result.filter((p) => p.price >= min);
    }
  }
  if (filters.priceMax) {
    const max = parseFloat(filters.priceMax);
    if (!Number.isNaN(max)) {
      result = result.filter((p) => p.price <= max);
    }
  }

  if (filters.brands.length > 0) {
    const normalizedBrands = filters.brands.map(normalizeToken);
    result = result.filter((product) => {
      const productBrand = normalizeToken(product.brand);
      if (productBrand) return normalizedBrands.includes(productBrand);
      const productName = normalizeToken(product.name);
      return normalizedBrands.some((brand) => productName.includes(brand));
    });
  }

  if (filters.processors.length > 0) {
    result = result.filter((product) => {
      const processor = product.specs?.processor;
      if (!processor) return false;
      return filters.processors.some((f) => matchesProcessor(processor, f));
    });
  }

  if (filters.rams.length > 0) {
    result = result.filter((product) => {
      const ram = product.specs?.ram;
      if (!ram) return false;
      return filters.rams.some((filterRam) =>
        ram.toLowerCase().includes(filterRam.toLowerCase()),
      );
    });
  }

  return result;
}