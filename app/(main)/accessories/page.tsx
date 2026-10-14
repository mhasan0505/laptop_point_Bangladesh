import AccessoryCard from "@/components/accessories/AccessoryCard";
import { listPublicAccessories } from "@/lib/accessories-storage";
import { ACCESSORY_CATEGORIES } from "@/lib/accessory-types";
import { normalizeToken } from "@/lib/product-filter";
import { getStorefrontContact } from "@/lib/public-content";
import { MessageCircle, Phone, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface AccessoriesPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    q?: string;
    sort?: string;
    stock?: string;
  }>;
}

const SORTS = [
  { id: "new", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
] as const;

export async function generateMetadata({ searchParams }: AccessoriesPageProps): Promise<Metadata> {
  const params = await searchParams;
  const rawCategory = typeof params.category === "string" ? params.category.trim() : undefined;
  const cat = rawCategory
    ? ACCESSORY_CATEGORIES.find((c) => c.slug.toLowerCase() === rawCategory.toLowerCase())
    : undefined;

  let canonical = "https://laptoppointbd.com/accessories";
  let title = "Laptop Accessories Price in BD | Laptop Point BD";
  let description =
    "Laptop chargers, batteries, bags, keyboards, storage and more in Bangladesh. Original and compatible options with warranty.";

  if (cat) {
    canonical = `https://laptoppointbd.com/accessories?category=${encodeURIComponent(cat.slug)}`;
    title = `${cat.name} Price in Bangladesh | Laptop Point BD`;
    description = cat.description;
  }

  const all = await listPublicAccessories();
  const matchingCount = rawCategory
    ? all.filter(
        (a) =>
          normalizeToken(a.category) === normalizeToken(rawCategory) ||
          (cat && normalizeToken(a.category) === normalizeToken(cat.slug))
      ).length
    : all.length;
  const isEmptyCategory = Boolean(rawCategory) && matchingCount === 0;

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

export default async function AccessoriesPage({ searchParams }: AccessoriesPageProps) {
  const { category, brand, q, sort = "new", stock } = await searchParams;
  const [all, contact] = await Promise.all([listPublicAccessories(), getStorefrontContact()]);

  const rawCat = (category ?? "").trim().toLowerCase();
  const activeCategory = rawCat
    ? ACCESSORY_CATEGORIES.find((c) => c.slug.toLowerCase() === rawCat)
    : undefined;
  const query = (q ?? "").trim().toLowerCase();
  const inStockOnly = stock === "1";

  const inCategory = activeCategory
    ? all.filter((a) => a.category.toLowerCase() === activeCategory.slug.toLowerCase())
    : all;
  const brands = Array.from(new Set(inCategory.map((a) => a.brand).filter(Boolean))).sort();

  const items = inCategory
    .filter((a) => !brand || a.brand.toLowerCase() === brand.toLowerCase())
    .filter((a) => !inStockOnly || a.inStock)
    .filter(
      (a) =>
        !query ||
        a.name.toLowerCase().includes(query) ||
        a.brand.toLowerCase().includes(query) ||
        a.compatibility.some((c) => c.toLowerCase().includes(query)),
    )
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return b.updatedAt.localeCompare(a.updatedAt);
    });

  const counts = new Map<string, number>();
  for (const a of all) counts.set(a.category, (counts.get(a.category) ?? 0) + 1);

  const href = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { category, brand, q, sort: sort === "new" ? undefined : sort, stock: inStockOnly ? "1" : undefined, ...next };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const s = params.toString();
    return s ? `/accessories?${s}` : "/accessories";
  };

  const chip = (active: boolean) =>
    `inline-flex h-10 items-center rounded-full border px-4 text-small font-medium transition-colors ${
      active
        ? "border-brand-navy bg-brand-navy text-white"
        : "border-line bg-surface text-ink-2 hover:border-brand-navy"
    }`;

  const waNumber = contact.whatsapp.replace(/[^\d]/g, "");

  return (
    <div className="bg-surface pb-16">
      {/* Header */}
      <header className="border-b border-line bg-surface-2">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="text-caption font-semibold uppercase tracking-[0.06em] text-brand-red">
            Accessories
          </p>
          <h1 className="mt-2 text-h1 font-bold tracking-tight text-ink">
            {activeCategory ? activeCategory.name : "Everything for your laptop"}
          </h1>
          <p className="mt-3 max-w-[65ch] text-body-lg text-ink-2">
            {activeCategory
              ? activeCategory.description
              : "Chargers, batteries, bags and more. Tell us your laptop model and we will confirm it fits before you buy."}
          </p>

          <form action="/accessories" method="get" role="search" className="mt-6 flex max-w-xl gap-2">
            {category && <input type="hidden" name="category" value={category} />}
            <label htmlFor="acc-search" className="sr-only">
              Search accessories
            </label>
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-text"
                aria-hidden="true"
              />
              <input
                id="acc-search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Search by name, brand or laptop model"
                className="h-12 w-full rounded-[var(--radius-md)] border border-line bg-surface pl-10 pr-3 text-body text-ink outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
              />
            </div>
            <button
              type="submit"
              className="h-12 rounded-[var(--radius-md)] bg-brand-navy px-5 text-small font-semibold text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
            >
              Search
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Categories */}
        <nav aria-label="Accessory categories" className="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex gap-2 pb-1">
            <li>
              <Link href={href({ category: undefined, brand: undefined })} className={chip(!activeCategory)}>
                All ({all.length})
              </Link>
            </li>
            {ACCESSORY_CATEGORIES.filter((c) => (counts.get(c.slug) ?? 0) > 0).map((c) => (
              <li key={c.slug}>
                <Link
                  href={href({ category: c.slug, brand: undefined })}
                  className={chip(activeCategory?.slug === c.slug)}
                  aria-current={activeCategory?.slug === c.slug ? "page" : undefined}
                >
                  {c.name} ({counts.get(c.slug)})
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Filters */}
        <div className="mt-5 flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-center md:justify-between">
          <p className="text-small text-ink-2" aria-live="polite">
            <span className="font-semibold text-ink">{items.length}</span>{" "}
            {items.length === 1 ? "accessory" : "accessories"}
            {query && (
              <>
                {" "}
                for &ldquo;{q}&rdquo;
              </>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={href({ stock: inStockOnly ? undefined : "1" })} className={chip(inStockOnly)}>
              In stock only
            </Link>
            {SORTS.map((s) => (
              <Link
                key={s.id}
                href={href({ sort: s.id === "new" ? undefined : s.id })}
                className={chip(sort === s.id)}
                aria-current={sort === s.id ? "true" : undefined}
              >
                {s.label}
              </Link>
            ))}
          </div>
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

        {/* Grid */}
        {items.length > 0 ? (
          <ul className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((a) => (
              <li key={a.id} className="flex">
                <div className="flex w-full">
                  <AccessoryCard accessory={a} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-[var(--radius-lg)] border border-dashed border-line p-10 text-center">
            <p className="text-h3 font-semibold text-ink">
              {all.length === 0 ? "Accessories are coming soon" : "Nothing matches these filters"}
            </p>
            <p className="mt-2 text-body text-ink-2">
              {all.length === 0
                ? "We are adding accessories to the catalogue. Call us and we will find what you need."
                : "Try a different search or clear the filters."}
            </p>
            {all.length > 0 && (
              <Link
                href="/accessories"
                className="mt-5 inline-flex h-11 items-center rounded-full bg-brand-navy px-6 text-small font-semibold text-white"
              >
                Clear filters
              </Link>
            )}
          </div>
        )}

        {/* Help */}
        <section
          aria-labelledby="acc-help"
          className="mt-14 flex flex-col items-start justify-between gap-5 rounded-[var(--radius-lg)] bg-brand-navy p-6 text-white sm:flex-row sm:items-center sm:p-8"
        >
          <div>
            <h2 id="acc-help" className="text-h3 font-bold">
              Not sure what fits your laptop?
            </h2>
            <p className="mt-1 text-body text-white/80">
              Send us the model number and we will confirm compatibility before you order.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`tel:${contact.hotline.replace(/[^\d+]/g, "")}`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-red px-5 text-small font-semibold text-white hover:bg-brand-red-hover"
            >
              <Phone className="h-4 w-4" aria-hidden="true" /> {contact.hotline}
            </a>
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-small font-semibold text-white hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
