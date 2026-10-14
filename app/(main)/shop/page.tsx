import { getLiveLaptops } from "@/app/data/data";
import ShopClient from "@/components/shop/ShopClient";
import { normalizeToken } from "@/lib/product-filter";
import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const rawBrand =
    typeof params.brand === "string" && params.brand.trim()
      ? params.brand.trim()
      : undefined;
  const rawCategory =
    typeof params.category === "string" && params.category.trim()
      ? params.category.trim()
      : undefined;

  // 308 redirect from legacy "Convertible" to unified "Convertible 2-in-1"
  if (rawCategory && normalizeToken(rawCategory) === "convertible") {
    permanentRedirect("/shop?category=Convertible%202-in-1");
  }

  const laptops = await getLiveLaptops();
  const canonicalBrands = Array.from(
    new Set(
      laptops
        .map((p) => p.brand?.trim())
        .filter((b): b is string => Boolean(b))
    )
  );
  const allKnownBrands = Array.from(
    new Set([
      ...canonicalBrands,
      "Dell",
      "HP",
      "Lenovo",
      "Microsoft",
      "Apple",
      "Asus",
      "Acer",
      "MSI",
      "Razer",
      "Gigabyte",
    ])
  );

  const canonicalCategories = Array.from(
    new Set(
      laptops
        .map((p) => p.category?.trim())
        .filter((c): c is string => Boolean(c))
    )
  );

  const brand = rawBrand
    ? allKnownBrands.find((b) => b.toLowerCase() === rawBrand.toLowerCase()) || rawBrand
    : undefined;

  const category = rawCategory
    ? canonicalCategories.find((c) => c.toLowerCase() === rawCategory.toLowerCase()) || rawCategory
    : undefined;

  let canonical = "https://laptoppointbd.com/shop";
  let title = "Shop All Laptops | Laptop Point Bangladesh";
  let description =
    "Explore our complete range of certified used and refurbished laptops with best prices in Bangladesh.";

  let isEmptyCategory = false;

  // Rule: Single brand or category filter gets self-referencing canonical.
  // Combined filters (both brand & category) or sorting/pagination canonical to single-filter or base /shop.
  if (brand && !category) {
    canonical = `https://laptoppointbd.com/shop?brand=${encodeURIComponent(brand)}`;
    title = `${brand} Laptops Price in Bangladesh | Laptop Point BD`;
    description = `Browse certified pre-owned and refurbished ${brand} laptops at best prices in Bangladesh. Tested hardware with official warranty.`;
  } else if (category && !brand) {
    const normTarget = normalizeToken(category);
    const matchingCount = laptops.filter((p) => normalizeToken(p.category) === normTarget).length;
    isEmptyCategory = matchingCount === 0;

    canonical = `https://laptoppointbd.com/shop?category=${encodeURIComponent(category)}`;
    title = `${category} Laptops in Bangladesh | Laptop Point BD`;
    description = `Find the best ${category} laptops in Bangladesh. Verified condition, showroom testing, and warranty included.`;
  }

  return {
    title,
    description,
    ...(isEmptyCategory
      ? {
          robots: {
            index: false,
            follow: true,
          },
        }
      : {}),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const [products, params] = await Promise.all([
    getLiveLaptops(),
    searchParams,
  ]);

  const rawCategory =
    typeof params.category === "string" && params.category.trim()
      ? params.category.trim()
      : undefined;

  if (rawCategory && normalizeToken(rawCategory) === "convertible") {
    permanentRedirect("/shop?category=Convertible%202-in-1");
  }

  return <ShopClient initialProducts={products} initialParams={params} />;
}
