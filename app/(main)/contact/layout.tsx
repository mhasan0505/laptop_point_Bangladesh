import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Laptop Point Bangladesh in Mirpur, Dhaka",
  description:
    "Contact Laptop Point BD for sales, support, and inquiries. Visit our store at Madbar Mansion, Mirpur-10, Dhaka or reach us by phone at +8801612182408.",
  alternates: {
    canonical: "https://laptoppointbd.com/contact",
  },
  openGraph: {
    title: "Contact Laptop Point Bangladesh in Mirpur, Dhaka",
    description:
      "Contact Laptop Point BD for sales, support, and inquiries. Visit our store in Mirpur-10, Dhaka.",
    url: "https://laptoppointbd.com/contact",
    type: "website",
    images: ["/Hero_Image.png"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
