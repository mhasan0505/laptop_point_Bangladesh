"use client";

import { Button } from "@/components/ui/button";
import ProductsCard from "@/components/ui/ProductsCard";
import TrustBadges from "@/components/ui/TrustBadges";
import { useCart } from "@/contexts/CartContext";
import { useComparison } from "@/contexts/ComparisonContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Product } from "@/types/product";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Share2,
  ShoppingBag,
  ShoppingCart,
  Star,
  X,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

interface ProductDetailsClientProps {
  product: Product;
  relatedProducts: Product[];
}

type EmiRateProfile = "scb" | "lankabangla" | "allBanks";

type EmiBankOption = {
  key: string;
  label: string;
  profile: EmiRateProfile;
  maxAmount?: number;
};

const EMI_MIN_AMOUNT = 5000;
const GALLERY_AUTOPLAY_INTERVAL_MS = 5200;
const GALLERY_MANUAL_PAUSE_MS = 14000;

// Source: SSLCOMMERZ-EMI-19-1.pdf shared in project root.
const EMI_RATES_BY_MONTH: Record<
  number,
  { scb: number | null; lankabangla: number | null; allBanks: number | null }
> = {
  3: { scb: 3.5, lankabangla: 3.5, allBanks: 3.0 },
  6: { scb: 5.5, lankabangla: 4.5, allBanks: 4.5 },
  9: { scb: 8.0, lankabangla: 6.5, allBanks: 6.5 },
  12: { scb: 10.5, lankabangla: 8.5, allBanks: 8.5 },
  18: { scb: 13.5, lankabangla: 11.5, allBanks: 11.5 },
  24: { scb: 17.5, lankabangla: 15.5, allBanks: 15.5 },
  30: { scb: null, lankabangla: null, allBanks: 16.5 },
  36: { scb: 22.5, lankabangla: 19.5, allBanks: 19.5 },
};

const EMI_BANK_OPTIONS: EmiBankOption[] = [
  { key: "all-banks", label: "All Banks (Default)", profile: "allBanks" },
  {
    key: "standard-chartered",
    label: "Standard Chartered Bank",
    profile: "scb",
  },
  {
    key: "lankabangla",
    label: "LankaBangla",
    profile: "lankabangla",
  },
  { key: "brac", label: "BRAC Bank", profile: "allBanks" },
  { key: "city", label: "City Bank", profile: "allBanks" },
  { key: "dbbl", label: "Dutch Bangla Bank", profile: "allBanks" },
  { key: "southeast", label: "Southeast Bank", profile: "allBanks" },
  { key: "mtb", label: "Mutual Trust Bank", profile: "allBanks" },
  { key: "ebl", label: "Eastern Bank", profile: "allBanks" },
  { key: "bank-asia", label: "Bank Asia", profile: "allBanks" },
  {
    key: "dhaka-bank",
    label: "Dhaka Bank",
    profile: "allBanks",
    maxAmount: 200000,
  },
  { key: "meghna", label: "Meghna Bank", profile: "allBanks" },
  { key: "jamuna", label: "Jamuna Bank", profile: "allBanks" },
  { key: "ncc", label: "NCC Bank", profile: "allBanks" },
  { key: "nrb", label: "NRB Bank", profile: "allBanks" },
  { key: "nrbc", label: "NRBC Bank", profile: "allBanks" },
  {
    key: "sbac",
    label: "South Bangla Agriculture Bank",
    profile: "allBanks",
  },
  { key: "midland", label: "Midland Bank", profile: "allBanks" },
  { key: "sjibl", label: "Shahjalal Islami Bank", profile: "allBanks" },
];

export default function ProductDetailsClient({
  product,
  relatedProducts,
}: ProductDetailsClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToComparison, removeFromComparison, isInComparison, canAddMore } =
    useComparison();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("specifications");
  const [selectedBank, setSelectedBank] = useState(EMI_BANK_OPTIONS[0].key);
  const [selectedTenure, setSelectedTenure] = useState(3);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPos, setHoverPos] = useState({ x: 50, y: 50 });
  const [lastManualImageActionAt, setLastManualImageActionAt] = useState(0);
  const mainImgRef = useRef<HTMLDivElement>(null);

  // Variant selection
  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(-1);
  const selectedVariant =
    hasVariants && selectedVariantIndex >= 0
      ? product.variants![selectedVariantIndex]
      : null;

  // Use variant price when a variant is selected
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayOriginalPrice = selectedVariant
    ? selectedVariant.originalPrice || product.originalPrice
    : product.originalPrice;

  const galleryImages = useMemo(
    () =>
      product.images && product.images.length > 0
        ? product.images
        : [product.image],
    [product.images, product.image],
  );

  const getImageSrc = (img: Product["image"]) =>
    typeof img === "string" ? img : img.src;

  const safeImageIndex =
    galleryImages.length > 0
      ? Math.min(activeImageIndex, galleryImages.length - 1)
      : 0;
  const currentImage = galleryImages[safeImageIndex] || product.image;
  const currentImageSrc = getImageSrc(currentImage);

  useEffect(() => {
    if (!isViewerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsViewerOpen(false);
      }
      if (event.key === "ArrowRight" && galleryImages.length > 1) {
        setActiveImageIndex((i) => (i + 1) % galleryImages.length);
      }
      if (event.key === "ArrowLeft" && galleryImages.length > 1) {
        setActiveImageIndex(
          (i) => (i - 1 + galleryImages.length) % galleryImages.length,
        );
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isViewerOpen, galleryImages.length]);

  useEffect(() => {
    if (galleryImages.length < 2 || isViewerOpen || isHovering) return;

    const intervalId = window.setInterval(() => {
      const inManualCooldown =
        Date.now() - lastManualImageActionAt < GALLERY_MANUAL_PAUSE_MS;

      if (inManualCooldown) return;

      setActiveImageIndex((idx) => (idx + 1) % galleryImages.length);
    }, GALLERY_AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [galleryImages.length, isViewerOpen, isHovering, lastManualImageActionAt]);

  useEffect(() => {
    if (typeof window === "undefined" || !product) return;

    const saved = localStorage.getItem("recentlyViewed");
    let recent: Product[] = [];

    if (saved) {
      try {
        recent = JSON.parse(saved);
      } catch {
        recent = [];
      }
    }

    recent = recent.filter((p) => p.id !== product.id);
    recent.unshift(product);
    recent = recent.slice(0, 10);

    localStorage.setItem("recentlyViewed", JSON.stringify(recent));
  }, [product]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!mainImgRef.current) return;

    const rect = mainImgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setHoverPos({ x, y });
  };

  const goToNextImage = () => {
    if (galleryImages.length < 2) return;
    setLastManualImageActionAt(Date.now());
    setActiveImageIndex((i) => (i + 1) % galleryImages.length);
  };

  const goToPrevImage = () => {
    if (galleryImages.length < 2) return;
    setLastManualImageActionAt(Date.now());
    setActiveImageIndex(
      (i) => (i - 1 + galleryImages.length) % galleryImages.length,
    );
  };

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id.toString(),
        name: selectedVariant
          ? `${product.name} (${selectedVariant.name})`
          : product.name,
        brand: product.brand || "",
        price: displayPrice,
        originalPrice: displayOriginalPrice || 0,
        image: currentImageSrc,
        variantName: selectedVariant?.name,
        variantId: selectedVariant?._key || selectedVariant?.name,
      },
      quantity,
    );
  };

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInComparison(product.id);
  const discountPercentage = displayOriginalPrice
    ? Math.round(
        ((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100,
      )
    : 0;
  const avgRating = product.rating || 0;
  const reviews = product.reviews || 0;
  const conditionLabel = product.condition?.[0] || "Used";
  const isUsedCondition = /^(u|used)$/i.test(conditionLabel.trim());
  const quickSpecs = [
    product.specs?.processor,
    product.specs?.ram,
    product.specs?.storage,
  ]
    .filter(Boolean)
    .join(" • ");

  const selectedBankConfig =
    EMI_BANK_OPTIONS.find((bank) => bank.key === selectedBank) ||
    EMI_BANK_OPTIONS[0];

  const availableTenures = useMemo(
    () =>
      Object.keys(EMI_RATES_BY_MONTH)
        .map((month) => Number(month))
        .filter(
          (month) =>
            EMI_RATES_BY_MONTH[month][selectedBankConfig.profile] !== null,
        )
        .sort((a, b) => a - b),
    [selectedBankConfig.profile],
  );

  useEffect(() => {
    if (!availableTenures.includes(selectedTenure)) {
      setSelectedTenure(availableTenures[0] || 3);
    }
  }, [availableTenures, selectedTenure]);

  const selectedRate =
    EMI_RATES_BY_MONTH[selectedTenure]?.[selectedBankConfig.profile] ?? null;

  const isEmiEligibleByAmount = displayPrice >= EMI_MIN_AMOUNT;
  const isWithinBankMaxAmount =
    selectedBankConfig.maxAmount === undefined ||
    displayPrice <= selectedBankConfig.maxAmount;
  const isEmiEligible =
    isEmiEligibleByAmount && isWithinBankMaxAmount && selectedRate !== null;

  const emiCharge = isEmiEligible
    ? (displayPrice * (selectedRate as number)) / 100
    : 0;
  const emiTotalPayable = isEmiEligible ? displayPrice + emiCharge : 0;
  const emiMonthlyInstallment = isEmiEligible
    ? emiTotalPayable / selectedTenure
    : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: currentImageSrc,
    description: product.description?.short,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      url: `https://laptoppointbd.com/product/${product.slug}`,
      priceCurrency: "BDT",
      price: displayPrice,
      itemCondition: "https://schema.org/UsedCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="min-h-screen bg-background py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to results
          </button>
        </div>

        <div className="mb-14 rounded-3xl border border-border bg-card shadow-[0_8px_40px_rgba(0,0,0,0.07)]">
          <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14">
            <div className="flex min-w-0 flex-col gap-5">
              <div
                ref={mainImgRef}
                className="group relative aspect-4/3 w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border bg-linear-to-br from-secondary/40 to-secondary/80"
                role="button"
                tabIndex={0}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => setIsViewerOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setIsViewerOpen(true);
                  }
                }}
                aria-label="Open full image view"
              >
                {isHovering && (
                  <div
                    className="pointer-events-none absolute inset-0 z-10"
                    style={{
                      backgroundImage: `url(${currentImageSrc})`,
                      backgroundSize: "250%",
                      backgroundPosition: `${hoverPos.x}% ${hoverPos.y}%`,
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                )}

                <Image
                  src={currentImageSrc}
                  alt={product.name}
                  fill
                  className="object-contain p-6 transition-all duration-500"
                  priority
                  unoptimized={currentImageSrc.startsWith("http")}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />

                <div className="absolute left-3 top-3 z-20 flex flex-col gap-1.5">
                  <span className="rounded-full bg-primary px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-primary-foreground shadow-lg">
                    {product.brand || "Laptop"}
                  </span>

                  {isUsedCondition && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-amber-800 shadow-lg">
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-amber-600 text-[0.55rem] text-white">
                        U
                      </span>
                      Used Laptop
                    </span>
                  )}
                </div>

                {discountPercentage > 0 && (
                  <div className="absolute right-3 top-3 z-20">
                    <span className="rounded-full bg-red-500 px-2.5 py-1 text-[0.65rem] font-bold text-white shadow-lg">
                      -{discountPercentage}%
                    </span>
                  </div>
                )}

                <span className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-[0.65rem] text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                  <ZoomIn className="h-3 w-3" />
                  Click to zoom
                </span>

                {galleryImages.length > 1 && (
                  <div className="absolute bottom-3 left-3 z-20 rounded-full bg-black/40 px-2.5 py-1 text-[0.65rem] text-white backdrop-blur-sm">
                    {safeImageIndex + 1}/{galleryImages.length}
                  </div>
                )}

                {galleryImages.length > 1 && (
                  <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center px-14 sm:px-20">
                    <div className="flex max-w-full items-center gap-1.5 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
                      {galleryImages.map((_, idx) => (
                        <button
                          key={`dot-${idx}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setLastManualImageActionAt(Date.now());
                            setActiveImageIndex(idx);
                          }}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === safeImageIndex
                              ? "w-6 bg-white"
                              : "w-2 bg-white/45 hover:bg-white/70"
                          }`}
                          aria-label={`Go to image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        goToPrevImage();
                      }}
                      className="absolute left-2 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/80 opacity-0 shadow transition-all duration-300 hover:scale-110 hover:bg-white group-hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-4 w-4 text-foreground" />
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        goToNextImage();
                      }}
                      className="absolute right-2 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/80 opacity-0 shadow transition-all duration-300 hover:scale-110 hover:bg-white group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-4 w-4 text-foreground" />
                    </button>
                  </>
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={`${String(img)}-${idx}`}
                      onClick={() => {
                        setLastManualImageActionAt(Date.now());
                        setActiveImageIndex(idx);
                      }}
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                        idx === safeImageIndex
                          ? "scale-105 border-primary shadow-[0_0_0_3px_rgba(47,84,235,0.2)]"
                          : "border-border opacity-70 hover:scale-105 hover:border-primary/60 hover:opacity-100"
                      }`}
                      aria-label={`Show image ${idx + 1}`}
                    >
                      <Image
                        src={getImageSrc(img)}
                        alt={`${product.name} view ${idx + 1}`}
                        fill
                        className="object-contain p-1.5"
                        unoptimized={getImageSrc(img).startsWith("http")}
                        sizes="64px"
                      />
                    </button>
                  ))}

                  <button
                    onClick={() => setIsViewerOpen(true)}
                    className="relative flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-all duration-200 hover:scale-105 hover:border-primary hover:text-primary"
                    aria-label="Open gallery"
                  >
                    <ZoomIn className="h-4 w-4" />
                    <span className="text-[0.6rem] font-semibold">Gallery</span>
                  </button>
                </div>
              )}
              <TrustBadges variant="row" warranty={product.warranty} />
              {/* <div className="grid grid-cols-1 gap-3 pt-2 min-[420px]:grid-cols-3">
                {[
                  {
                    icon: Shield,
                    label: "Secure Payment",
                    desc: "SSL encrypted",
                  },
                  { icon: Award, label: "Certified", desc: conditionLabel },
                  {
                    icon: RotateCcw,
                    label: "Easy Returns",
                    desc: "7-day returns",
                  },
                ].map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border bg-card p-4 text-center"
                  >
                    <Icon className="mx-auto mb-1 h-4 w-4 text-primary" />
                    <p className="text-[0.65rem] font-bold leading-tight text-foreground">
                      {label}
                    </p>
                    <p className="text-[0.6rem] leading-tight text-muted-foreground">
                      {desc}
                    </p>
                  </div>
                ))}
              </div> */}
            </div>

            <div className="flex min-w-0 flex-col gap-7">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-primary-foreground">
                    {product.brand || "Laptop"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-amber-800">
                    <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-amber-600 text-[0.55rem] text-white">
                      U
                    </span>
                    {isUsedCondition ? "Used" : conditionLabel}
                  </span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[0.65rem] font-bold text-primary">
                    {product.category || "Computing"}
                  </span>
                </div>

                <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                  {product.name}
                </h1>

                {quickSpecs && (
                  <p className="mt-1 wrap-break-word text-sm font-medium text-muted-foreground">
                    {quickSpecs}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${
                          avgRating >= s
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({reviews} reviews)
                  </span>
                  <button className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:underline hover:text-foreground transition-colors">
                    <MessageCircle className="h-3 w-3" />
                    Write a review
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-baseline gap-3 mt-2">
                {displayOriginalPrice && displayOriginalPrice > displayPrice ? (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      {displayOriginalPrice.toLocaleString()}৳
                    </span>
                    <span className="text-3xl font-bold text-[#f56523]">
                      {displayPrice.toLocaleString()}৳
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {displayPrice.toLocaleString()}৳
                  </span>
                )}
              </div>

              {/* Variant Selector */}
              {hasVariants && (
                <div className="mt-4">
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Configuration
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants!.map((variant, index) => (
                      <button
                        key={variant._key || variant.name}
                        onClick={() => setSelectedVariantIndex(index)}
                        className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                          selectedVariantIndex === index
                            ? "border-[#f56523] bg-[#f56523]/5 text-[#f56523] ring-1 ring-[#f56523]/20"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span className="block">{variant.name}</span>
                        <span className="block text-xs font-semibold mt-0.5">
                          {variant.price.toLocaleString()}৳
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.features && product.features.length > 0 && (
                <ul className="space-y-3.5 mt-2">
                  {product.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 wrap-break-word text-sm text-gray-800 dark:text-gray-200"
                    >
                      <span className="w-1.5 h-1.5 bg-gray-900 dark:bg-gray-100 mt-2 shrink-0 rounded-[1px]" />
                      <span className="leading-tight font-medium">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Stock Status */}
              <div className="mt-1">
                {!product.inStock ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-sm font-semibold text-red-600">
                    <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                    Out of stock
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-sm font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                    In stock · Ready to ship
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    Quantity:
                  </span>
                  <div className="flex items-center overflow-hidden rounded-xl border border-border bg-card">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-9 w-9 items-center justify-center text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-10 text-center text-sm font-bold text-foreground">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="flex h-9 w-9 items-center justify-center text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    className="w-full rounded-xl px-6 py-3.5 text-sm font-bold shadow-[0_4px_20px_rgba(0,0,0,0.13)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.18)] sm:flex-1"
                    onClick={handleAddToCart}
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>

                  <button
                    onClick={() =>
                      isWishlisted
                        ? removeFromWishlist(product.id)
                        : addToWishlist(product)
                    }
                    className={`grid h-12 w-12 place-items-center rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${
                      isWishlisted
                        ? "border-red-300 bg-red-50 text-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                        : "border-border bg-card text-muted-foreground hover:border-red-300 hover:text-red-400"
                    }`}
                    aria-label={
                      isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                    }
                  >
                    <Heart
                      className={`h-4.5 w-4.5 ${isWishlisted ? "fill-current" : ""}`}
                    />
                  </button>

                  <button
                    onClick={() =>
                      isCompared
                        ? removeFromComparison(product.id)
                        : canAddMore() && addToComparison(product)
                    }
                    disabled={!isCompared && !canAddMore()}
                    className={`grid h-12 w-12 place-items-center rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${
                      isCompared
                        ? "border-yellow-300 bg-yellow-50 text-yellow-600"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary"
                    }`}
                    aria-label={
                      isCompared
                        ? "Remove from comparison"
                        : "Add to comparison"
                    }
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
                {/* chat section */}
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://wa.me/+8801612182408?text=I'm%20interested%20in%20the%20product%20${product.name}%20(https://laptoppointbd.com/product/${product.slug})`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100 sm:flex-1"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Chat &amp; Order
                  </a>
                  <a
                    href="https://m.me/laptoppointbd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-100 sm:flex-1"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.928 1.42 5.54 3.644 7.255V21.5l3.338-1.834A11.5 11.5 0 0 0 12 20c5.523 0 10-4.144 10-9.741C22 6.145 17.523 2 12 2Zm1.004 13.128-2.55-2.718-4.97 2.718 5.47-5.808 2.612 2.718 4.908-2.718-5.47 5.808Z" />
                    </svg>
                    Messenger
                  </a>
                  <a
                    href="tel:+8801701561395"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary sm:flex-1"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call to Buy
                  </a>
                </div>
                {/* SSL Commerce EMI */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-white">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      SSLCommerz EMI
                    </span>
                    <span className="text-xs font-semibold text-emerald-800">
                      Minimum purchase: {EMI_MIN_AMOUNT.toLocaleString()}৳
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                      Bank
                      <select
                        value={selectedBank}
                        onChange={(event) =>
                          setSelectedBank(event.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-emerald-200 bg-white px-2.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      >
                        {EMI_BANK_OPTIONS.map((bank) => (
                          <option key={bank.key} value={bank.key}>
                            {bank.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                      Tenure
                      <select
                        value={selectedTenure}
                        onChange={(event) =>
                          setSelectedTenure(Number(event.target.value))
                        }
                        className="mt-1 w-full rounded-lg border border-emerald-200 bg-white px-2.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      >
                        {availableTenures.map((month) => (
                          <option key={month} value={month}>
                            {month} months
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {isEmiEligible ? (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-white px-3 py-2.5 text-xs text-emerald-900">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold">
                          Interest / Processing Rate
                        </span>
                        <span className="font-bold">{selectedRate}%</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold">Total payable</span>
                        <span className="font-bold">
                          {emiTotalPayable.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                          ৳
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold">
                          Monthly installment
                        </span>
                        <span className="text-sm font-extrabold text-emerald-700">
                          {emiMonthlyInstallment.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                          ৳ / month
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs font-semibold text-red-600">
                      {isEmiEligibleByAmount
                        ? `This bank supports EMI up to ${selectedBankConfig.maxAmount?.toLocaleString()}৳.`
                        : `EMI starts from ${EMI_MIN_AMOUNT.toLocaleString()}৳ purchase amount.`}
                    </p>
                  )}

                  <p className="mt-2 text-[11px] text-emerald-700">
                    Calculation follows the SSLCOMMERZ EMI chart
                    (SSLCOMMERZ-EMI-19-1). Final approval depends on issuing
                    bank policy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border px-6 pb-12 pt-10 sm:px-10">
            <div className="flex flex-wrap gap-2 border-b border-border pb-5">
              {[
                { key: "specifications", label: "Specifications" },
                { key: "description", label: "Description" },
                { key: "reviews", label: "Reviews" },
                { key: "shipping", label: "Shipping" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-secondary/25 p-4 sm:p-8">
              {activeTab === "description" && (
                <div className="max-w-4xl space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <p className="text-base font-bold text-foreground">
                    {product.description?.short ||
                      "No short description available."}
                  </p>
                  <div
                    className="whitespace-pre-wrap wrap-break-word **:max-w-full [&_table]:block [&_table]:overflow-x-auto"
                    dangerouslySetInnerHTML={{
                      __html:
                        product.description?.full?.replace(
                          /(^.*?\?$)/gm,
                          "<strong>$1</strong>",
                        ) || "Full description coming soon...",
                    }}
                  />
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2">
                  {product.specs &&
                    Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="border-b border-border py-3">
                        <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          {key}
                        </span>
                        <span className="wrap-break-word font-medium text-foreground">
                          {value as string}
                        </span>
                      </div>
                    ))}
                  <div className="border-b border-border py-3">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Stock ID
                    </span>
                    <span className="font-medium text-foreground">
                      {product.sku || "N/A"}
                    </span>
                  </div>
                  {product.warranty &&
                    (product.warranty.period || product.warranty.type) && (
                      <div className="border-b border-border py-3">
                        <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Warranty
                        </span>
                        <span className="font-medium text-foreground">
                          {[
                            product.warranty.period,
                            product.warranty.type,
                            product.warranty.details,
                          ]
                            .filter(Boolean)
                            .join(" - ")}
                        </span>
                      </div>
                    )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="mx-auto max-w-2xl py-10 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50 text-yellow-500">
                    <Star className="h-8 w-8 fill-current" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-foreground">
                    No Reviews Yet
                  </h3>
                  <p className="mb-6 text-muted-foreground">
                    Be the first to review this product.
                  </p>
                  <Button variant="outline">Write a Review</Button>
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="font-bold text-foreground">Delivery</p>
                    <p className="mt-1">Fast delivery all over Bangladesh.</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="font-bold text-foreground">Returns</p>
                    <p className="mt-1">
                      7-day easy return policy for hardware issues.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-yellow-500">
                  Picked for you
                </p>
                <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  You might also want
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <div key={p.id} className="flex justify-center">
                  <ProductsCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isViewerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm md:p-8"
          onClick={() => setIsViewerOpen(false)}
        >
          <button
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:right-6 md:top-6"
            onClick={() => setIsViewerOpen(false)}
            aria-label="Close image viewer"
          >
            <X className="h-5 w-5" />
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:left-6"
                onClick={(event) => {
                  event.stopPropagation();
                  goToPrevImage();
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:right-6"
                onClick={(event) => {
                  event.stopPropagation();
                  goToNextImage();
                }}
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div
            className="relative h-full max-h-[85vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={currentImage}
              alt={product.name}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {galleryImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
              {safeImageIndex + 1} / {galleryImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
