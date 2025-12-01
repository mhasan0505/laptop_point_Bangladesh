export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  condition?: string;
  color?: string;
  specs?: {
    processor?: string;
    ram?: string;
    storage?: string;
    display?: string;
  };
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getShipping: () => number;
}

export interface CheckoutFormData {
  // Customer Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Shipping Address
  address: string;
  city: string;
  postalCode: string;
  district: string;

  // Payment
  paymentMethod: PaymentMethod;

  // Additional
  orderNotes?: string;
  agreeToTerms: boolean;
}

export type PaymentMethod = "cod" | "bkash" | "nagad" | "card";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
