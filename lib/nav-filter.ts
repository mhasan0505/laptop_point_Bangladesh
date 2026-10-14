import productsRaw from "@/app/data/products.json";
import accessoriesRaw from "@/app/data/accessories.json";
import { normalizeToken } from "./product-filter";

interface RawProductItem {
  category?: string;
  inStock?: boolean;
  stock?: number | { quantity?: number; status?: string };
}

interface RawAccessoryItem {
  category?: string;
  active?: boolean;
}

// Compute live counts from data files
function getProductCounts(): Map<string, number> {
  const map = new Map<string, number>();
  for (const p of productsRaw as RawProductItem[]) {
    if (p.category) {
      const norm = normalizeToken(p.category);
      map.set(norm, (map.get(norm) ?? 0) + 1);
    }
  }
  return map;
}

function getAccessoryCounts(): Map<string, number> {
  const map = new Map<string, number>();
  for (const a of accessoriesRaw as RawAccessoryItem[]) {
    if (a.active !== false && a.category) {
      const norm = normalizeToken(a.category);
      map.set(norm, (map.get(norm) ?? 0) + 1);
    }
  }
  return map;
}

const laptopCategoryCounts = getProductCounts();
const accessoryCategoryCounts = getAccessoryCounts();

/**
 * Check whether a category URL currently has at least 1 public product in data.
 * Non-category URLs (e.g. /shop, /accessories, /deals, brand filters) return true.
 */
export function isCategoryHrefAvailable(href?: string): boolean {
  if (!href) return false;
  if (!href.includes("category=")) return true;

  try {
    const url = new URL(href, "https://laptoppointbd.com");
    const categoryParam = url.searchParams.get("category");
    if (!categoryParam) return true;

    const norm = normalizeToken(categoryParam);

    if (url.pathname.startsWith("/accessories")) {
      return (accessoryCategoryCounts.get(norm) ?? 0) > 0;
    }
    if (url.pathname.startsWith("/shop")) {
      return (laptopCategoryCounts.get(norm) ?? 0) > 0;
    }
    return true;
  } catch {
    return true;
  }
}

/**
 * Filter an array of items with `href` properties to remove category links with 0 products.
 */
export function filterLinksWithProducts<T extends { href: string; name?: string; label?: string }>(
  items: T[]
): T[] {
  return items.filter((item) => isCategoryHrefAvailable(item.href));
}
