import AccessoryCard from "@/components/accessories/AccessoryCard";
import AddToCartPanel from "@/components/accessories/AddToCartPanel";
import { getAccessoryByIdOrSlug, listPublicAccessories, toPublic } from "@/lib/accessories-storage";
import { ACCESSORY_PLACEHOLDER, categoryName } from "@/lib/accessory-types";
import { formatBDT } from "@/lib/format";
import { getValidDiscount } from "@/lib/pricing-display";
import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ACCESSORY_CATEGORIES } from "@/lib/accessory-types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (ACCESSORY_CATEGORIES.some((c) => c.slug === slug)) {
    return {
      alternates: {
        canonical: `https://laptoppointbd.com/accessories?category=${slug}`,
      },
    };
  }
  const a = await getAccessoryByIdOrSlug(slug);
  if (!a || !a.active) return { title: "Accessory not found" };
  return {
    title: `${a.name} Price in BD`,
    description:
      a.description ||
      `Buy ${a.name} in Bangladesh for ${formatBDT(a.price)}. ${a.compatibility.join(", ")}.`,
    alternates: {
      canonical: `https://laptoppointbd.com/accessories/${slug}`,
    },
    openGraph: { images: [{ url: a.images[0] || ACCESSORY_PLACEHOLDER }] },
  };
}

export default async function AccessoryDetailPage({ params }: Props) {
  const { slug } = await params;
  if (ACCESSORY_CATEGORIES.some((c) => c.slug === slug)) {
    permanentRedirect(`/accessories?category=${slug}`);
  }
  const record = await getAccessoryByIdOrSlug(slug);
  if (!record || !record.active) notFound();

  const accessory = toPublic(record);
  const discount = getValidDiscount(accessory.price, accessory.originalPrice, accessory.sku);
  const images = accessory.images.length > 0 ? accessory.images : [ACCESSORY_PLACEHOLDER];

  const related = (await listPublicAccessories())
    .filter((a) => a.id !== accessory.id && a.category === accessory.category)
    .slice(0, 4);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: accessory.name,
    sku: accessory.sku,
    brand: { "@type": "Brand", name: accessory.brand },
    image: images,
    description: accessory.description || accessory.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: accessory.price,
      availability: accessory.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition:
        accessory.condition === "New"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
    },
  };

  return (
    <div className="bg-surface pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-small text-muted-text">
          <Link href="/accessories" className="hover:text-ink">
            Accessories
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href={`/accessories?category=${accessory.category}`} className="hover:text-ink">
            {categoryName(accessory.category)}
          </Link>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface-2">
              <Image
                src={images[0]}
                alt={accessory.name}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain p-8 mix-blend-multiply"
              />
            </div>
            {images.length > 1 && (
              <ul className="grid grid-cols-5 gap-2">
                {images.slice(0, 5).map((src, i) => (
                  <li
                    key={`${src}-${i}`}
                    className="relative aspect-square overflow-hidden rounded-[var(--radius-sm)] border border-line bg-surface-2"
                  >
                    <Image src={src} alt="" fill sizes="96px" className="object-contain p-1.5" />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.06em] text-muted-text">
              {accessory.brand}
            </p>
            <h1 className="mt-1 text-h2 font-bold tracking-tight text-ink">{accessory.name}</h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-h1 font-bold tabular-nums text-brand-red">
                {formatBDT(accessory.price)}
              </span>
              {discount && (
                <>
                  <span className="text-body tabular-nums text-muted-text line-through">
                    {formatBDT(accessory.originalPrice)}
                  </span>
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-caption font-semibold text-success">
                    {discount.savingsFormatted}
                  </span>
                </>
              )}
            </div>

            <p
              className={`mt-3 text-small font-medium ${
                accessory.inStock ? "text-success" : "text-muted-text"
              }`}
            >
              {accessory.inStock
                ? accessory.stock <= 5
                  ? `Only ${accessory.stock} left in stock`
                  : "In stock"
                : "Out of stock"}
            </p>

            {accessory.description && (
              <p className="mt-5 max-w-[65ch] text-body text-ink-2">{accessory.description}</p>
            )}

            <div className="mt-6">
              <AddToCartPanel accessory={accessory} />
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6 text-small">
              <div>
                <dt className="text-muted-text">Condition</dt>
                <dd className="font-semibold text-ink">{accessory.condition}</dd>
              </div>
              {accessory.warranty && (
                <div>
                  <dt className="text-muted-text">Warranty</dt>
                  <dd className="flex items-center gap-1.5 font-semibold text-ink">
                    <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />
                    {accessory.warranty}
                  </dd>
                </div>
              )}
              {accessory.color && (
                <div>
                  <dt className="text-muted-text">Colour</dt>
                  <dd className="font-semibold text-ink">{accessory.color}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-text">SKU</dt>
                <dd className="font-mono text-caption font-semibold text-ink">{accessory.sku}</dd>
              </div>
            </dl>

            {accessory.compatibility.length > 0 && (
              <div className="mt-6">
                <h2 className="text-small font-semibold text-ink">Compatible with</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {accessory.compatibility.map((c) => (
                    <li
                      key={c}
                      className="rounded-full bg-surface-3 px-3 py-1 text-caption font-medium text-ink-2"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {accessory.specs.length > 0 && (
              <div className="mt-6">
                <h2 className="text-small font-semibold text-ink">Highlights</h2>
                <ul className="mt-2 list-inside list-disc space-y-1 text-body text-ink-2">
                  {accessory.specs.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related-acc" className="mt-16">
            <h2 id="related-acc" className="text-h3 font-bold text-ink">
              More {categoryName(accessory.category).toLowerCase()}
            </h2>
            <ul className="mt-5 grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
              {related.map((a) => (
                <li key={a.id} className="flex">
                  <div className="flex w-full">
                    <AccessoryCard accessory={a} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
