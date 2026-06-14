import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Used Laptops in Dhaka, Bangladesh",
  description:
    "Browse HP, Dell, Lenovo, and Surface laptops with updated prices, specs, and warranty options at Laptop Point Bangladesh, located in Mirpur, Dhaka.",
  alternates: {
    canonical: "https://laptoppointbd.com/shop",
  },
  openGraph: {
    title: "Shop Used Laptops in Dhaka, Bangladesh",
    description:
      "Browse HP, Dell, Lenovo, and Surface laptops with updated prices, specs, and warranty options at our store in Mirpur, Dhaka.",
    url: "https://laptoppointbd.com/shop",
    type: "website",
    images: ["/Hero_Image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Used Laptops in Dhaka, Bangladesh",
    description:
      "Browse HP, Dell, Lenovo, and Surface laptops with updated prices, specs, and warranty options at our store in Mirpur, Dhaka.",
    images: ["/Hero_Image.png"],
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
