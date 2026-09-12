import { AdminProduct } from "./admin-data";

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const res = await fetch("/api/admin/products", {
    cache: "no-store",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to fetch products (${res.status})`);
  }
  return res.json();
}

export async function fetchAdminProductById(id: string): Promise<AdminProduct> {
  const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to fetch product (${res.status})`);
  }
  return res.json();
}

export async function createAdminProduct(
  productData: Omit<AdminProduct, "id">,
): Promise<AdminProduct> {
  const res = await fetch("/api/admin/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to create product");
  }
  return data;
}

export async function updateAdminProduct(
  id: string,
  productData: Partial<AdminProduct>,
): Promise<AdminProduct> {
  const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to update product");
  }
  return data;
}

export async function deleteAdminProduct(id: string): Promise<boolean> {
  const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to delete product");
  }
  return true;
}
