export interface AdminProduct {
  id: string;
  name: string;
  brand: string;
  model?: string;
  category: string;
  condition?: string;
  grade?: string;
  price: number;
  salePrice?: number;
  currency?: string;
  taxIncluded?: boolean;
  stock: number;
  stockStatus?: string;
  lowStockThreshold?: number;
  status: string;
  statusValue?: "active" | "draft" | "archived";
  featured?: boolean;
  sku: string;
  images: string[];
  description?: string;
  fullDescription?: string;
  tags?: string[];
  features?: string[];
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

export function getAdminStats(): AdminStats {
  return {
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: "৳0",
    lowStockItems: 0,
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
