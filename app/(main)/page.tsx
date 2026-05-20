import BentoGridSection from "@/components/application/BentoGridSection";
import HeroSection from "@/components/application/HeroSection";
import NewProductsSection from "@/components/application/NewProductsSection";
import TestimonialsSection from "@/components/application/TestimonialsSection";
import { getLiveProducts } from "@/lib/products";
import { eCommerceSchema } from "@/lib/seo-schemas";
import { Metadata } from "next";
import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Lazy load brand sections that are below the fold for better initial load
const BrandProductSection = nextDynamic(
  () => import("@/components/application/BrandProductSection"),
  {
    loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
  },
);

export const metadata: Metadata = {
  title: "Laptop Point Bangladesh | Premium Used Laptops",
  description:
    "Shop the best selection of used laptops from HP, Dell, Lenovo, and Microsoft in Bangladesh. Official warranty, free delivery, and best prices guaranteed.",
  keywords: [
    "used laptop Bangladesh",
    "used laptop Dhaka",
    "HP laptop price",
    "Dell laptop Bangladesh",
    "Lenovo ThinkPad",
    "Microsoft Surface used",
    "laptop with warranty",
  ],
  openGraph: {
    title: "Laptop Point Bangladesh | Premium Used Laptops",
    description:
      "Shop the best selection of used laptops from HP, Dell, Lenovo, and Microsoft in Bangladesh.",
    url: "https://laptoppointbd.com",
    type: "website",
  },
};

const brandThemes: Record<string, "hp" | "dell" | "lenovo" | "microsoft"> = {
  hp: "hp",
  dell: "dell",
  lenovo: "lenovo",
  microsoft: "microsoft",
};

function isAccessoryCategory(category?: string) {
  return category?.toLowerCase().includes("accessor") ?? false;
}

function getThemeByBrand(brand: string) {
  return brandThemes[brand.toLowerCase()] || "microsoft";
}

function buildBrandCopy(brand: string) {
  return {
    title: `${brand} Laptop Series`,
    description: `Browse uploaded ${brand} products from our latest inventory with updated specs, pricing, and availability.`,
    badgeText: `${brand} Collection`,
  };
}

const HomePage = async () => {
  const products = await getLiveProducts();
  const laptopProducts = products.filter(
    (product) => !isAccessoryCategory(product.category),
  );

  const brandCounts = new Map<string, number>();
  laptopProducts.forEach((product) => {
    const brand = product.brand?.trim();
    if (!brand) return;
    brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
  });

  const orderedBrands = [...brandCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([brand]) => brand);

  return (
    <>
      {/* Schema Markup for E-Commerce */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eCommerceSchema) }}
      />

      <HeroSection />
      <NewProductsSection />
      <BentoGridSection />

      {orderedBrands.map((brand) => {
        const copy = buildBrandCopy(brand);

        return (
          <BrandProductSection
            key={brand}
            brand={brand}
            title={copy.title}
            description={copy.description}
            badgeText={copy.badgeText}
            theme={getThemeByBrand(brand)}
            products={products}
          />
        );
      })}
      <TestimonialsSection />
    </>
  );
};

export default HomePage;
