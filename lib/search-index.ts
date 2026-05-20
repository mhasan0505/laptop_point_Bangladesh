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

// Fetches products from the admin panel API and maps to lightweight search items
export async function getSearchIndex(): Promise<SearchItem[]> {
  try {
    const response = await fetch("/api/products", { cache: "no-store" });
    if (!response.ok) return [];
    const products: Array<{
      id: string | number;
      name: string;
      slug: string;
      brand?: string;
      category?: string;
      price: number;
      image: string;
    }> = await response.json();

    if (!Array.isArray(products)) return [];

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand || "",
      category: product.category || "",
      price: product.price,
      image: typeof product.image === "string" ? product.image : "",
    }));
  } catch {
    return [];
  }
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
