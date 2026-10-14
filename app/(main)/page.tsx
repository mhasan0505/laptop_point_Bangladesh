import { getLiveLaptops } from "@/app/data/data";
import NewProductsSection from "@/components/application/NewProductsSection";
import TestimonialsSection from "@/components/application/TestimonialsSection";
import BottomCtaStrip from "@/components/home/BottomCtaStrip";
import CategoryTiles from "@/components/home/CategoryTiles";
import HomeHero from "@/components/home/HomeHero";
import PowerDealSection from "@/components/home/PowerDealSection";
import PromoBanner from "@/components/home/PromoBanner";
import SpecialOffersStrip from "@/components/home/SpecialOffersStrip";
import WhyUs from "@/components/home/WhyUs";
import { getHomepageSections, getStorefrontContact } from "@/lib/public-content";
import { eCommerceSchema } from "@/lib/seo-schemas";
import { Metadata } from "next";
import nextDynamic from "next/dynamic";
import type { ReactNode } from "react";

// Lazy load brand sections that are below the fold for fast initial load
const BrandProductSection = nextDynamic(
  () => import("@/components/application/BrandProductSection"),
  {
    loading: () => <div className="h-96 bg-surface-2 animate-pulse" />,
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
  alternates: {
    canonical: "https://laptoppointbd.com",
  },
  openGraph: {
    title: "Laptop Point Bangladesh | Premium Used Laptops",
    description:
      "Shop the best selection of used laptops from HP, Dell, Lenovo, and Microsoft in Bangladesh.",
    url: "https://laptoppointbd.com",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

const BRAND_SECTIONS = [
  {
    brand: "HP",
    title: "HP Laptop Series",
    description:
      "Curated selection of tested HP EliteBook and ProBook business laptops.",
    badgeText: "Business & Pro",
    theme: "hp",
  },
  {
    brand: "Dell",
    title: "Dell Latitude & XPS",
    description:
      "Engineered for reliability. Explore rugged Latitude and premium XPS laptops.",
    badgeText: "Enterprise Choice",
    theme: "dell",
  },
  {
    brand: "Lenovo",
    title: "Lenovo ThinkPad Series",
    description:
      "Legendary ThinkPad durability, tactile keyboard comfort, and verified performance.",
    badgeText: "High Durability",
    theme: "lenovo",
  },
] as const;

export default async function HomePage() {
  const [products, sections, contact] = await Promise.all([
    getLiveLaptops(),
    getHomepageSections(),
    getStorefrontContact(),
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
        <HomeHero contact={contact} />
        <PromoBanner
          placement="home.flash-deal"
          aspectClassName="aspect-[16/6] sm:aspect-[16/3]"
          className="max-w-4xl"
        />
        <SpecialOffersStrip />
        {/* If quick browse (prime-showcase) is hidden, still render New Arrivals here */}
        {!sections.some((x) => x.id === "prime-showcase" && x.visible) && (
          <NewProductsSection initialProducts={products} />
        )}
      </>
    ),
    "prime-showcase": (h, s) => (
      <>
        <CategoryTiles products={products} heading={h} subheading={s} />
        <NewProductsSection initialProducts={products} />
      </>
    ),
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
            "Sleek and versatile. Surface laptops combine touch capability with performance."
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
        <WhyUs />
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

      {/* Trust & Testimonials ride with the CTA strip; keep them if the strip is hidden */}
      {!sections.some((x) => x.id === "bottom-cta" && x.visible) && (
        <>
          <WhyUs />
          <TestimonialsSection />
        </>
      )}
    </>
  );
}
