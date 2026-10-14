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
import { getHomepageSections } from "@/lib/public-content";
import BottomCtaStrip from "@/components/home/BottomCtaStrip";
import PowerDealSection from "@/components/home/PowerDealSection";
import PromoBanner from "@/components/home/PromoBanner";
import SpecialOffersStrip from "@/components/home/SpecialOffersStrip";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

const BRAND_SECTIONS = [
  {
    brand: "HP",
    title: "HP Laptop Series",
    description:
      "Experience power and elegance with our curated selection of HP laptops. Designed for professionals, business leaders, and creators.",
    badgeText: "Premium Collection",
    theme: "hp",
  },
  {
    brand: "Dell",
    title: "Dell Latitude & XPS",
    description:
      "Reliability meets performance. Explore our range of Dell laptops, from the rugged Latitude series to the premium XPS lineup.",
    badgeText: "Business Choice",
    theme: "dell",
  },
  {
    brand: "Lenovo",
    title: "Lenovo ThinkPad Series",
    description:
      "Built for business. The legendary ThinkPad series offers unmatched durability, keyboard comfort, and performance.",
    badgeText: "Legendary Durability",
    theme: "lenovo",
  },
] as const;

const HomePage = async () => {
  const [products, sections] = await Promise.all([
    getLiveLaptops(),
    getHomepageSections(),
  ]);

  const brandSection = (b: (typeof BRAND_SECTIONS)[number]) => (
    <BrandProductSection
      key={b.brand}
      brand={b.brand}
      title={b.title}
      description={b.description}
      badgeText={b.badgeText}
      theme={b.theme}
      initialProducts={products}
    />
  );

  // Each registry id maps to the storefront block it controls. Visibility and
  // order come from Admin → Setup → Homepage Layout.
  const renderers: Record<string, (heading?: string, sub?: string) => ReactNode> = {
    hero: () => (
      <>
        <HeroSection />
        <NewProductsSection initialProducts={products} />
        <PromoBanner
          placement="home.flash-deal"
          aspectClassName="aspect-[2/1]"
          className="max-w-3xl!"
        />
        <SpecialOffersStrip />
      </>
    ),
    "prime-showcase": () => <BentoGridSection />,
    "power-deal": (h, s) => <PowerDealSection heading={h} subheading={s} />,
    "surface-banner": () => <PromoBanner placement="home.surface" />,
    "surface-showcase": (h, s) => (
      <>
        {BRAND_SECTIONS.map(brandSection)}
        <BrandProductSection
          brand="Microsoft"
          title={h || "Microsoft Surface"}
          description={
            s ||
            "Sleek, powerful, and versatile. Surface laptops combine premium design with the full power of Windows."
          }
          badgeText="Creative Studio"
          theme="microsoft"
          initialProducts={products}
        />
      </>
    ),
    "apple-showcase": () => <PromoBanner placement="home.apple" />,
    "accessories-banner": () => <PromoBanner placement="home.accessories" />,
    "bottom-cta": (h, s) => (
      <>
        <TestimonialsSection />
        <BottomCtaStrip heading={h} subheading={s} />
      </>
    ),
  };

  return (
    <>
      {/* Schema Markup for E-Commerce */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eCommerceSchema) }}
      />

      {sections
        .filter((section) => section.visible && renderers[section.id])
        .map((section) => (
          <div key={section.id} data-homepage-section={section.id}>
            {renderers[section.id](section.heading, section.subheading)}
          </div>
        ))}

      {/* Testimonials ride with the CTA strip; keep them if the strip is hidden. */}
      {!sections.some((x) => x.id === "bottom-cta" && x.visible) && (
        <TestimonialsSection />
      )}
    </>
  );
};

export default HomePage;
