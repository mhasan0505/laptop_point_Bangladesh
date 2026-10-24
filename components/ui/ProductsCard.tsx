"use client";

import QuickViewModal from "@/components/product/QuickViewModal";
import { useCart } from "@/contexts/CartContext";
import { useComparison } from "@/contexts/ComparisonContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { getProductBulletSpecs } from "@/components/home/HomeProductCard";
import { getValidDiscount } from "@/lib/pricing-display";
import { Product } from "@/types/product";
import { CheckSquare, Eye, Heart, PlusSquare, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductsCardProps {
  product: Product;
}

const ProductsCard = ({ product }: ProductsCardProps) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToComparison, removeFromComparison, isInComparison, canAddMore } =
    useComparison();
  const [showQuickView, setShowQuickView] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInComparison(product.id);

  const stockQty = product.stockQty;
  const isOutOfStock =
    product.inStock === false ||
    (typeof stockQty === "number" && stockQty <= 0);

  const discountInfo = getValidDiscount(
    product.price,
    product.originalPrice,
    product.sku,
  );

  const primaryImage =
    product.image ||
    (product.images && product.images.length > 0 ? product.images[0] : "") ||
    "/Hero_Image.png";

  const secondaryImage =
    product.images && product.images.length > 1
      ? product.images.find((img) => img !== primaryImage) || product.images[1]
      : null;

  const hasSecondary = Boolean(secondaryImage);

  const bulletSpecs = getProductBulletSpecs(product);
  const priceFormatted = Math.round(product.price).toLocaleString("en-BD");

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addToCart({
      id: product.id.toString(),
      name: product.name,
      brand: product.brand || "",
      price: product.price,
      originalPrice: product.originalPrice || 0,
      image:
        typeof product.image === "string" ? product.image : product.image.src,
      specs: product.specs,
    });

    router.push("/checkout");
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const toggleComparison = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromComparison(product.id);
    } else if (canAddMore()) {
      addToComparison(product);
    }
  };

  return (
    <article className="group relative flex flex-col justify-between h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/50 hover:border-slate-300 dark:hover:border-slate-700">
      {/* Top: Media Area with subtle floating buttons */}
      <div className="relative w-full aspect-4/3 max-h-48 sm:max-h-52 flex items-center justify-center p-2 mb-3 overflow-hidden">
        {/* Discount Badge */}
        {discountInfo && (
          <div className="absolute top-0 left-0 z-10 pointer-events-none">
            <span className="inline-flex items-center text-[11px] font-bold text-white bg-[#dc0303] px-2 py-0.5 rounded shadow-xs">
              -{discountInfo.percent}%
            </span>
          </div>
        )}

        {/* Floating Quick Action Buttons (Top Right) */}
        <div className="absolute top-0 right-0 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowQuickView(true);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white bg-white/80 dark:bg-slate-800/80 shadow-xs transition-colors"
            title="Quick View"
            aria-label="Quick View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isWishlisted}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isWishlisted
                ? "text-brand-red bg-red-50 dark:bg-red-950/40"
                : "text-slate-400 hover:text-brand-red bg-white/80 dark:bg-slate-800/80 shadow-xs"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${isWishlisted ? "fill-brand-red text-brand-red" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Product Images with smooth crossfade on card hover */}
        <Link
          href={`/product/${product.slug}`}
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* Primary image */}
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-contain p-1 transition-all duration-500 ease-out group-hover:scale-105 ${
              hasSecondary ? "group-hover:opacity-0" : ""
            }`}
          />

          {/* Secondary image (fades in on card hover) */}
          {hasSecondary && secondaryImage && (
            <Image
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-1 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105 absolute inset-0"
            />
          )}
        </Link>
      </div>

      {/* Middle: Title & Bullet Specifications */}
      <div className="flex flex-col flex-1">
        {/* Product Title */}
        <h3 className="font-bold text-[14px] sm:text-[15px] text-slate-900 dark:text-white leading-snug line-clamp-2 min-h-[2.6rem] group-hover:text-brand-navy dark:group-hover:text-primary transition-colors mb-3">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>

        {/* Spec Bullets */}
        <ul className="space-y-1.5 mb-4 text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
          {bulletSpecs.map((spec, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-slate-400 font-bold shrink-0 leading-normal">•</span>
              <span className="line-clamp-1">{spec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom: Price + Action Buttons */}
      <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/80">
        {/* Centered Red Price */}
        <div className="text-center my-3">
          {discountInfo && product.originalPrice && product.originalPrice > product.price && (
            <div className="flex items-center justify-center gap-2 mb-0.5">
              <span className="text-xs text-slate-600 dark:text-slate-400 line-through tabular-nums">
                {Math.round(product.originalPrice).toLocaleString("en-BD")}৳
              </span>
            </div>
          )}
          <div className="text-xl sm:text-[22px] font-bold text-[#dc0303] font-mono tracking-tight leading-none">
            {priceFormatted}৳
          </div>
        </div>

        {/* Buy Now Button with smooth background color change on card hover */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className={`w-full py-2 sm:py-2.5 px-4 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ease-out ${
            isOutOfStock
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-[#edf2f9] text-[#002b60] group-hover:bg-[#002b60] group-hover:text-white hover:bg-[#001f47] group-hover:shadow-md active:scale-[0.98] dark:bg-slate-800 dark:text-blue-300 dark:group-hover:bg-[#003882] dark:group-hover:text-white dark:hover:bg-[#002860]"
          }`}
        >
          <ShoppingCart
            className="w-4 h-4 text-[#002b60] dark:text-blue-300 group-hover:text-white transition-colors duration-300 shrink-0"
            aria-hidden="true"
          />
          <span className="transition-colors duration-300">
            {isOutOfStock ? "Out of Stock" : "Buy Now"}
          </span>
        </button>

        {/* Add to Compare Button */}
        <button
          type="button"
          onClick={toggleComparison}
          disabled={!canAddMore() && !isCompared}
          className={`w-full py-1.5 mt-1.5 flex items-center justify-center gap-1.5 text-xs transition-colors ${
            isCompared
              ? "text-brand-navy dark:text-blue-400 font-semibold"
              : !canAddMore()
              ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
          title={isCompared ? "Remove from comparison" : "Add to comparison"}
        >
          {isCompared ? (
            <>
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Added to Compare</span>
            </>
          ) : (
            <>
              <PlusSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Add to Compare</span>
            </>
          )}
        </button>
      </div>

      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </article>
  );
};

export default ProductsCard;
