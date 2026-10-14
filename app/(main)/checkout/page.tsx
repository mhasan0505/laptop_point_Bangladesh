import CheckoutClient from "@/components/checkout/CheckoutClient";
import { getStorefrontCommerce } from "@/lib/public-content";

export const metadata = {
  title: "Checkout",
  description: "Complete your laptop order at Laptop Point Bangladesh.",
};

export default async function CheckoutPage() {
  const commerce = await getStorefrontCommerce();

  return <CheckoutClient commerce={commerce} />;
}
