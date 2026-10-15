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
  sku?: string;
  processor?: string;
  type?: "laptop" | "accessory";
}

// This will be generated from products.json and accessories.json but only includes search-relevant fields
// Reducing bundle size significantly for components that only need basic product info
export async function getSearchIndex(): Promise<SearchItem[]> {
  try {
    const [productsRes, accessoriesRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/accessories").catch(() => null),
    ]);

    const items: SearchItem[] = [];

    if (productsRes.ok) {
      const products = await productsRes.json();
      if (Array.isArray(products)) {
        for (const product of products) {
          items.push({
            id: product.id,
            name: product.name,
            slug: product.slug,
            brand: product.brand || "",
            category: product.category || "",
            price: product.price,
            image: typeof product.image === "string" ? product.image : product.image?.src || "/Hero_Image.png",
            sku: product.sku || "",
            processor: product.specs?.processor || "",
            type: "laptop",
          });
        }
      }
    }

    if (accessoriesRes && accessoriesRes.ok) {
      const accessories = await accessoriesRes.json();
      const list = Array.isArray(accessories)
        ? accessories
        : Array.isArray(accessories?.accessories)
        ? accessories.accessories
        : [];
      for (const acc of list) {
        items.push({
          id: acc.id,
          name: acc.name,
          slug: acc.slug || String(acc.id),
          brand: acc.brand || "",
          category: acc.category || "Accessories",
          price: acc.price || acc.regular_price || 0,
          image: Array.isArray(acc.images) && acc.images[0] ? acc.images[0] : acc.image || "/images/placeholder-accessory.png",
          sku: acc.sku || "",
          type: "accessory",
        });
      }
    }

    return items;
  } catch (err) {
    console.error("Failed to load search index:", err);
  }

  return [];
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
