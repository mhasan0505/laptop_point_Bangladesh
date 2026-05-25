import { Metadata } from "next";

export const metadata: Metadata = {
  title: "EMI Calculator & Payment Plans",
  description:
    "Check EMI options for laptop purchases in Bangladesh and estimate monthly installment plans before checkout.",
  alternates: {
    canonical: "https://laptoppointbd.com/EMI",
  },
};

const EMI_Page = () => {
  return (
    <div className="container mx-auto min-h-[50vh] px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">EMI Options</h1>
      <p className="mt-3 text-gray-600">
        Check eligible installment plans and compare monthly costs for your
        selected laptop.
      </p>
    </div>
  );
};

export default EMI_Page;
