import { laptopData } from "@/app/data/data";

export interface AdminProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  sku: string;
  images: string[];
}

export interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: string;
  lowStockItems: number;
  deliveredToday: number;
}

export interface OrderData {
  id: string;
  customer: string;
  amount: string;
  status: string;
  date: string;
  paymentMethod?: string;
}

// Convert website products to admin format
export function getAdminProducts(): AdminProduct[] {
  return laptopData.laptops.map((product) => ({
    id: String(product.id),
    name: product.name,
    brand: product.brand || "Unknown",
    category: product.category || "Laptop",
    price: product.price,
    stock: product.inStock ? Math.floor(Math.random() * 50) + 5 : 0, // Random stock for now
    status: product.inStock ? "Active" : "Out of Stock",
    sku: String(product.sku || product.id),
    images: (product.images || []).map((img) =>
      typeof img === "string" ? img : img.src,
    ),
  }));
}

export function getAdminStats(): AdminStats {
  const products = getAdminProducts();
  const lowStockThreshold = 10;

  return {
    totalProducts: products.length,
    totalOrders: 0, // Will be implemented with order management
    pendingOrders: 0,
    totalRevenue: "৳0",
    lowStockItems: products.filter(
      (p) => p.stock < lowStockThreshold && p.stock > 0,
    ).length,
    deliveredToday: 0,
  };
}

export function getMockOrders(): OrderData[] {
  // Mock orders for now - replace with real order system later
  return [
    {
      id: "#ORD001",
      customer: "Ahmed Hassan",
      amount: "৳82,450",
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "bKash",
    },
    {
      id: "#ORD002",
      customer: "Fatima Rahman",
      amount: "৳45,900",
      status: "Processing",
      date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      paymentMethod: "Cash on Delivery",
    },
    {
      id: "#ORD003",
      customer: "Karim Sheikh",
      amount: "৳128,000",
      status: "Delivered",
      date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
      paymentMethod: "Card",
    },
  ];
}
