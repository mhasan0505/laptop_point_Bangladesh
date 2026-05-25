import ComparisonTable from "@/components/product/ComparisonTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Laptop Specifications",
  description:
    "Compare laptop models side by side by price, specs, and features before making your purchase decision.",
  alternates: {
    canonical: "https://laptoppointbd.com/compare",
  },
  robots: {
    index: false,
    follow: false,
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
