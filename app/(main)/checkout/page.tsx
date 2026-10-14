import CheckoutClient from "@/components/checkout/CheckoutClient";
import { getStorefrontCommerce } from "@/lib/public-content";

export const metadata = {
  title: "Checkout | Laptop Point Bangladesh",
  description: "Complete your laptop order at Laptop Point Bangladesh.",
  alternates: {
    canonical: "https://laptoppointbd.com/checkout",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutPage() {
  const commerce = await getStorefrontCommerce();

  return <CheckoutClient commerce={commerce} />;
}
