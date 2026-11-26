import productsRaw from "@/app/data/products.json";
import accessoriesRaw from "@/app/data/accessories.json";
import type { Product } from "@/types/product";
import { resolveAccessoryCategorySlug } from "./accessory-types";
import { matchesCategory, normalizeToken } from "./product-filter";

interface RawAccessoryItem {
  category?: string;
  active?: boolean;
}

const allLaptops = productsRaw as unknown as Product[];

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

    if (url.pathname.startsWith("/accessories")) {
      const resolvedSlug = resolveAccessoryCategorySlug(categoryParam);
      const norm = normalizeToken(resolvedSlug ?? categoryParam);
      return (accessoryCategoryCounts.get(norm) ?? 0) > 0;
    }
    if (url.pathname.startsWith("/shop")) {
      return allLaptops.some((product) => matchesCategory(product, categoryParam));
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
