"use client";

import { Button } from "@/components/ui/button";
import ProductsCard from "@/components/ui/ProductsCard";
import { useCart } from "@/contexts/CartContext";
import { useComparison } from "@/contexts/ComparisonContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Product } from "@/types/product";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  RotateCcw,
  Share2,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Star,
  ZoomIn,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";

interface ProductDetailsClientProps {
  product: Product;
  relatedProducts: Product[];
}

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
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPos, setHoverPos] = useState({ x: 50, y: 50 });
  const mainImgRef = useRef<HTMLDivElement>(null);

  const galleryImages = useMemo(
    () => (product.images && product.images.length > 0 ? product.images : [product.image]),
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
        setActiveImageIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
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
    setActiveImageIndex((i) => (i + 1) % galleryImages.length);
  };

  const goToPrevImage = () => {
    if (galleryImages.length < 2) return;
    setActiveImageIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id.toString(),
        name: product.name,
        brand: product.brand || "",
        price: product.price,
        originalPrice: product.originalPrice || 0,
        image: currentImageSrc,
      },
      quantity,
    );
  };

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInComparison(product.id);
  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const avgRating = product.rating || 0;
  const reviews = product.reviews || 0;
  const conditionLabel = product.condition?.[0] || "Used";
  const quickSpecs = [product.specs?.processor, product.specs?.ram, product.specs?.storage]
    .filter(Boolean)
    .join(" • ");

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
      price: product.price,
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
            Back
          </button>
        </div>

        <div className="mb-14 rounded-3xl border border-border bg-card shadow-[0_8px_40px_rgba(0,0,0,0.07)]">
          <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14">
            <div className="flex flex-col gap-5">
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
                  src={currentImage}
                  alt={product.name}
                  fill
                  className="object-contain p-6 transition-all duration-500"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />

                <div className="absolute left-3 top-3 z-20">
                  <span className="rounded-full bg-primary px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-primary-foreground shadow-lg">
                    {product.brand || "Laptop"}
                  </span>
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
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                        idx === safeImageIndex
                          ? "scale-105 border-primary shadow-[0_0_0_3px_rgba(47,84,235,0.2)]"
                          : "border-border opacity-70 hover:scale-105 hover:border-primary/60 hover:opacity-100"
                      }`}
                      aria-label={`Show image ${idx + 1}`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} view ${idx + 1}`}
                        fill
                        className="object-contain p-1.5"
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

              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { icon: Shield, label: "Secure Payment", desc: "SSL encrypted" },
                  { icon: Award, label: "Certified", desc: conditionLabel },
                  { icon: RotateCcw, label: "Easy Returns", desc: "7-day returns" },
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
              </div>
            </div>

            <div className="flex flex-col gap-7">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-primary-foreground">
                    {product.brand || "Laptop"}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[0.65rem] font-bold text-emerald-700">
                    {conditionLabel}
                  </span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[0.65rem] font-bold text-primary">
                    {product.category || "Computing"}
                  </span>
                </div>

                <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
                  {product.name}
                </h1>

                {quickSpecs && (
                  <p className="mt-1 text-sm font-medium text-muted-foreground">{quickSpecs}</p>
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
                  <span className="text-sm font-bold text-foreground">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({reviews} reviews)</span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageCircle className="h-3 w-3" />
                    Write a review
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-linear-to-br from-secondary/30 to-card p-6">
                <div className="flex flex-wrap items-end gap-3">
                  <span className="text-2xl font-black text-foreground">
                    ৳ {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <div className="mb-1 flex flex-col">
                      <span className="text-sm text-muted-foreground line-through">
                        ৳ {product.originalPrice.toLocaleString()}
                      </span>
                      {discountPercentage > 0 && (
                        <span className="text-xs font-bold text-red-500">
                          Save ৳ {(product.originalPrice - product.price).toLocaleString()} ({discountPercentage}%)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span
                      className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
                        product.inStock ? "bg-emerald-500" : "bg-red-500"
                      } opacity-75`}
                    />
                    <span
                      className={`relative inline-flex h-2 w-2 rounded-full ${
                        product.inStock ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      product.inStock ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {product.inStock ? "In Stock - Ready to Ship" : "Out of Stock"}
                  </span>
                </div>
              </div>

              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Key Highlights
                  </h3>
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">Quantity:</span>
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
                    className="min-w-35 flex-1 rounded-xl px-6 py-3.5 text-sm font-bold shadow-[0_4px_16px_rgba(47,84,235,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
                    onClick={handleAddToCart}
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>

                  <button
                    onClick={() =>
                      isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product)
                    }
                    className={`grid h-12 w-12 place-items-center rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${
                      isWishlisted
                        ? "border-red-300 bg-red-50 text-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                        : "border-border bg-card text-muted-foreground hover:border-red-300 hover:text-red-400"
                    }`}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`h-4.5 w-4.5 ${isWishlisted ? "fill-current" : ""}`} />
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
                    aria-label={isCompared ? "Remove from comparison" : "Add to comparison"}
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://wa.me/8801701561395"
                    className="inline-flex min-w-35 flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    WhatsApp Order
                  </a>
                  <a
                    href="tel:+8801701561395"
                    className="inline-flex min-w-25 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call Us
                  </a>
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

            <div className="mt-8 rounded-2xl bg-secondary/25 p-6 sm:p-8">
              {activeTab === "description" && (
                <div className="max-w-4xl space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <p className="text-base font-bold text-foreground">
                    {product.description?.short || "No short description available."}
                  </p>
                  <div
                    className="whitespace-pre-wrap"
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
                        <span className="font-medium text-foreground">{value as string}</span>
                      </div>
                    ))}
                  <div className="border-b border-border py-3">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Stock ID
                    </span>
                    <span className="font-medium text-foreground">{product.sku || "N/A"}</span>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="mx-auto max-w-2xl py-10 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50 text-yellow-500">
                    <Star className="h-8 w-8 fill-current" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-foreground">No Reviews Yet</h3>
                  <p className="mb-6 text-muted-foreground">Be the first to review this product.</p>
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
                    <p className="mt-1">7-day easy return policy for hardware issues.</p>
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
                <span className="mb-1 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-widest text-foreground">
                  You May Also Like
                </span>
                <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">
                  Related Products
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
