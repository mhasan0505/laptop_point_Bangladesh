import { Prisma } from "@prisma/client";
import { AdminProduct, AdminStats, OrderData } from "./admin-data";
import { prisma } from "./prisma";
import { client, writeClient } from "./sanity.client";

const adminReadClient = process.env.SANITY_API_TOKEN ? writeClient : client;

const SANITY_PRODUCT_PROJECTION = `
  _id,
  name,
  slug,
  sku,
  brand,
  model,
  category,
  condition,
  grade,
  description,
  fullDescriptionText,
  price,
  salePrice,
  currency,
  taxIncluded,
  stock,
  stockStatus,
  lowStockThreshold,
  inStock,
  status,
  featured,
  tags,
  features,
  imageUrls,
  specs,
  warranty,
  images[] {
    asset-> { url }
  }
`;

function slugifyProductName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function ensureUniqueSlug(slug: string, excludeProductId?: string) {
  const existingProductWithSlug = await adminReadClient.fetch<{
    _id: string;
  } | null>(
    `*[_type == "product" && slug.current == $slug && (!defined($excludeId) || _id != $excludeId)][0]{ _id }`,
    {
      slug,
      excludeId: excludeProductId,
    },
  );

  if (existingProductWithSlug?._id) {
    throw new Error(`Slug "${slug}" already exists.`);
  }
}

function compactObject<T extends Record<string, unknown>>(value?: T) {
  if (!value) {
    return undefined;
  }

  const entries = Object.entries(value).filter(
    ([, entry]) => entry !== undefined,
  );
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function getProductImageUrls(
  product: Pick<SanityProduct, "imageUrls" | "images">,
) {
  const sanityImageUrls =
    product.images?.map((image) => image.asset.url || "").filter(Boolean) || [];

  return sanityImageUrls.length > 0 ? sanityImageUrls : product.imageUrls || [];
}

async function fetchSanityProductById(productId: string) {
  return adminReadClient.fetch<SanityProduct | null>(
    `*[_type == "product" && _id == $id][0] {${SANITY_PRODUCT_PROJECTION}}`,
    { id: productId },
  );
}

async function syncProductToNeon(product: SanityProduct) {
  const images = getProductImageUrls(product);
  const lowStockThreshold = product.lowStockThreshold ?? 10;
  const specs = compactObject(product.specs) as
    | Prisma.InputJsonValue
    | undefined;
  const warranty = compactObject(product.warranty) as
    | Prisma.InputJsonValue
    | undefined;

  await prisma.$transaction([
    prisma.product.upsert({
      where: { sanityId: product._id },
      update: {
        sku: product.sku,
        slug: product.slug?.current,
        name: product.name,
        brand: product.brand,
        category: product.category,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock || 0,
        lowStockThreshold,
        status: product.status,
        featured: Boolean(product.featured),
        tags: product.tags || [],
        images,
        specs,
        warranty,
      },
      create: {
        sanityId: product._id,
        sku: product.sku,
        slug: product.slug?.current,
        name: product.name,
        brand: product.brand,
        category: product.category,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock || 0,
        lowStockThreshold,
        status: product.status,
        featured: Boolean(product.featured),
        tags: product.tags || [],
        images,
        specs,
        warranty,
      },
    }),
    prisma.inventory.upsert({
      where: { productId: product._id },
      update: {
        name: product.name,
        sku: product.sku,
        quantity: product.stock || 0,
      },
      create: {
        productId: product._id,
        sku: product.sku,
        name: product.name,
        quantity: product.stock || 0,
        reserved: 0,
      },
    }),
  ]);
}

// ============= PRODUCT OPERATIONS =============

export interface SanityProduct {
  _id: string;
  _type: "product";
  name: string;
  slug: { current: string };
  sku: string;
  brand: string;
  model?: string;
  category: string;
  condition?: string;
  grade?: string;
  description?: string;
  fullDescriptionText?: string;
  price: number;
  salePrice?: number;
  currency?: string;
  taxIncluded?: boolean;
  stock: number;
  stockStatus?: string;
  lowStockThreshold?: number;
  inStock: boolean;
  status: "active" | "draft" | "archived";
  featured?: boolean;
  tags?: string[];
  features?: string[];
  imageUrls?: string[];
  images?: Array<{ asset: { _ref: string; url?: string } }>;
  specs?: {
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
  warranty?: {
    period?: string;
    type?: string;
    details?: string;
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
 * Fetch all products from Sanity & background-sync them to PostgreSQL
 */
export async function fetchProducts(): Promise<AdminProduct[]> {
  const query = `*[_type == "product" && !(_id in path("drafts.**"))] | order(_createdAt desc) {${SANITY_PRODUCT_PROJECTION}}`;

  try {
    const products = await adminReadClient.fetch<SanityProduct[]>(query);

    // Asynchronous background sync to PostgreSQL (Neon) via Prisma
    Promise.resolve().then(async () => {
      try {
        for (const p of products) {
          await syncProductToNeon(p);
        }
      } catch (err) {
        console.error("Error background syncing products to PostgreSQL:", err);
      }
    });

    return products.map((product) => {
      const stock = product.stock || 0;
      const lowStock = product.lowStockThreshold || 10;
      const finalImageUrls = getProductImageUrls(product);

      let status = "Active";
      if (product.status === "draft") status = "Draft";
      if (product.status === "archived") status = "Archived";
      if (product.status !== "archived") {
        if (stock === 0) status = "Out of Stock";
        else if (stock < lowStock) status = "Low Stock";
      }

      return {
        id: product._id,
        slug: product.slug?.current,
        name: product.name,
        brand: product.brand || "Unknown",
        model: product.model,
        category: product.category || "Laptop",
        condition: product.condition,
        grade: product.grade,
        price: product.price,
        salePrice: product.salePrice,
        currency: product.currency || "BDT",
        taxIncluded: product.taxIncluded ?? true,
        stock: stock,
        stockStatus: product.stockStatus,
        lowStockThreshold: lowStock,
        status: status,
        statusValue: product.status,
        featured: product.featured || false,
        sku: product.sku,
        images: finalImageUrls,
        description: product.description,
        fullDescription: product.fullDescriptionText,
        tags: product.tags || [],
        features: product.features || [],
        specs: product.specs || {},
        warranty: product.warranty,
      };
    });
  } catch (error) {
    console.error("Error fetching products from Sanity:", error);
    return [];
  }
}

/**
 * Add a new product to both Sanity CMS and PostgreSQL
 */
export async function addProduct(
  product: Omit<AdminProduct, "id">,
): Promise<string> {
  try {
    const existingProductWithSku = await adminReadClient.fetch<{
      _id: string;
    } | null>(`*[_type == "product" && sku == $sku][0]{ _id }`, {
      sku: product.sku,
    });

    if (existingProductWithSku?._id) {
      throw new Error(`SKU \"${product.sku}\" already exists.`);
    }

    const slug = slugifyProductName(product.name);
    await ensureUniqueSlug(slug);

    const sanityDoc = {
      _type: "product",
      name: product.name,
      slug: { _type: "slug", current: slug },
      sku: product.sku,
      brand: product.brand,
      model: product.model || undefined,
      category: product.category,
      condition: product.condition || undefined,
      grade: product.grade || undefined,
      description: product.description || undefined,
      fullDescriptionText: product.fullDescription || undefined,
      price: product.price,
      salePrice: product.salePrice,
      currency: product.currency || "BDT",
      taxIncluded: product.taxIncluded ?? true,
      stock: product.stock,
      stockStatus: product.stockStatus || undefined,
      lowStockThreshold: product.lowStockThreshold ?? 10,
      inStock: product.stock > 0,
      status:
        product.status.toLowerCase() === "archived"
          ? "archived"
          : product.status.toLowerCase() === "active"
            ? "active"
            : "draft",
      featured: Boolean(product.featured),
      tags: product.tags || [],
      features: product.features || [],
      imageUrls: product.images || [],
      specs: product.specs || undefined,
      warranty: product.warranty || undefined,
    };

    const result = await writeClient.create(sanityDoc);

    // Best-effort Neon sync. Product creation succeeds as long as Sanity write succeeds.
    fetchSanityProductById(result._id)
      .then((createdProduct) => {
        if (!createdProduct) {
          throw new Error("Created product could not be reloaded from Sanity.");
        }
        return syncProductToNeon(createdProduct);
      })
      .catch((inventoryError) => {
        const details =
          inventoryError instanceof Error
            ? inventoryError.message
            : "Unknown database error";
        console.warn(
          `Product created in Sanity, but inventory sync to Neon failed (${details}).`,
        );
      });

    return result._id;
  } catch (error) {
    console.error("Error adding product in Sanity:", error);
    throw error;
  }
}

/**
 * Update product stock in both Sanity CMS and PostgreSQL
 */
export async function updateProductStock(
  productId: string,
  newStock: number,
): Promise<boolean> {
  try {
    // 1. Update Sanity CMS
    await writeClient
      .patch(productId)
      .set({
        stock: newStock,
        inStock: newStock > 0,
      })
      .commit();

    const product = await fetchSanityProductById(productId);

    if (product) {
      try {
        await syncProductToNeon(product);
      } catch (inventoryError) {
        const details =
          inventoryError instanceof Error
            ? inventoryError.message
            : "Unknown database error";
        console.warn(
          `Stock updated in Sanity, but Neon sync failed (${details}).`,
        );
      }
    }

    return true;
  } catch (error) {
    console.error("Error updating product stock:", error);
    return false;
  }
}

/**
 * Update product details in both Sanity CMS and PostgreSQL
 */
export async function updateProduct(
  productId: string,
  updates: Partial<{
    name: string;
    sku: string;
    brand: string;
    model: string;
    category: string;
    condition: string;
    grade: string;
    price: number;
    stock: number;
    status: string;
    description: string;
    fullDescription: string;
    salePrice: number;
    currency: string;
    taxIncluded: boolean;
    stockStatus: string;
    lowStockThreshold: number;
    featured: boolean;
    tags: string[];
    features: string[];
    specs: {
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
    warranty: {
      period?: string;
      type?: string;
      details?: string;
    };
    images: string[];
  }>,
): Promise<boolean> {
  try {
    const patch: Record<string, any> = {};

    if (updates.name) {
      const nextSlug = slugifyProductName(updates.name);
      await ensureUniqueSlug(nextSlug, productId);
      patch.name = updates.name;
      patch.slug = { _type: "slug", current: nextSlug };
    }

    if (updates.sku) {
      const existingProductWithSku = await adminReadClient.fetch<{
        _id: string;
      } | null>(`*[_type == "product" && sku == $sku && _id != $id][0]{ _id }`, {
        sku: updates.sku,
        id: productId,
      });

      if (existingProductWithSku?._id) {
        throw new Error(`SKU "${updates.sku}" already exists.`);
      }

      patch.sku = updates.sku;
    }

    if (updates.brand) patch.brand = updates.brand;
    if (updates.model !== undefined) patch.model = updates.model;
    if (updates.category) patch.category = updates.category;
    if (updates.condition !== undefined) patch.condition = updates.condition;
    if (updates.grade !== undefined) patch.grade = updates.grade;
    if (updates.price !== undefined) patch.price = updates.price;
    if (updates.stock !== undefined) {
      patch.stock = updates.stock;
      patch.inStock = updates.stock > 0;
    }
    if (updates.status) {
      patch.status = updates.status.toLowerCase();
    }
    if (updates.description !== undefined)
      patch.description = updates.description;
    if (updates.fullDescription !== undefined) {
      patch.fullDescriptionText = updates.fullDescription;
    }
    if (updates.salePrice !== undefined) patch.salePrice = updates.salePrice;
    if (updates.currency !== undefined) patch.currency = updates.currency;
    if (updates.taxIncluded !== undefined) {
      patch.taxIncluded = updates.taxIncluded;
    }
    if (updates.stockStatus !== undefined) {
      patch.stockStatus = updates.stockStatus;
    }
    if (updates.lowStockThreshold !== undefined) {
      patch.lowStockThreshold = updates.lowStockThreshold;
    }
    if (updates.featured !== undefined) patch.featured = updates.featured;
    if (updates.tags !== undefined) patch.tags = updates.tags;
    if (updates.features !== undefined) patch.features = updates.features;
    if (updates.specs !== undefined) patch.specs = updates.specs;
    if (updates.warranty !== undefined) patch.warranty = updates.warranty;
    if (updates.images !== undefined) patch.imageUrls = updates.images;

    // 1. Update Sanity CMS
    await writeClient.patch(productId).set(patch).commit();

    const updatedProduct = await fetchSanityProductById(productId);

    if (updatedProduct) {
      try {
        await syncProductToNeon(updatedProduct);
      } catch (inventoryError) {
        const details =
          inventoryError instanceof Error
            ? inventoryError.message
            : "Unknown database error";
        console.warn(
          `Product updated in Sanity, but Neon sync failed (${details}).`,
        );
      }
    }

    return true;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

/**
 * Delete a product from both Sanity CMS and PostgreSQL
 */
export async function deleteProduct(productId: string): Promise<boolean> {
  try {
    // 1. Delete from Sanity
    await writeClient.delete(productId);

    // 2. Delete from PostgreSQL Product + Inventory snapshots
    try {
      await prisma.$transaction([
        prisma.product.deleteMany({
          where: { sanityId: productId },
        }),
        prisma.inventory.deleteMany({
          where: { productId },
        }),
      ]);
    } catch (inventoryError) {
      const details =
        inventoryError instanceof Error
          ? inventoryError.message
          : "Unknown database error";
      console.warn(
        `Product deleted in Sanity, but Neon cleanup failed (${details}).`,
      );
    }

    return true;
  } catch (error) {
    console.error("Error deleting product from Sanity:", error);
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
    const orders = await adminReadClient.fetch<SanityOrder[]>(query);

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

    const result = await writeClient.create(order);

    // Update stock for ordered items
    for (const item of orderData.items) {
      const product = await adminReadClient.fetch<SanityProduct>(
        `*[_type == "product" && _id == $id][0]`,
        { id: item.productId },
      );

      if (product && product.stock >= item.quantity) {
        await updateProductStock(item.productId, product.stock - item.quantity);
      }
    }

    return result._id;
  } catch (error) {
    console.error("Error creating order in Sanity:", error);
    return null;
  }
}

/**
 * Update order status in Sanity
 */
export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled",
): Promise<boolean> {
  try {
    await writeClient.patch(orderId).set({ status }).commit();
    return true;
  } catch (error) {
    console.error("Error updating order status in Sanity:", error);
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
    console.error("Error getting stats from Sanity:", error);
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
