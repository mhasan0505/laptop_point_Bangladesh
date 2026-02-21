// Lightweight search index - only essential data for search
// This prevents loading the full 46KB products.json in the Header
export interface SearchItem {
  id: string | number;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  image: string;
}

// This will be generated from products.json but only includes search-relevant fields
// Reducing bundle size significantly for components that only need basic product info
export async function getSearchIndex(): Promise<SearchItem[]> {
  // Dynamic import only when search is triggered
  const { laptopData } = await import("@/app/data/data");

  return laptopData.laptops.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand || "",
    category: product.category || "",
    price: product.price,
    image: typeof product.image === 'string' ? product.image : product.image.src,
  }));
}

// For components that need immediate access (like search suggestions)
// This creates a smaller index with only 5-6 fields per product
export function createLightweightIndex(products: Array<{
  id: string | number;
  name: string;
  slug: string;
  brand?: string;
  category?: string;
  price: number;
  image: string;
}>): SearchItem[] {
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand || "",
    category: p.category || "",
    price: p.price,
    image: p.image,
  }));
}
