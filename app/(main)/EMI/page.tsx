import EMIPageClient from "@/components/emi/EMIPageClient";
import { getStorefrontCommerce } from "@/lib/public-content";

export const metadata = {
  title: "EMI Information | Laptop Point Bangladesh",
  description: "Calculate and explore bank EMI plans for laptops and workstations.",
  alternates: {
    canonical: "https://laptoppointbd.com/EMI",
  },
};

export default async function EMIPage() {
  const commerce = await getStorefrontCommerce();

  return <EMIPageClient commerce={commerce} />;
}
