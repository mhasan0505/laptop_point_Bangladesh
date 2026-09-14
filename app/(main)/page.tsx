import BentoGridSection from "@/components/application/BentoGridSection";
import HeroSection from "@/components/application/HeroSection";
import NewProductsSection from "@/components/application/NewProductsSection";
import TestimonialsSection from "@/components/application/TestimonialsSection";
import { eCommerceSchema } from "@/lib/seo-schemas";
import { Metadata } from "next";
import nextDynamic from "next/dynamic";

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

import { getLiveLaptops } from "@/app/data/data";

export const revalidate = 300;

const HomePage = async () => {
  const products = await getLiveLaptops();

  return (
    <>
      {/* Schema Markup for E-Commerce */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eCommerceSchema) }}
      />

      <HeroSection />
      <NewProductsSection initialProducts={products} />
      <BentoGridSection />

      {/* HP Section */}
      <BrandProductSection
        brand="HP"
        title="HP Laptop Series"
        description="Experience power and elegance with our curated selection of HP laptops. Designed for professionals, business leaders, and creators."
        badgeText="Premium Collection"
        theme="hp"
        initialProducts={products}
      />

      {/* Dell Section */}
      <BrandProductSection
        brand="Dell"
        title="Dell Latitude & XPS"
        description="Reliability meets performance. Explore our range of Dell laptops, from the rugged Latitude series to the premium XPS lineup."
        badgeText="Business Choice"
        theme="dell"
        initialProducts={products}
      />

      {/* Lenovo Section */}
      <BrandProductSection
        brand="Lenovo"
        title="Lenovo ThinkPad Series"
        description="Built for business. The legendary ThinkPad series offers unmatched durability, keyboard comfort, and performance."
        badgeText="Legendary Durability"
        theme="lenovo"
        initialProducts={products}
      />

      {/* Microsoft Section */}
      <BrandProductSection
        brand="Microsoft"
        title="Microsoft Surface"
        description="Sleek, powerful, and versatile. Surface laptops combine premium design with the full power of Windows."
        badgeText="Creative Studio"
        theme="microsoft"
        initialProducts={products}
      />
      <TestimonialsSection />
    </>
  );
};

export default HomePage;
