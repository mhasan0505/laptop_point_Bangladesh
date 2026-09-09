import { Metadata } from "next";

export const metadata: Metadata = {
  title: "EMI Calculator & Payment Plans | Laptop Point",
  description:
    "Calculate EMI for laptop purchases. Check interest rates, supported banks, and payment plans starting from ৳5,000.",
  alternates: {
    canonical: "https://laptoppointbd.com/EMI",
  },
};

export default function EMILayout({ children }: { children: React.ReactNode }) {
  return children;
}
