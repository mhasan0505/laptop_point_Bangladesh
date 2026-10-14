import { getLiveLaptops } from "@/app/data/data";
import ShopClient from "@/components/shop/ShopClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop All Laptops | Laptop Point Bangladesh",
  description:
    "Explore our complete range of certified used and refurbished laptops with best prices in Bangladesh.",
};

export default async function ShopPage() {
  const products = await getLiveLaptops();
  return <ShopClient initialProducts={products} />;
}
