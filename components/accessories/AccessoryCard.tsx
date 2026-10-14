"use client";

import { useCart } from "@/contexts/CartContext";
import { ACCESSORY_PLACEHOLDER, categoryName, type PublicAccessory } from "@/lib/accessory-types";
import { formatBDT } from "@/lib/format";
import { getValidDiscount } from "@/lib/pricing-display";
import { Check, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function AccessoryCard({ accessory }: { accessory: PublicAccessory }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const image = accessory.images[0] || ACCESSORY_PLACEHOLDER;
  const discount = getValidDiscount(accessory.price, accessory.originalPrice, accessory.sku);
  const lowStock = accessory.inStock && accessory.stock <= 5;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!accessory.inStock) return;
    addToCart({
      id: accessory.id,
      name: accessory.name,
      brand: accessory.brand,
      price: accessory.price,
      originalPrice: accessory.originalPrice,
      image,
      condition: accessory.condition,
      color: accessory.color || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lift focus-within:ring-2 focus-within:ring-brand-navy focus-within:ring-offset-2">
      <Link
        href={`/accessories/${accessory.slug}`}
        className="absolute inset-0 z-0 rounded-[var(--radius-md)] focus:outline-none"
        aria-label={`View ${accessory.name}`}
      />

      <div className="relative aspect-4/3 w-full overflow-hidden bg-surface-2">
        <Image
          src={image}
          alt={accessory.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-5 mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
        />
        {accessory.badge && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-brand-navy/10 px-2 py-0.5 text-caption font-semibold text-brand-navy">
            {accessory.badge}
          </span>
        )}
        {discount && (
          <span className="absolute bottom-2.5 left-2.5 rounded-full border border-brand-red/20 bg-brand-red/10 px-2 py-0.5 text-caption font-bold text-brand-red">
            {discount.savingsFormatted}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
        <p className="truncate text-caption font-semibold uppercase tracking-[0.06em] text-muted-text">
          {accessory.brand} · {categoryName(accessory.category)}
        </p>
        <h3 className="line-clamp-2 min-h-[2.5rem] text-small font-semibold leading-snug text-ink group-hover:text-brand-navy">
          {accessory.name}
        </h3>

        {accessory.compatibility.length > 0 && (
          <p className="line-clamp-1 text-caption text-muted-text">
            Fits: {accessory.compatibility.join(", ")}
          </p>
        )}

        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <span className="text-body font-bold tabular-nums text-brand-red sm:text-h3">
            {formatBDT(accessory.price)}
          </span>
          {discount && (
            <span className="text-small tabular-nums text-muted-text line-through">
              {formatBDT(accessory.originalPrice)}
            </span>
          )}
        </div>

        <p
          className={`flex items-center gap-1.5 text-caption font-medium ${
            !accessory.inStock ? "text-muted-text" : lowStock ? "text-warning" : "text-success"
          }`}
        >
          {accessory.inStock && (
            <span
              aria-hidden="true"
              className={`inline-block h-1.5 w-1.5 rounded-full ${lowStock ? "bg-warning" : "bg-success"}`}
            />
          )}
          {!accessory.inStock ? "Out of stock" : lowStock ? `Only ${accessory.stock} left` : "In stock"}
          {accessory.warranty && accessory.inStock ? ` · ${accessory.warranty}` : ""}
        </p>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!accessory.inStock}
          aria-live="polite"
          aria-label={
            accessory.inStock ? `Add ${accessory.name} to cart` : `${accessory.name} is out of stock`
          }
          className={`relative z-10 mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] text-small font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 ${
            !accessory.inStock
              ? "cursor-not-allowed bg-surface-3 text-muted-text"
              : added
                ? "bg-success text-white"
                : "bg-brand-red text-white shadow-soft hover:bg-brand-red-hover active:scale-[0.98]"
          }`}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" /> Added
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {accessory.inStock ? "Add to cart" : "Out of stock"}
            </>
          )}
        </button>
      </div>
    </article>
  );
}
