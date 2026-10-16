import SectionHeader from "@/components/home/SectionHeader";
import type { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import accessoriesRaw from "@/app/data/accessories.json";

interface CategoryTilesProps {
  products?: Product[];
  heading?: string;
  subheading?: string;
  className?: string;
}

interface TileItem {
  title: string;
  href: string;
  count: number;
  badge: string;
  image: string;
  imageWidth?: number;
  imageHeight?: number;
  imageClassName?: string;
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

  const countForAccessories = () => {
    const fromProducts = products.filter(
      (p) =>
        p.category?.toLowerCase().includes("accessor") ||
        p.name.toLowerCase().includes("charger") ||
        p.name.toLowerCase().includes("adapter"),
    ).length;
    if (fromProducts > 0) return fromProducts;
    try {
      const activeCount = (accessoriesRaw as Array<{ active?: boolean }>).filter(
        (a) => a.active !== false,
      ).length;
      return activeCount > 0 ? activeCount : accessoriesRaw.length;
    } catch {
      return 6;
    }
  };

  const countForGaming = () => {
    const directCat = countForCategory("Gaming");
    if (directCat > 0) return directCat;
    return products.filter((p) => {
      const name = p.name.toLowerCase();
      const cat = (p.category || "").toLowerCase();
      const specText = JSON.stringify(p.specs || {}).toLowerCase();
      return (
        name.includes("gaming") ||
        cat.includes("gaming") ||
        specText.includes("rtx") ||
        specText.includes("gtx") ||
        specText.includes("geforce") ||
        specText.includes("radeon")
      );
    }).length;
  };

  const tiles: TileItem[] = [
    {
      title: "HP Laptops",
      href: "/shop?brand=HP",
      count: countForBrand("HP"),
      badge: "EliteBook / ProBook",
      image: "/brand_logo/hp.png",
      imageWidth: 44,
      imageHeight: 44,
      imageClassName: "w-10 h-10 sm:w-11 sm:h-11 object-contain",
    },
    {
      title: "Dell Laptops",
      href: "/shop?brand=Dell",
      count: countForBrand("Dell"),
      badge: "Latitude / XPS",
      image: "/brand_logo/dell.png",
      imageWidth: 44,
      imageHeight: 44,
      imageClassName: "w-10 h-10 sm:w-11 sm:h-11 object-contain",
    },
    {
      title: "Lenovo",
      href: "/shop?brand=Lenovo",
      count: countForBrand("Lenovo"),
      badge: "ThinkPad Series",
      image: "/brand_logo/lenovo.png",
      imageWidth: 52,
      imageHeight: 28,
      imageClassName: "w-12 h-6 sm:w-13 sm:h-7 object-contain",
    },
    {
      title: "Microsoft",
      href: "/shop?brand=Microsoft",
      count: countForBrand("Microsoft"),
      badge: "Surface Pro & Laptop",
      image: "/brand_logo/microsoft.png",
      imageWidth: 38,
      imageHeight: 38,
      imageClassName: "w-8 h-8 sm:w-9 sm:h-9 object-contain",
    },
    {
      title: "Accessories",
      href: "/accessories",
      count: countForAccessories(),
      badge: "Chargers, Bags & More",
      image: "/icons/accessories.png",
      imageWidth: 46,
      imageHeight: 46,
      imageClassName: "w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-xs",
    },
    {
      title: "Ultrabooks",
      href: "/shop?category=Ultrabook",
      count: countForCategory("Ultrabook") || countForCategory("Thin"),
      badge: "Slim & Light",
      image: "/icons/ultrabook.png",
      imageWidth: 46,
      imageHeight: 46,
      imageClassName: "w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-xs",
    },
    {
      title: "Gaming Laptops",
      href: "/shop?category=Gaming",
      count: countForGaming(),
      badge: "Dedicated GPU",
      image: "/icons/gamingLaptop.png",
      imageWidth: 46,
      imageHeight: 46,
      imageClassName: "w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-xs",
    },
    {
      title: "Under ৳30K",
      href: "/shop?priceMax=30000",
      count: countForBudget(30000),
      badge: "Budget Friendly",
      image: "/icons/budgetLaptop.png",
      imageWidth: 46,
      imageHeight: 46,
      imageClassName: "w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-xs",
    },
  ];

  return (
    <section
      aria-labelledby="quick-browse-heading"
      className={`py-12 sm:py-16 bg-surface-2 dark:bg-surface/40 border-b border-line ${className}`}
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
          align="center"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 max-w-7xl mx-auto justify-center">
          {tiles.map((tile) => {
            return (
              <Link
                key={tile.title}
                href={tile.href}
                className="flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-radius-md border border-line bg-surface dark:bg-surface-2 hover:border-brand-navy/40 dark:hover:border-sky-400/40 transition-all duration-200 shadow-soft hover:shadow-lift hover:-translate-y-1 text-center group focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2 min-h-[175px] sm:min-h-[190px]"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-surface-2 dark:bg-surface-3/60 border border-line/60 flex items-center justify-center p-2 mb-2 sm:mb-2.5 transition-all duration-200 group-hover:scale-105 group-hover:bg-brand-navy/5 dark:group-hover:bg-sky-500/10 group-hover:border-brand-navy/20 shrink-0">
                  <Image
                    src={tile.image}
                    alt={tile.title}
                    width={tile.imageWidth || 44}
                    height={tile.imageHeight || 44}
                    className={tile.imageClassName || "w-10 h-10 object-contain"}
                  />
                </div>

                <div className="flex flex-col items-center justify-center text-center w-full min-w-0 flex-1">
                  <span className="block text-small font-semibold text-ink dark:text-foreground line-clamp-1 group-hover:text-brand-navy dark:group-hover:text-primary transition-colors">
                    {tile.title}
                  </span>
                  <span className="block text-caption text-muted-text dark:text-muted-foreground mt-0.5 line-clamp-1 font-medium">
                    {tile.badge}
                  </span>
                </div>

                <div className="pt-2 sm:pt-2.5 shrink-0 min-h-[28px] flex items-center justify-center">
                  {tile.count > 0 ? (
                    <span className="text-caption font-semibold font-mono text-ink-2 dark:text-muted-foreground bg-surface-2 dark:bg-surface-3/80 border border-line/60 px-2 py-0.5 rounded-full group-hover:border-brand-navy/20 group-hover:text-brand-navy dark:group-hover:text-primary transition-colors">
                      {tile.count}
                    </span>
                  ) : (
                    <span className="text-caption font-semibold text-brand-navy/70 dark:text-sky-400/80 group-hover:text-brand-navy dark:group-hover:text-sky-300 transition-colors">
                      Explore →
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
