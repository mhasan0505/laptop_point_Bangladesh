"use client";

import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { formatBDT } from "@/lib/format";
import { getValidDiscount } from "@/lib/pricing-display";
import { Product } from "@/types/product";
import { Check, Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface HomeProductCardProps {
  product: Product;
  priority?: boolean;
}

// Spec token cleaners: strip clock/gen/marketing noise
function cleanProcessor(raw?: string): string {
  if (!raw) return "";
  const intelMatch = raw.match(/Core\s+(i[3579])[\s\S]*?\(?(\d+)(?:th|st|nd|rd)?\s*Gen\)?/i);
  if (intelMatch) {
    return `Core ${intelMatch[1]} ${intelMatch[2]}th Gen`;
  }
  const ryzenMatch = raw.match(/Ryzen(?:™)?\s*([3579])\s*(PRO)?/i);
  if (ryzenMatch) {
    return `Ryzen ${ryzenMatch[1]}${ryzenMatch[2] ? " PRO" : ""}`;
  }
  return raw
    .replace(/Intel\s+/i, "")
    .replace(/\(.*?\)/g, "")
    .replace(/,\s*.*$/, "")
    .replace(/\d+(\.\d+)?\s*GHz.*$/i, "")
    .trim();
}

function cleanRAM(raw?: string): string {
  if (!raw) return "";
  const match = raw.match(/(\d+\s*GB)/i);
  return match ? match[1].replace(/\s+/g, "") : raw.split(" ")[0];
}

function cleanStorage(raw?: string): string {
  if (!raw) return "";
  const match = raw.match(/(\d+\s*(?:GB|TB))\s*(?:NVMe|M\.2|PCIe)?\s*(SSD|HDD)?/i);
  if (match) {
    const size = match[1].replace(/\s+/g, "");
    const type = match[2] || "SSD";
    return `${size} ${type}`;
  }
  return raw.replace(/NVMe|PCIe|M\.2/gi, "").trim();
}

export default function HomeProductCard({
  product,
  priority = false,
}: HomeProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [addedToCart, setAddedToCart] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const stockQty = product.stockQty;
  const isOutOfStock =
    product.inStock === false || (typeof stockQty === "number" && stockQty <= 0);
  const isLowStock =
    typeof stockQty === "number" && stockQty >= 1 && stockQty <= 5;

  // Validate discount (guards against extreme discounts >60% like 91% on LEN-T14G2-018)
  const discountInfo = getValidDiscount(
    product.price,
    product.originalPrice,
    product.sku
  );

  // Condition pill styling by semantic meaning
  const rawCondition =
    product.grade ||
    (product.condition && product.condition.length > 0 ? product.condition[0] : "") ||
    "Refurbished";
  const conditionLabel = rawCondition.replace(/^grade\s+/i, "").trim() || "A";

  const isLikeNewOrPremium = /like\s*new|premium|flawless|mint/i.test(conditionLabel);
  const isGradeA = /^(a\+?|grade\s*a\+?)$/i.test(conditionLabel);

  let conditionClasses = "bg-surface text-ink-2 border border-line";
  let conditionAria = `Condition: ${conditionLabel}`;
  if (isLikeNewOrPremium) {
    conditionClasses = "bg-brand-navy/10 text-brand-navy border border-brand-navy/20 font-semibold";
    conditionAria = `Condition: ${conditionLabel} - flawless pre-owned laptop`;
  } else if (isGradeA) {
    conditionClasses = "bg-success/10 text-success border border-success/20 font-semibold";
    conditionAria = `Condition: Grade ${conditionLabel} - certified tested hardware`;
  }

  // Build spec chips (max 3: CPU, RAM, Storage)
  const specChips: string[] = [];
  const proc = cleanProcessor(product.specs?.processor);
  if (proc) specChips.push(proc);
  const ram = cleanRAM(product.specs?.ram);
  if (ram) specChips.push(ram);
  const storage = cleanStorage(product.specs?.storage);
  if (storage) specChips.push(storage);

  // Trust cue from existing product data
  const trustCue =
    product.warranty ||
    (product.features && product.features.find((f: string) => /warranty/i.test(f))) ||
    null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addToCart({
      id: product.id.toString(),
      name: product.name,
      brand: product.brand || "",
      price: product.price,
      originalPrice: product.originalPrice || 0,
      image: typeof product.image === "string" ? product.image : product.image.src,
      specs: product.specs,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const priceFormatted = Math.round(product.price).toLocaleString("en-BD");

  return (
    <article className="@container group relative flex flex-col bg-surface border border-line rounded-[var(--radius-md)] overflow-hidden transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-lift motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none focus-within:ring-2 focus-within:ring-brand-navy focus-within:ring-offset-2">
      {/* 1. Stretched Link (First in Tab Order) */}
      <Link
        href={`/product/${product.slug}`}
        className="absolute inset-0 z-0 rounded-[var(--radius-md)] focus:outline-none"
        tabIndex={0}
        aria-label={`View details for ${product.name}`}
      >
        <span className="sr-only">{product.name}</span>
      </Link>

      {/* 2. Media Area (Aspect 4:3, bg surface-2, radial highlight, p-5 inset padding) */}
      <div className="relative aspect-4/3 w-full bg-surface-2 p-5 flex items-center justify-center overflow-hidden border-b border-line/60">
        {/* Subtle luminous spotlight behind laptop */}
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.9)_0%,rgba(248,250,252,0.4)_70%,transparent_100%)] pointer-events-none"
          aria-hidden="true"
        />

        {/* Top-Left: Condition Pill (meaning-driven color) */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span
            className={`inline-flex items-center text-caption px-2.5 py-0.5 rounded-full shadow-xs ${conditionClasses}`}
            title={conditionAria}
            aria-label={conditionAria}
          >
            {conditionLabel}
          </span>
        </div>

        {/* Top-Right: Wishlist Button (Second in Tab Order, white circular chip, 44x44 target) */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <button
            type="button"
            tabIndex={0}
            onClick={handleToggleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isWishlisted}
            className={`w-11 h-11 flex items-center justify-center rounded-full bg-surface shadow-soft border border-line/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-1 ${
              isWishlisted
                ? "text-brand-red bg-surface"
                : "text-muted-text hover:text-brand-red hover:bg-surface-2"
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform active:scale-90 ${
                isWishlisted ? "fill-brand-red text-brand-red" : ""
              }`}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Bottom-Left: "Save ৳X" chip (Only rendered when valid discount exists) */}
        {discountInfo && (
          <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
            <span className="inline-flex items-center text-caption font-bold text-brand-red bg-brand-red/10 border border-brand-red/20 px-2 py-0.5 rounded-full shadow-xs">
              {discountInfo.savingsFormatted}
            </span>
          </div>
        )}

        {/* Product Image (Safe from overlap with p-5 padding) */}
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            className="object-contain p-1 mix-blend-multiply transition-transform duration-200 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
          />
        </div>
      </div>

      {/* 3. Card Body (p-3.5 sm:p-4, 8-pt gap rhythm) */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4 gap-2">
        {/* Brand Caption */}
        <div className="text-caption font-semibold uppercase tracking-[0.06em] text-muted-text truncate leading-none">
          {product.brand || "Refurbished Laptop"}
        </div>

        {/* Title: 2 lines reserved for alignment */}
        <h3
          className="text-small font-semibold text-ink line-clamp-2 min-h-[2.5rem] leading-snug group-hover:text-brand-navy transition-colors"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Spec Chips (CPU, RAM, Storage - wrapped without mid-token truncation) */}
        {specChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 my-0.5 max-h-14 overflow-hidden">
            {specChips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center text-caption font-medium bg-surface-3 text-ink-2 px-2 py-0.5 rounded-full"
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        {/* Price Row: Current price in brand-red + inline struck price + % pill */}
        <div
          className="flex items-baseline gap-2 flex-wrap mt-0.5"
          aria-label={
            discountInfo
              ? `Price ৳${priceFormatted}, was ${formatBDT(product.originalPrice)}`
              : `Price ৳${priceFormatted}`
          }
        >
          <span className="text-body @[12rem]:text-h3 font-bold text-brand-red tabular-nums leading-none">
            <span className="text-[0.8em] font-normal mr-0.5 align-baseline" aria-hidden="true">
              ৳
            </span>
            {priceFormatted}
          </span>

          {discountInfo && product.originalPrice && (
            <>
              <span className="text-small text-muted-text line-through tabular-nums">
                {formatBDT(product.originalPrice)}
              </span>
              <span className="text-caption font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded-sm">
                −{discountInfo.percent}%
              </span>
            </>
          )}
        </div>

        {/* Stock & Trust Cue Line */}
        <div className="flex items-center gap-1.5 text-caption mt-0.5">
          {isOutOfStock ? (
            <span className="text-muted-text font-medium">Out of stock</span>
          ) : isLowStock ? (
            <span className="text-warning font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" aria-hidden="true" />
              Only {stockQty} left
            </span>
          ) : (
            <span className="text-success font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden="true" />
              In stock
            </span>
          )}

          {trustCue && !isOutOfStock && (
            <span className="text-muted-text font-normal truncate">
              · {typeof trustCue === "string" ? trustCue.slice(0, 22) : "Tested & warrantied"}
            </span>
          )}
        </div>

        {/* 4. Action Row (Pinned to bottom, Third in Tab Order) */}
        <div className="mt-auto pt-2">
          <button
            type="button"
            tabIndex={0}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={
              isOutOfStock
                ? `${product.name} is out of stock`
                : addedToCart
                ? `Added ${product.name} to cart`
                : `Add ${product.name} to cart`
            }
            className={`relative z-10 w-full h-11 px-4 rounded-[var(--radius-md)] text-small font-semibold flex items-center justify-center gap-2 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 ${
              isOutOfStock
                ? "bg-surface-3 text-muted-text cursor-not-allowed border border-line"
                : addedToCart
                ? "bg-success text-white shadow-soft"
                : "bg-brand-red hover:bg-brand-red-hover text-white shadow-soft hover:shadow-lift active:scale-[0.98]"
            }`}
          >
            {addedToCart ? (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                <span aria-live="polite">Added ✓</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of stock</span>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="hidden @[10rem]:inline">Add to cart</span>
                <span className="inline @[10rem]:hidden">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
