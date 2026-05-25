import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Laptop Point Bangladesh",
  description:
    "Contact Laptop Point Bangladesh for sales, support, and product inquiries. Visit our store or reach us by phone and email.",
  alternates: {
    canonical: "https://laptoppointbd.com/contact",
  },
  openGraph: {
    title: "Contact Laptop Point Bangladesh",
    description:
      "Contact Laptop Point Bangladesh for sales, support, and product inquiries.",
    url: "https://laptoppointbd.com/contact",
    type: "website",
    images: ["/Hero_Image.png"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
