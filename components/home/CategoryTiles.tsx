import SectionHeader from "@/components/home/SectionHeader";
import type { Product } from "@/types/product";
import {
  Briefcase,
  Flame,
  Gamepad2,
  Laptop,
  Sparkles,
  Wallet,
} from "lucide-react";
import Link from "next/link";

interface CategoryTilesProps {
  products?: Product[];
  heading?: string;
  subheading?: string;
  className?: string;
}

export default function CategoryTiles({
  products = [],
  heading,
  subheading,
  className = "",
}: CategoryTilesProps) {
  // Compute real counts from products
  const countForBrand = (brand: string) =>
    products.filter((p) => p.brand?.toLowerCase() === brand.toLowerCase())
      .length;

  const countForCategory = (cat: string) =>
    products.filter(
      (p) =>
        p.category?.toLowerCase().includes(cat.toLowerCase()) ||
        p.name.toLowerCase().includes(cat.toLowerCase()),
    ).length;

  const countForBudget = (maxPrice: number) =>
    products.filter((p) => p.price <= maxPrice).length;

  const tiles = [
    {
      title: "HP Laptops",
      href: "/shop?brand=HP",
      count: countForBrand("HP"),
      icon: Laptop,
      badge: "EliteBook / ProBook",
    },
    {
      title: "Dell Laptops",
      href: "/shop?brand=Dell",
      count: countForBrand("Dell"),
      icon: Laptop,
      badge: "Latitude / XPS",
    },
    {
      title: "Lenovo",
      href: "/shop?brand=Lenovo",
      count: countForBrand("Lenovo"),
      icon: Laptop,
      badge: "ThinkPad Series",
    },
    {
      title: "Apple MacBook",
      href: "/shop?brand=Apple",
      count: countForBrand("Apple"),
      icon: Sparkles,
      badge: "Air & Pro",
    },
    {
      title: "Microsoft",
      href: "/shop?brand=Microsoft",
      count: countForBrand("Microsoft"),
      icon: Laptop,
      badge: "Surface Pro & Laptop",
    },
    {
      title: "Ultrabooks",
      href: "/shop?category=Ultrabook",
      count: countForCategory("Ultrabook") || countForCategory("Thin"),
      icon: Briefcase,
      badge: "Slim & Light",
    },
    {
      title: "Gaming Laptops",
      href: "/shop?category=Gaming",
      count: countForCategory("Gaming"),
      icon: Gamepad2,
      badge: "Dedicated GPU",
    },
    {
      title: "Under ৳30K",
      href: "/shop?priceMax=30000",
      count: countForBudget(30000),
      icon: Wallet,
      badge: "Budget Friendly",
    },
  ];

  return (
    <section
      aria-labelledby="quick-browse-heading"
      className={`py-12 sm:py-16 bg-surface-2 border-b border-line ${className}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <SectionHeader
          id="quick-browse-heading"
          eyebrow="Browse Inventory"
          title={heading || "Quick Browse"}
          subheading={
            subheading ||
            "Find your ideal used laptop by popular brand, form factor, or budget tier."
          }
          viewAllHref="/shop"
          viewAllLabel="All Categories"
        />

        <div className="flex sm:grid sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-none snap-x snap-mandatory">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.title}
                href={tile.href}
                className="flex sm:flex-col items-center sm:items-center justify-between sm:justify-center p-3.5 sm:p-4 rounded-[var(--radius-md)] border border-line bg-surface hover:border-brand-navy/40 transition-all duration-150 shadow-soft hover:shadow-lift hover:-translate-y-0.5 shrink-0 w-60 sm:w-auto snap-start group focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[var(--radius-sm)] bg-surface-2 text-brand-navy flex items-center justify-center mb-0 sm:mb-2.5 transition-transform group-hover:scale-105">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="text-left sm:text-center min-w-0 flex-1 sm:flex-none pl-3 sm:pl-0">
                  <span className="block text-small font-semibold text-ink line-clamp-1 group-hover:text-brand-navy transition-colors">
                    {tile.title}
                  </span>
                  <span className="block text-caption text-muted-text mt-0.5 line-clamp-1">
                    {tile.badge}
                  </span>
                </div>
                {tile.count > 0 && (
                  <span className="text-caption font-semibold font-mono text-ink-2 bg-surface-2 px-2 py-0.5 rounded-full shrink-0 sm:mt-2">
                    {tile.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
