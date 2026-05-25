import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "Save your favorite laptops and accessories for later purchase.",
  alternates: {
    canonical: "https://laptoppointbd.com/wishlist",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
