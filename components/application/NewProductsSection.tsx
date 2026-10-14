import SectionHeader from "@/components/home/SectionHeader";
import HomeProductCard from "@/components/home/HomeProductCard";
import type { Product } from "@/types/product";
import Link from "next/link";

interface NewProductsSectionProps {
  initialProducts?: Product[];
}

export default function NewProductsSection({ initialProducts = [] }: NewProductsSectionProps) {
  // Sort newest products by ID descending, display 8 items (4-up on desktop, 2-up on mobile)
  const products = [...initialProducts]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 8);

  if (products.length === 0) {
    return (
      <section
        aria-labelledby="new-arrivals-heading"
        className="py-12 sm:py-16 bg-surface"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <SectionHeader
            id="new-arrivals-heading"
            eyebrow="Fresh Inventory"
            title="New Arrivals"
            subheading="Recent arrivals inspected and ready for testing."
            viewAllHref="/shop"
            viewAllLabel="View all laptops"
          />
          <div className="rounded-[var(--radius-md)] bg-surface-2 p-8 text-center border border-line">
            <p className="text-body text-muted-text mb-4">
              New models are currently being inspected by our technicians.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-brand-red text-white text-small font-semibold hover:bg-brand-red-hover transition-colors"
            >
              Browse all laptops
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="new-arrivals-heading"
      className="py-12 sm:py-16 lg:py-20 bg-surface"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <SectionHeader
          id="new-arrivals-heading"
          eyebrow="Fresh Inventory"
          title="New Arrivals"
          subheading="Every unit is tested by our hardware technicians and backed by genuine warranty."
          viewAllHref="/shop"
          viewAllLabel="View all laptops"
        />

        {/* 4-up grid desktop, 2-up mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {products.map((product) => (
            <HomeProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
