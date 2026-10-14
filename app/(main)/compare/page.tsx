import ComparisonTable from "@/components/product/ComparisonTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Laptops | Laptop Point Bangladesh",
  description:
    "Compare side-by-side specifications, prices, and features of laptops.",
  alternates: {
    canonical: "https://laptoppointbd.com/compare",
  },
};

export default function ComparePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Compare Products</h1>
      <div className="overflow-x-auto">
        <ComparisonTable />
      </div>
    </div>
  );
}
