import ContactClient from "@/components/application/ContactClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & Showroom Location | Laptop Point Bangladesh",
  description:
    "Visit our Mirpur-10 showroom in Dhaka or contact Laptop Point BD via phone, WhatsApp, and email for sales and support.",
  alternates: {
    canonical: "https://laptoppointbd.com/contact",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
