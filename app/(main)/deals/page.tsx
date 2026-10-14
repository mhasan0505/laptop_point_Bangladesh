import { getLiveLaptops } from "@/app/data/data";
import PowerDealSection from "@/components/home/PowerDealSection";
import PromoBanner from "@/components/home/PromoBanner";
import ProductsCard from "@/components/ui/ProductsCard";
import { Flame } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hot Deals | Laptop Point Bangladesh",
  description:
    "Verified clearance prices on tested laptops with warranty. Limited stock — updated by our team.",
};

interface DealsPageProps {
  searchParams: Promise<{ brand?: string; sort?: string }>;
}

const SORTS = [
  { id: "discount", label: "Biggest discount" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
] as const;

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const { brand, sort = "discount" } = await searchParams;
  const laptops = await getLiveLaptops();

  const discounted = laptops.filter((p) => p.discount && p.discount > 0 && p.inStock);
  const brands = Array.from(
    new Set(discounted.map((p) => p.brand).filter((b): b is string => Boolean(b))),
  ).sort();

  const visible = discounted
    .filter((p) => !brand || p.brand?.toLowerCase() === brand.toLowerCase())
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return (b.discount ?? 0) - (a.discount ?? 0);
    });

  const href = (next: { brand?: string; sort?: string }) => {
    const q = new URLSearchParams();
    const b = "brand" in next ? next.brand : brand;
    const s = "sort" in next ? next.sort : sort;
    if (b) q.set("brand", b);
    if (s && s !== "discount") q.set("sort", s);
    const qs = q.toString();
    return qs ? `/deals?${qs}` : "/deals";
  };

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm font-medium transition ${
      active
        ? "border-gray-900 bg-gray-900 text-white"
        : "border-gray-300 bg-white text-gray-700 hover:border-gray-900"
    }`;

  return (
    <div className="pb-16">
      <header className="mx-auto w-full max-w-[95%] pt-10">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
          <Flame size={14} /> Limited stock
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">
          Hot Deals
        </h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Tested laptops at clearance prices, all with warranty. Prices and
          stock update live.
        </p>
      </header>

      <PromoBanner placement="home.flash-deal" aspectClassName="aspect-[2/1] sm:aspect-[16/5]" />
      <PowerDealSection />

      <section
        aria-labelledby="all-deals-heading"
        className="mx-auto mt-6 w-full max-w-[95%]"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 id="all-deals-heading" className="text-2xl font-bold">
            All discounted laptops
            <span className="ml-2 text-base font-normal text-gray-500">
              ({visible.length})
            </span>
          </h2>
          <nav aria-label="Sort deals" className="flex flex-wrap gap-2">
            {SORTS.map((s) => (
              <Link
                key={s.id}
                href={href({ sort: s.id })}
                className={chip(sort === s.id)}
                aria-current={sort === s.id ? "true" : undefined}
              >
                {s.label}
              </Link>
            ))}
          </nav>
        </div>

        {brands.length > 1 && (
          <nav aria-label="Filter by brand" className="mt-4 flex flex-wrap gap-2">
            <Link href={href({ brand: undefined })} className={chip(!brand)}>
              All brands
            </Link>
            {brands.map((b) => (
              <Link
                key={b}
                href={href({ brand: b })}
                className={chip(brand?.toLowerCase() === b.toLowerCase())}
              >
                {b}
              </Link>
            ))}
          </nav>
        )}

        {visible.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((product) => (
              <ProductsCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-10 text-center">
            <p className="font-semibold">No deals match this filter</p>
            <p className="mt-1 text-sm text-gray-500">
              Try another brand, or browse the full catalogue.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-block rounded-full bg-gray-900 px-6 py-2 text-sm font-semibold text-white"
            >
              Browse all laptops
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
