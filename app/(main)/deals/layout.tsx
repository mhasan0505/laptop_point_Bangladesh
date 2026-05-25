import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hot Deals on Laptops in Bangladesh",
  description:
    "Find limited-time laptop offers, discount pricing, and flash-sale deals from Laptop Point Bangladesh.",
  alternates: {
    canonical: "https://laptoppointbd.com/deals",
  },
  openGraph: {
    title: "Hot Deals on Laptops in Bangladesh",
    description:
      "Find limited-time laptop offers, discount pricing, and flash-sale deals from Laptop Point Bangladesh.",
    url: "https://laptoppointbd.com/deals",
    type: "website",
    images: ["/Hero_Image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hot Deals on Laptops in Bangladesh",
    description:
      "Find limited-time laptop offers, discount pricing, and flash-sale deals from Laptop Point Bangladesh.",
    images: ["/Hero_Image.png"],
  },
};

export default function DealsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
