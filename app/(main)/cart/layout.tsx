import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review selected products in your cart before checkout.",
  alternates: {
    canonical: "https://laptoppointbd.com/cart",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
