import { AdminProduct } from "@/lib/admin-data";

type ProductInput = Omit<AdminProduct, "id">;
type ProductSpecs = {
  processor?: string;
  ram?: string;
  storage?: string;
  display?: string;
  displayDetails?: {
    size?: string;
    resolution?: string;
    type?: string;
    touchscreen?: boolean;
  };
  graphics?: string;
  ports?: string;
  portsList?: string[];
  battery?: string;
  weight?: string;
  dimensions?: string;
  os?: string;
};
type ProductWarranty = {
  period?: string;
  type?: string;
  details?: string;
};

async function readJsonOrThrow(response: Response) {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // Ignore JSON parse errors and keep status-based fallback message.
    }
    throw new Error(message);
  }
  return response.json();
}

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const response = await fetch("/api/admin/products", {
    cache: "no-store",
  });
  return readJsonOrThrow(response);
}

export async function createAdminProduct(
  product: ProductInput,
): Promise<string> {
  const response = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  const data = await readJsonOrThrow(response);
  return data.id;
}

export async function updateAdminProduct(
  id: string,
  updates: Partial<{
    name: string;
    sku: string;
    brand: string;
    model: string;
    category: string;
    condition: string;
    grade: string;
    price: number;
    salePrice: number;
    currency: string;
    taxIncluded: boolean;
    stock: number;
    stockStatus: string;
    lowStockThreshold: number;
    status: string;
    description: string;
    fullDescription: string;
    featured: boolean;
    tags: string[];
    features: string[];
    specs: ProductSpecs;
    warranty: ProductWarranty;
    images: string[];
    variants: {
      name: string;
      price: number;
      originalPrice?: number;
      sku?: string;
    }[];
  }>,
): Promise<void> {
  const response = await fetch(`/api/admin/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  await readJsonOrThrow(response);
}

export async function deleteAdminProduct(id: string): Promise<void> {
  const response = await fetch(`/api/admin/products/${id}`, {
    method: "DELETE",
  });
  await readJsonOrThrow(response);
}
