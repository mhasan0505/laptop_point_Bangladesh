import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Used & Refurbished Laptops in Bangladesh",
  description:
    "Browse HP, Dell, Lenovo, and Surface laptops with updated prices, specs, and warranty options at Laptop Point Bangladesh.",
  alternates: {
    canonical: "https://laptoppointbd.com/shop",
  },
  openGraph: {
    title: "Shop Used & Refurbished Laptops in Bangladesh",
    description:
      "Browse HP, Dell, Lenovo, and Surface laptops with updated prices, specs, and warranty options.",
    url: "https://laptoppointbd.com/shop",
    type: "website",
    images: ["/Hero_Image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Used & Refurbished Laptops in Bangladesh",
    description:
      "Browse HP, Dell, Lenovo, and Surface laptops with updated prices, specs, and warranty options.",
    images: ["/Hero_Image.png"],
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
