import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist | Laptop Point Bangladesh",
  description: "View saved laptops and accessories in your wishlist.",
  alternates: {
    canonical: "https://laptoppointbd.com/wishlist",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
