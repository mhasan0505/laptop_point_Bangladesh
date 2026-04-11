import { AdminProduct, AdminStats, OrderData } from "./admin-data";

export interface AdminCatalogProduct {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  condition: string;
  grade: string | null;
  pricing: {
    currency: string;
    sale_price: number;
    market_price: number;
    discount_percentage: number;
    tax_included: boolean;
  };
  stock: {
    status: string;
    quantity: number;
    reserved: number;
  };
  specs: {
    processor: string | null;
    ram: string | null;
    storage: string | null;
    display: {
      size: string | null;
      resolution: string | null;
      type: string | null;
      touchscreen: boolean;
    };
    graphics: string | null;
    ports: string[];
    weight: string | null;
    os: string | null;
  };
  description: {
    short: string | null;
    full: string | null;
  };
  features: string[];
  images: string[];
  status: "draft" | "review" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
}

export type AdminCatalogPayload = {
  sku: string;
  slug?: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  condition?: string;
  grade?: string;
  pricing: {
    sale_price: number;
    market_price: number;
    discount_percentage?: number;
    tax_included?: boolean;
  };
  stock: {
    quantity: number;
  };
  specs?: {
    processor?: string;
    ram?: string;
    storage?: string;
    display?: {
      size?: string;
      resolution?: string;
      type?: string;
      touchscreen?: boolean;
    };
    graphics?: string;
    ports?: string[];
    weight?: string;
    os?: string;
  };
  description?: {
    short?: string;
    full?: string;
  };
  features?: string[];
  images?: string[];
  status?: "draft" | "review" | "published" | "archived";
};

async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

function mapCatalogToAdminProduct(product: AdminCatalogProduct): AdminProduct {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: product.pricing.sale_price,
    stock: product.stock.quantity,
    status: product.status,
    sku: product.sku,
    images: product.images,
  };
}

// ============= PRODUCT OPERATIONS =============

export interface SanityProduct {
  _id: string;
  _type: "product";
  name: string;
  slug: { current: string };
  sku: string;
  brand: string;
  category: string;
  description?: string;
  price: number;
  stock: number;
  lowStockThreshold?: number;
  inStock: boolean;
  status: "active" | "draft" | "archived";
  images?: Array<{ asset: { _ref: string; url?: string } }>;
  specs?: {
    processor?: string;
    ram?: string;
    storage?: string;
    display?: string;
    graphics?: string;
    battery?: string;
    weight?: string;
  };
}

export interface SanityOrder {
  _id: string;
  _type: "order";
  orderNumber: string;
  customer: {
    name: string;
    email?: string;
    phone: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
  items: Array<{
    product: {
      _ref: string;
      name?: string;
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "cod" | "bkash" | "nagad" | "card" | "bank_transfer";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  notes?: string;
  trackingNumber?: string;
  orderDate: string;
  deliveryDate?: string;
}

/**
 * Fetch all products from in-memory store (initialized from JSON)
 */
export async function fetchProducts(): Promise<AdminProduct[]> {
  const products = await fetchJson<AdminCatalogProduct[]>(
    "/api/admin/products",
  );
  return products.map(mapCatalogToAdminProduct);
}

export async function fetchCatalogProducts(): Promise<AdminCatalogProduct[]> {
  return fetchJson<AdminCatalogProduct[]>("/api/admin/products");
}

export async function fetchCatalogProductById(
  id: string,
): Promise<AdminCatalogProduct> {
  return fetchJson<AdminCatalogProduct>(`/api/admin/products/${id}`);
}

/**
 * Add a new product to the in-memory store
 */
export async function addProduct(
  product: AdminCatalogPayload,
): Promise<string> {
  const created = await fetchJson<AdminCatalogProduct>("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
  return created.id;
}

/**
 * Update product stock (in-memory store)
 */
export async function updateProductStock(
  productId: string,
  newStock: number,
): Promise<boolean> {
  await fetchJson(`/api/admin/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify({ stock: { quantity: newStock } }),
  });
  return true;
}

/**
 * Update product details (in-memory store)
 */
export async function updateProduct(
  productId: string,
  updates: Partial<AdminCatalogPayload>,
): Promise<boolean> {
  await fetchJson(`/api/admin/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return true;
}

/**
 * Delete a product (in-memory store)
 */
export async function deleteProduct(productId: string): Promise<boolean> {
  await fetchJson(`/api/admin/products/${productId}`, {
    method: "DELETE",
  });
  return true;
}

export async function restoreProduct(
  productId: string,
  status: "draft" | "review" | "published" = "published",
): Promise<boolean> {
  await fetchJson(`/api/admin/products/${productId}/restore`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
  return true;
}

export async function requestCatalogReindex(): Promise<{
  message: string;
  activeProducts: number;
  engine: string;
}> {
  return fetchJson("/api/admin/products/reindex", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function uploadAdminImage(
  file: File,
  metadata?: {
    sku?: string;
    slug?: string;
    brand?: string;
    model?: string;
  },
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  if (metadata?.sku) {
    formData.append("sku", metadata.sku);
  }
  if (metadata?.slug) {
    formData.append("slug", metadata.slug);
  }
  if (metadata?.brand) {
    formData.append("brand", metadata.brand);
  }
  if (metadata?.model) {
    formData.append("model", metadata.model);
  }

  const response = await fetch("/api/admin/upload/image", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "Image upload failed");
  }

  const result = (await response.json()) as { url: string };
  return result.url;
}

export async function rollbackProduct(
  productId: string,
  auditLogId: string,
): Promise<boolean> {
  await fetchJson(`/api/admin/products/${productId}/rollback`, {
    method: "POST",
    body: JSON.stringify({ auditLogId }),
  });
  return true;
}

// ============= ORDER OPERATIONS =============

/**
 * Fetch all orders from in-memory store
 */
export async function fetchOrders(): Promise<OrderData[]> {
  const orders = await fetchJson<
    Array<{
      id: string;
      orderNumber: string;
      customerName: string;
      totalAmount: number;
      status: string;
      createdAt: string;
      paymentMethod: string;
    }>
  >("/api/orders");

  return orders.map((o) => ({
    id: o.orderNumber,
    customer: o.customerName,
    amount: `৳${o.totalAmount.toLocaleString()}`,
    status: o.status,
    date: o.createdAt.slice(0, 10),
    paymentMethod: o.paymentMethod,
  }));
}

/**
 * Create a new order (stored in memory for this session)
 */
export async function createOrder(orderData: {
  customer: {
    name: string;
    email?: string;
    phone: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  notes?: string;
}): Promise<string | null> {
  const created = await fetchJson<{ orderNumber: string }>("/api/orders", {
    method: "POST",
    body: JSON.stringify({
      customerName: orderData.customer.name,
      customerPhone: orderData.customer.phone,
      customerEmail: orderData.customer.email,
      address: orderData.customer.address,
      city: orderData.customer.city,
      postalCode: orderData.customer.postalCode,
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes,
      items: orderData.items.map((item) => ({
        productId: item.productId,
        sku: item.productId,
        name: "Product",
        unitPrice: item.price,
        quantity: item.quantity,
      })),
      subtotal: orderData.totalAmount,
      shippingCost: 0,
      totalAmount: orderData.totalAmount,
    }),
  });

  return created.orderNumber || null;
}

/**
 * Update order status (in-memory)
 */
export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled",
): Promise<boolean> {
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  await fetchJson(`/api/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: statusLabel }),
  });
  return true;
}

/**
 * Get admin dashboard statistics from local data
 */
export async function getAdminStatsFromSanity(): Promise<AdminStats> {
  const [products, orders] = await Promise.all([
    fetchProducts(),
    fetchOrders(),
  ]);
  const totalRevenue = orders
    .filter((o) => o.status === "Delivered")
    .reduce((sum, order) => {
      const amount = parseInt(order.amount.replace(/[^0-9]/g, ""));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  return {
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "Pending").length,
    totalRevenue: `৳${totalRevenue.toLocaleString()}`,
    lowStockItems: products.filter((p) => p.stock < 10 && p.stock > 0).length,
    deliveredToday: 0,
  };
}
