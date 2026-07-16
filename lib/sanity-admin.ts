// Sanity removed — all data served from local JSON and mock data.
// TODO: Reconnect Sanity by restoring the original implementation.

import productsRaw from "@/app/data/products.json";
import { RawProduct } from "@/types/raw-product";
import {
  AdminProduct,
  AdminStats,
  getMockOrders,
  OrderData,
} from "./admin-data";

// ============= LOCAL HELPERS =============

function mapJsonToAdminProducts(): AdminProduct[] {
  return (productsRaw as RawProduct[]).map((product) => {
    const stock = product.stock?.quantity ?? 0;
    let status = "Active";
    if (stock === 0) status = "Out of Stock";
    else if (stock < 5) status = "Low Stock";
    return {
      id: String(product.id),
      name: product.name,
      brand: product.brand || "Unknown",
      category: product.category || "Laptop",
      price: product.pricing?.sale_price ?? 0,
      stock,
      status,
      sku: product.sku || String(product.id),
      images: product.images || [],
    };
  });
}

// In-memory order store (resets on page refresh)
let _orders: OrderData[] = getMockOrders();

// In-memory product store (initialized from JSON, persists within browser tab session)
let _products: AdminProduct[] | null = null;

function getProductsStore(): AdminProduct[] {
  if (!_products) {
    _products = mapJsonToAdminProducts();
  }
  return _products;
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
  return [...getProductsStore()];
}

/**
 * Add a new product to the in-memory store
 */
export async function addProduct(
  product: Omit<AdminProduct, "id">,
): Promise<string> {
  const store = getProductsStore();
  const id = `prod_${Date.now()}`;
  const stock = product.stock ?? 0;
  let status = product.status || "Active";
  if (stock === 0) status = "Out of Stock";
  else if (stock < 5) status = "Low Stock";
  store.push({ ...product, id, stock, status });
  return id;
}

/**
 * Update product stock (in-memory store)
 */
export async function updateProductStock(
  productId: string,
  newStock: number,
): Promise<boolean> {
  const store = getProductsStore();
  const idx = store.findIndex((p) => p.id === productId);
  if (idx === -1) return false;
  const updated = { ...store[idx], stock: newStock };
  if (newStock === 0) updated.status = "Out of Stock";
  else if (newStock < 5) updated.status = "Low Stock";
  else if (updated.status === "Out of Stock" || updated.status === "Low Stock")
    updated.status = "Active";
  store[idx] = updated;
  return true;
}

/**
 * Update product details (in-memory store)
 */
export async function updateProduct(
  productId: string,
  updates: Partial<AdminProduct>,
): Promise<boolean> {
  const store = getProductsStore();
  const idx = store.findIndex((p) => p.id === productId);
  if (idx === -1) return false;
  const merged = { ...store[idx], ...updates };
  // Recompute auto-status from stock unless explicitly set
  if (updates.stock !== undefined && updates.status === undefined) {
    if (merged.stock === 0) merged.status = "Out of Stock";
    else if (merged.stock < 5) merged.status = "Low Stock";
  }
  store[idx] = merged;
  return true;
}

/**
 * Delete a product (in-memory store)
 */
export async function deleteProduct(productId: string): Promise<boolean> {
  const store = getProductsStore();
  const idx = store.findIndex((p) => p.id === productId);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

// ============= ORDER OPERATIONS =============

/**
 * Fetch all orders from in-memory store
 */
export async function fetchOrders(): Promise<OrderData[]> {
  return [..._orders];
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
  const orderId = `#ORD${Date.now().toString().slice(-6)}`;
  const paymentMethodMap: Record<string, string> = {
    cod: "Cash on Delivery",
    bkash: "bKash",
    nagad: "Nagad",
    card: "Card",
    bank_transfer: "Bank Transfer",
  };
  _orders = [
    {
      id: orderId,
      customer: orderData.customer.name,
      amount: `৳${orderData.totalAmount.toLocaleString()}`,
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
      paymentMethod:
        paymentMethodMap[orderData.paymentMethod] ?? orderData.paymentMethod,
    },
    ..._orders,
  ];
  return orderId;
}

/**
 * Update order status (in-memory)
 */
export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled",
): Promise<boolean> {
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  _orders = _orders.map((o) =>
    o.id === orderId ? { ...o, status: statusLabel } : o,
  );
  return true;
}

/**
 * Get admin dashboard statistics from local data
 */
export async function getAdminStatsFromSanity(): Promise<AdminStats> {
  const products = mapJsonToAdminProducts();
  const orders = _orders;
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
