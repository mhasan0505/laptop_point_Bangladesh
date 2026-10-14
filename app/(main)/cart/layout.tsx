import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart | Laptop Point Bangladesh",
  description: "View and manage items in your shopping cart.",
  alternates: {
    canonical: "https://laptoppointbd.com/cart",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
