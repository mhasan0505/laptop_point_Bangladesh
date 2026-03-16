import { AdminProduct, AdminStats, OrderData } from "./admin-data";
import { client } from "./sanity.client";

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
 * Fetch all products from Sanity
 */
export async function fetchProducts(): Promise<AdminProduct[]> {
  const query = `*[_type == "product"] | order(_createdAt desc) {
    _id,
    name,
    sku,
    brand,
    category,
    price,
    stock,
    lowStockThreshold,
    inStock,
    status,
    images[] {
      asset-> { url }
    }
  }`;

  try {
    const products = await client.fetch<SanityProduct[]>(query);

    return products.map((product) => {
      const stock = product.stock || 0;
      const lowStock = product.lowStockThreshold || 10;

      let status = product.status === "active" ? "Active" : "Inactive";
      if (stock === 0) status = "Out of Stock";
      else if (stock < lowStock) status = "Low Stock";

      return {
        id: product._id,
        name: product.name,
        brand: product.brand || "Unknown",
        category: product.category || "Laptop",
        price: product.price,
        stock: stock,
        status: status,
        sku: product.sku,
        images: product.images?.map((img) => img.asset.url || "") || [],
      };
    });
  } catch (error) {
    console.error("Error fetching products from Sanity:", error);
    return [];
  }
}

/**
 * Update product stock in Sanity
 */
export async function updateProductStock(
  productId: string,
  newStock: number,
): Promise<boolean> {
  try {
    await client
      .patch(productId)
      .set({
        stock: newStock,
        inStock: newStock > 0,
      })
      .commit();
    return true;
  } catch (error) {
    console.error("Error updating product stock:", error);
    return false;
  }
}

/**
 * Update product details in Sanity
 */
export async function updateProduct(
  productId: string,
  updates: Partial<{
    name: string;
    sku: string;
    brand: string;
    category: string;
    price: number;
    stock: number;
    status: string;
    description: string;
  }>,
): Promise<boolean> {
  try {
    const patch: Record<string, string | number | boolean> = {};

    if (updates.name) patch.name = updates.name;
    if (updates.sku) patch.sku = updates.sku;
    if (updates.brand) patch.brand = updates.brand;
    if (updates.category) patch.category = updates.category;
    if (updates.price !== undefined) patch.price = updates.price;
    if (updates.stock !== undefined) {
      patch.stock = updates.stock;
      patch.inStock = updates.stock > 0;
    }
    if (updates.status) {
      patch.status = updates.status.toLowerCase();
    }
    if (updates.description) patch.description = updates.description;

    await client.patch(productId).set(patch).commit();
    return true;
  } catch (error) {
    console.error("Error updating product:", error);
    return false;
  }
}

/**
 * Delete a product from Sanity
 */
export async function deleteProduct(productId: string): Promise<boolean> {
  try {
    await client.delete(productId);
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
}

// ============= ORDER OPERATIONS =============

/**
 * Fetch all orders from Sanity
 */
export async function fetchOrders(): Promise<OrderData[]> {
  const query = `*[_type == "order"] | order(orderDate desc) {
    _id,
    orderNumber,
    customer,
    items[] {
      product-> { name },
      quantity,
      price
    },
    totalAmount,
    status,
    paymentMethod,
    paymentStatus,
    orderDate,
    deliveryDate,
    trackingNumber
  }`;

  try {
    const orders = await client.fetch<SanityOrder[]>(query);

    return orders.map((order) => {
      const statusMap: Record<string, string> = {
        pending: "Pending",
        processing: "Processing",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled",
      };

      const paymentMethodMap: Record<string, string> = {
        cod: "Cash on Delivery",
        bkash: "bKash",
        nagad: "Nagad",
        card: "Card",
        bank_transfer: "Bank Transfer",
      };

      return {
        id: order.orderNumber,
        customer: order.customer.name,
        amount: `৳${order.totalAmount.toLocaleString()}`,
        status: statusMap[order.status] || order.status,
        date: new Date(order.orderDate).toISOString().split("T")[0],
        paymentMethod:
          paymentMethodMap[order.paymentMethod] || order.paymentMethod,
      };
    });
  } catch (error) {
    console.error("Error fetching orders from Sanity:", error);
    return [];
  }
}

/**
 * Create a new order in Sanity
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
  try {
    // Generate order number
    const orderNumber = `#ORD${Date.now().toString().slice(-6)}`;

    const order = {
      _type: "order",
      orderNumber,
      customer: orderData.customer,
      items: orderData.items.map((item) => ({
        _type: "object",
        _key: Math.random().toString(36).substring(7),
        product: {
          _type: "reference",
          _ref: item.productId,
        },
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: orderData.totalAmount,
      status: "pending",
      paymentMethod: orderData.paymentMethod.toLowerCase(),
      paymentStatus: "pending",
      notes: orderData.notes,
      orderDate: new Date().toISOString(),
    };

    const result = await client.create(order);

    // Update stock for ordered items
    for (const item of orderData.items) {
      const product = await client.fetch<SanityProduct>(
        `*[_type == "product" && _id == $id][0]`,
        { id: item.productId },
      );

      if (product && product.stock >= item.quantity) {
        await updateProductStock(item.productId, product.stock - item.quantity);
      }
    }

    return result._id;
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled",
): Promise<boolean> {
  try {
    await client.patch(orderId).set({ status }).commit();
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    return false;
  }
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminStatsFromSanity(): Promise<AdminStats> {
  try {
    const products = await fetchProducts();
    const orders = await fetchOrders();

    const totalProducts = products.length;
    const lowStockItems = products.filter(
      (p) => p.stock < 10 && p.stock > 0,
    ).length;

    const pendingOrders = orders.filter((o) => o.status === "Pending").length;
    const deliveredToday = orders.filter((o) => {
      const orderDate = new Date(o.date);
      const today = new Date();
      return (
        o.status === "Delivered" &&
        orderDate.toDateString() === today.toDateString()
      );
    }).length;

    const totalRevenue = orders
      .filter((o) => o.status === "Delivered")
      .reduce((sum, order) => {
        const amount = parseInt(order.amount.replace(/[^0-9]/g, ""));
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

    return {
      totalProducts,
      totalOrders: orders.length,
      pendingOrders,
      totalRevenue: `৳${totalRevenue.toLocaleString()}`,
      lowStockItems,
      deliveredToday,
    };
  } catch (error) {
    console.error("Error getting stats:", error);
    return {
      totalProducts: 0,
      totalOrders: 0,
      pendingOrders: 0,
      totalRevenue: "৳0",
      lowStockItems: 0,
      deliveredToday: 0,
    };
  }
}
