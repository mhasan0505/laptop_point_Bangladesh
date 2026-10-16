"use client";

import { Button } from "@/components/ui/button";
import ProductsCard from "@/components/ui/ProductsCard";
import { useCart } from "@/contexts/CartContext";
import { useComparison } from "@/contexts/ComparisonContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { trackAddToCart, trackViewItem } from "@/lib/analytics/tracker";
import { formatBDT } from "@/lib/format";
import { Product } from "@/types/product";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Heart,
  HelpCircle,
  Maximize2,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  RotateCcw,
  Send,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProductSpecTable from "@/components/product/ProductSpecTable";
import YouTubeEmbed from "@/components/product/YouTubeEmbed";
import { parseYoutubeId } from "@/lib/youtube";
import ProductFaqSection from "@/components/product/ProductFaqSection";
import { generateProductSummary } from "@/lib/product-summary";
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
  sidebarProducts?: Product[];
  summary?: string;
}

interface PublicQuestion {
  id: string;
  userName: string;
  question: string;
  answer?: string;
  createdAt: string;
}

interface UserReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ProductDetailsClient({
  product,
  relatedProducts,
  sidebarProducts = [],
  summary,
}: ProductDetailsClientProps) {
  const router = useRouter();
  const quickSummary = useMemo(
    () => summary || generateProductSummary(product),
    [summary, product]
  );
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToComparison, removeFromComparison, isInComparison, canAddMore } =
    useComparison();

  // Active gallery image
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeAnchor, setActiveAnchor] = useState("description");
  const hasVideo = Boolean(parseYoutubeId(product.youtubeUrl));

  // Hover magnifier state
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPos, setHoverPos] = useState({ x: 50, y: 50 });
  const mainImgRef = useRef<HTMLDivElement>(null);

  // Variant selections (RAM & SSD)
  const initialRam = useMemo(() => {
    const raw = product.specs?.ram || "";
    if (/32/i.test(raw)) return "32GB";
    if (/16/i.test(raw)) return "16GB";
    return "8GB";
  }, [product.specs?.ram]);

  const initialSsd = useMemo(() => {
    const raw = product.specs?.storage || "";
    if (/1\s*TB/i.test(raw)) return "1TB";
    if (/512/i.test(raw)) return "512GB";
    return "256GB";
  }, [product.specs?.storage]);

  const [selectedRam, setSelectedRam] = useState(initialRam);
  const [selectedSsd, setSelectedSsd] = useState(initialSsd);

  // RAM and SSD Options
  const ramOptions = [
    { label: "8GB", delta: 0 },
    { label: "16GB", delta: 2500 },
    { label: "32GB", delta: 6000 },
  ];

  const ssdOptions = [
    { label: "256GB", delta: 0 },
    { label: "512GB", delta: 2000 },
    { label: "1TB", delta: 5000 },
  ];

  // Base RAM/SSD deltas
  const ramDelta = useMemo(() => {
    const found = ramOptions.find((r) => r.label === selectedRam);
    const base = ramOptions.find((r) => r.label === initialRam);
    return (found?.delta || 0) - (base?.delta || 0);
  }, [selectedRam, initialRam]);

  const ssdDelta = useMemo(() => {
    const found = ssdOptions.find((s) => s.label === selectedSsd);
    const base = ssdOptions.find((s) => s.label === initialSsd);
    return (found?.delta || 0) - (base?.delta || 0);
  }, [selectedSsd, initialSsd]);

  const currentPrice = product.price + ramDelta + ssdDelta;
  const regularPrice =
    (product.originalPrice || product.price + 3000) + ramDelta + ssdDelta;
  const discountPercentage =
    regularPrice > currentPrice
      ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
      : 0;

  // Recently viewed products
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Questions state
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionName, setQuestionName] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [questionSuccess, setQuestionSuccess] = useState(false);

  // Reviews state
  const [reviewsList, setReviewsList] = useState<UserReview[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const galleryImages = useMemo(() => {
    return product.images && product.images.length > 0
      ? product.images
      : [product.image];
  }, [product.images, product.image]);

  const getImageSrc = (img: Product["image"]) =>
    typeof img === "string" ? img : img.src;

  const safeImageIndex = Math.min(activeImageIndex, galleryImages.length - 1);
  const currentImage = galleryImages[safeImageIndex] || product.image;
  const currentImageSrc = getImageSrc(currentImage);

  // Load recently viewed & track view
  useEffect(() => {
    if (typeof window === "undefined" || !product) return;

    try {
      const saved = localStorage.getItem("recentlyViewed");
      let recent: Product[] = saved ? JSON.parse(saved) : [];
      recent = recent.filter((p) => p.id !== product.id);
      recent.unshift(product);
      recent = recent.slice(0, 8);
      localStorage.setItem("recentlyViewed", JSON.stringify(recent));
      setRecentlyViewed(recent.filter((p) => p.id !== product.id).slice(0, 4));
    } catch {
      // ignore
    }

    trackViewItem({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      category: product.category || product.brand || "Laptop",
    });
  }, [product]);

  // Load questions
  useEffect(() => {
    let ignore = false;
    fetch(`/api/questions?productSlug=${encodeURIComponent(product.slug)}`)
      .then((r) => (r.ok ? r.json() : { questions: [] }))
      .then((d) => {
        if (!ignore && Array.isArray(d.questions)) {
          setQuestions(d.questions);
        }
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [product.slug]);

  // Keyboard navigation for image lightbox
  useEffect(() => {
    if (!isViewerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsViewerOpen(false);
      if (e.key === "ArrowRight" && galleryImages.length > 1) {
        setActiveImageIndex((i) => (i + 1) % galleryImages.length);
      }
      if (e.key === "ArrowLeft" && galleryImages.length > 1) {
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
    setActiveImageIndex(
      (i) => (i - 1 + galleryImages.length) % galleryImages.length,
    );
  };

  // Add to cart
  const handleAddToCart = () => {
    addToCart(
      {
        id: `${product.id}-${selectedRam}-${selectedSsd}`,
        name: `${product.name} (${selectedRam}, ${selectedSsd})`,
        brand: product.brand || "",
        price: currentPrice,
        originalPrice: regularPrice,
        image: currentImageSrc,
        specs: {
          ...product.specs,
          ram: selectedRam,
          storage: selectedSsd,
        },
      },
      quantity,
    );

    trackAddToCart({
      id: product.id.toString(),
      name: product.name,
      price: currentPrice,
      quantity,
      category: product.category || product.brand || "Laptop",
    });

    triggerToast(`Added ${quantity} item(s) to Cart!`);
  };

  // Buy now: adds to cart and immediately navigates to checkout
  const handleBuyNow = () => {
    addToCart(
      {
        id: `${product.id}-${selectedRam}-${selectedSsd}`,
        name: `${product.name} (${selectedRam}, ${selectedSsd})`,
        brand: product.brand || "",
        price: currentPrice,
        originalPrice: regularPrice,
        image: currentImageSrc,
        specs: {
          ...product.specs,
          ram: selectedRam,
          storage: selectedSsd,
        },
      },
      quantity,
    );
    router.push("/checkout");
  };

  // Question submission
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setIsSubmittingQuestion(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          userName: questionName.trim() || "Customer",
          question: questionText,
        }),
      });
      if (res.ok) {
        setQuestionSuccess(true);
        setTimeout(() => {
          setQuestionSuccess(false);
          setIsQuestionModalOpen(false);
          setQuestionText("");
          setQuestionName("");
        }, 1800);
      }
    } catch {
      // ignore
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  // Review submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    const newRev: UserReview = {
      id: Date.now().toString(),
      userName: reviewName.trim() || "Verified Buyer",
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };
    setReviewsList((prev) => [newRev, ...prev]);
    setReviewSuccess(true);
    setTimeout(() => {
      setReviewSuccess(false);
      setIsReviewModalOpen(false);
      setReviewComment("");
      setReviewName("");
    }, 1800);
  };

  // Clear recently viewed
  const clearRecentlyViewed = () => {
    localStorage.removeItem("recentlyViewed");
    setRecentlyViewed([]);
  };

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInComparison(product.id);

  const smoothScrollTo = (id: string) => {
    setActiveAnchor(id);
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const sideListProducts = useMemo(() => {
    return (sidebarProducts && sidebarProducts.length > 0
      ? sidebarProducts
      : relatedProducts
    ).slice(0, 4);
  }, [sidebarProducts, relatedProducts]);

  return (
    <div className="min-h-screen bg-[#f2f4f8] dark:bg-background py-4 sm:py-6 text-gray-800 dark:text-gray-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#002b60] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 duration-200 text-sm font-semibold border border-white/20">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"
        >
          <Link href="/" className="hover:text-[#002b60] dark:hover:text-primary">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href="/shop" className="hover:text-[#002b60] dark:hover:text-primary">
            Laptop
          </Link>
          {product.brand && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <Link
                href={`/shop?brand=${encodeURIComponent(product.brand)}`}
                className="hover:text-[#002b60] dark:hover:text-primary"
              >
                {product.brand}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300 font-medium line-clamp-1 max-w-md">
            {product.name}
          </span>
        </nav>

        {/* ── TOP HERO SECTION (3 Columns) ── */}
        <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-4 sm:p-6 shadow-2xs mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* 1. Left Gallery Column (lg:col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <div
                ref={mainImgRef}
                className="relative aspect-square w-full rounded-lg border border-gray-200 dark:border-border bg-white dark:bg-card p-4 overflow-hidden group cursor-zoom-in flex items-center justify-center"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => setIsViewerOpen(true)}
              >
                {/* Top Left Badge */}
                <span className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-gray-900 text-white text-[10px] font-bold tracking-wider rounded uppercase">
                  {product.grade ? `${product.grade} GRADE` : "PRE-OWNED"}
                </span>

                {/* Top Right Zoom Icon */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsViewerOpen(true);
                  }}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 dark:bg-gray-800 shadow-xs hover:bg-[#002b60] hover:text-white transition-colors"
                  aria-label="Expand image"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Magnifier Hover */}
                {isHovering && (
                  <div
                    className="pointer-events-none absolute inset-0 z-20 hidden md:block"
                    style={{
                      backgroundImage: `url(${currentImageSrc})`,
                      backgroundSize: "240%",
                      backgroundPosition: `${hoverPos.x}% ${hoverPos.y}%`,
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                )}

                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  priority
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>

              {/* Thumbnails Row */}
              {galleryImages.length > 0 && (
                <div className="flex items-center gap-2 justify-center">
                  <button
                    onClick={goToPrevImage}
                    disabled={galleryImages.length <= 1}
                    className="p-1 rounded border border-gray-200 dark:border-border hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 disabled:opacity-30"
                    aria-label="Previous thumbnail"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-14 h-14 rounded border p-1 bg-white shrink-0 transition-all ${
                          idx === safeImageIndex
                            ? "border-2 border-[#dc0303] shadow-xs"
                            : "border-gray-200 dark:border-border opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={img}
                          alt=""
                          fill
                          className="object-contain p-1"
                        />
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={goToNextImage}
                    disabled={galleryImages.length <= 1}
                    className="p-1 rounded border border-gray-200 dark:border-border hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 disabled:opacity-30"
                    aria-label="Next thumbnail"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* 2. Middle Details Column (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-foreground uppercase leading-snug">
                {product.name} (RAM: {selectedRam}, SSD: {selectedSsd})
              </h1>

              {/* Meta Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium">
                  Price: <strong className="text-[#dc0303]">৳{currentPrice.toLocaleString()}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 line-through">
                  Regular: ৳{regularPrice.toLocaleString()}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  Status: In Stock
                </span>
                <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600">
                  Code: {product.sku || "LP-" + product.id}
                </span>
                {product.brand && (
                  <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600">
                    Brand: {product.brand}
                  </span>
                )}
              </div>

              {/* Quick Verdict / Product Summary */}
              <div className="bg-slate-50 dark:bg-card border border-slate-200 dark:border-border rounded-lg p-3 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                <div className="font-bold text-[#002b60] dark:text-primary mb-1 flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  Quick Verdict
                </div>
                <p>{quickSummary}</p>
              </div>

              {/* Key Features Box */}
              {(() => {
                const keyFeatureItems: Array<{ label: string; value: string }> = [];
                if (product.specs?.processor) {
                  keyFeatureItems.push({ label: "Processor", value: product.specs.processor });
                }
                if (product.specs?.display) {
                  keyFeatureItems.push({ label: "Display", value: product.specs.display });
                }
                const activeRam = selectedRam || product.specs?.ram;
                if (activeRam) {
                  keyFeatureItems.push({ label: "Memory", value: activeRam });
                }
                const activeStorage = selectedSsd || product.specs?.storage;
                if (activeStorage) {
                  keyFeatureItems.push({ label: "Storage", value: activeStorage });
                }
                if (product.specs?.graphics) {
                  keyFeatureItems.push({ label: "Graphics", value: product.specs.graphics });
                }
                if (product.warranty) {
                  keyFeatureItems.push({ label: "Warranty", value: product.warranty });
                }
                if (product.grade) {
                  keyFeatureItems.push({ label: "Condition", value: `Grade ${product.grade}` });
                } else if (product.condition && product.condition.length > 0) {
                  keyFeatureItems.push({ label: "Condition", value: product.condition.join(", ") });
                }
                if (product.features && product.features.length > 0) {
                  keyFeatureItems.push({ label: "Special Features", value: product.features.join(", ") });
                }

                if (keyFeatureItems.length === 0) return null;

                return (
                  <div className="bg-[#f0f5fc] dark:bg-card/70 border border-blue-100 dark:border-border rounded-lg p-3 text-xs">
                    <h4 className="font-bold text-[#002b60] dark:text-primary mb-2 text-xs">
                      Key Features
                    </h4>
                    <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                      {keyFeatureItems.map((item) => (
                        <li key={item.label} className="flex items-start gap-1.5">
                          <span className="text-[#002b60] dark:text-primary font-bold">•</span>
                          <span>
                            <strong>{item.label}:</strong> {item.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => smoothScrollTo("specification")}
                      className="mt-2 text-[11px] font-semibold text-[#dc0303] hover:underline cursor-pointer inline-block"
                    >
                      View More Info ↓
                    </button>
                  </div>
                );
              })()}

              {/* Variant Selectors */}
              <div className="space-y-2 pt-1 text-xs">
                {/* RAM Selector */}
                <div className="flex items-center gap-2">
                  <span className="w-10 font-bold text-gray-700 dark:text-gray-300">
                    RAM:
                  </span>
                  <div className="flex gap-2">
                    {ramOptions.map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setSelectedRam(opt.label)}
                        className={`px-3 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
                          selectedRam === opt.label
                            ? "bg-[#002b60] text-white border-[#002b60] shadow-xs"
                            : "bg-white dark:bg-card border-gray-300 dark:border-border text-gray-700 dark:text-gray-300 hover:border-[#002b60]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SSD Selector */}
                <div className="flex items-center gap-2">
                  <span className="w-10 font-bold text-gray-700 dark:text-gray-300">
                    SSD:
                  </span>
                  <div className="flex gap-2">
                    {ssdOptions.map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setSelectedSsd(opt.label)}
                        className={`px-3 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
                          selectedSsd === opt.label
                            ? "bg-[#002b60] text-white border-[#002b60] shadow-xs"
                            : "bg-white dark:bg-card border-gray-300 dark:border-border text-gray-700 dark:text-gray-300 hover:border-[#002b60]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price Line */}
              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-[#dc0303] font-mono">
                  ৳{currentPrice.toLocaleString()}
                </span>
                {discountPercentage > 0 && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Save {discountPercentage}%
                  </span>
                )}
              </div>

              {/* Actions Row (Qty + Add to Cart + Buy Now + Wishlist + Compare) */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {/* Stepper */}
                <div className="flex items-center border border-gray-300 dark:border-border rounded bg-white dark:bg-card">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2.5 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 cursor-pointer"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 py-1 text-xs font-bold font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-2.5 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 cursor-pointer"
                    aria-label="Increase"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="px-4 py-2 border-2 border-[#002b60] text-[#002b60] dark:text-white dark:border-primary text-xs font-bold rounded hover:bg-[#002b60] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Add to Cart
                </button>

                {/* Buy Now (Primary Brand Action) */}
                <button
                  onClick={handleBuyNow}
                  className="px-5 py-2 bg-[#dc0303] hover:bg-[#b80202] text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Buy Now
                </button>

                {/* Wishlist */}
                <button
                  onClick={() =>
                    isWishlisted
                      ? removeFromWishlist(product.id)
                      : addToWishlist(product)
                  }
                  className={`p-2 rounded border border-gray-300 dark:border-border transition-colors cursor-pointer ${
                    isWishlisted
                      ? "bg-red-50 text-[#dc0303] border-red-200"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
                  />
                </button>

                {/* Compare */}
                <button
                  onClick={() =>
                    isCompared
                      ? removeFromComparison(product.id)
                      : canAddMore() && addToComparison(product)
                  }
                  className={`p-2 rounded border border-gray-300 dark:border-border transition-colors cursor-pointer ${
                    isCompared
                      ? "bg-blue-50 text-[#002b60] border-blue-200"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                  aria-label="Compare"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Consultation / Quick Support Box */}
              <div className="bg-[#fff9e6] dark:bg-card border border-amber-200 dark:border-amber-900/40 rounded-lg p-3 text-xs mt-1">
                <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Contact Us If You&apos;re Having Trouble To Check The Product&apos;s Availability
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`https://wa.me/8801701561395?text=Hello%20Laptop%20Point%2C%20I%20want%20to%20order%20${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#25D366] font-bold hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    WhatsApp
                  </a>
                  <a
                    href="https://m.me/laptoppointbd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#0084FF] font-bold hover:underline"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Messenger
                  </a>
                  <a
                    href="tel:+8801701561395"
                    className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-bold hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    01701-561395
                  </a>
                </div>
              </div>
            </div>

            {/* 3. Right Sidebar Column (lg:col-span-3) */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              {/* Promo Card in Brand Primary #002b60 */}
              <div className="rounded-xl bg-[#002b60] p-4 text-white shadow-xs">
                <span className="inline-block px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold uppercase tracking-wider mb-2">
                  OFFICIAL WARRANTY
                </span>
                <h3 className="font-bold text-xs uppercase leading-snug mb-1">
                  Incredible deals on Apple, Microsoft, Dell, Lenovo and HP laptops!
                </h3>
                <p className="text-[11px] text-blue-100 mb-3">
                  Up to 0% EMI available on 19+ banks. Fast exchange valuation on your old laptop.
                </p>
                <button
                  type="button"
                  onClick={() => smoothScrollTo("emi-plans")}
                  className="w-full py-2 bg-[#dc0303] hover:bg-[#b80202] text-white font-bold text-xs rounded transition-colors text-center cursor-pointer shadow-xs"
                >
                  CLAIM NOW
                </button>
              </div>

              {/* Related Products Mini Box */}
              <div className="rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card p-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-border pb-2 mb-2">
                  <h4 className="font-bold text-xs text-[#002b60] dark:text-foreground">
                    Related Products
                  </h4>
                  <Link
                    href="/shop"
                    className="text-[10px] text-[#dc0303] hover:underline font-semibold"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-2.5">
                  {sideListProducts.map((p) => (
                    <div key={p.id} className="flex gap-2.5 items-center">
                      <div className="relative w-12 h-12 rounded border border-gray-100 dark:border-border bg-gray-50 shrink-0 p-1">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/product/${p.slug}`}
                          className="line-clamp-1 text-[11px] font-semibold text-gray-800 dark:text-gray-200 hover:text-[#dc0303] transition-colors"
                        >
                          {p.name}
                        </Link>
                        <span className="block text-xs font-bold text-[#dc0303]">
                          {formatBDT(p.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToComparison(p)}
                          className="text-[10px] text-gray-500 hover:text-[#002b60] cursor-pointer"
                        >
                          + Compare
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recently Viewed Box */}
              {recentlyViewed.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card p-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-border pb-2 mb-2">
                    <h4 className="font-bold text-xs text-gray-800 dark:text-foreground">
                      Recently Viewed
                    </h4>
                    <button
                      onClick={clearRecentlyViewed}
                      className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer"
                      title="Clear history"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recentlyViewed.slice(0, 3).map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        className="flex gap-2 items-center hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded transition-colors"
                      >
                        <div className="relative w-10 h-10 rounded border border-gray-100 shrink-0 bg-white">
                          <Image
                            src={p.image}
                            alt=""
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-[11px] font-medium text-gray-800 dark:text-gray-200">
                            {p.name}
                          </p>
                          <span className="text-[11px] font-bold text-[#dc0303]">
                            {formatBDT(p.price)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── STICKY ANCHOR NAVIGATION BAR ── */}
        <div className="sticky top-16 z-30 mb-6 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg shadow-xs px-2 py-1.5 flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: "description", label: "Description" },
            ...(hasVideo ? [{ id: "video", label: "Video" }] : []),
            { id: "specification", label: "Specification" },
            { id: "emi-plans", label: "EMI Plans" },
            { id: "faqs", label: "FAQs" },
            {
              id: "questions",
              label: `Questions (${questions.length})`,
            },
            {
              id: "reviews",
              label: `Reviews (${reviewsList.length + (product.reviews || 0)})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => smoothScrollTo(tab.id)}
              className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                activeAnchor === tab.id
                  ? "bg-[#002b60] text-white shadow-2xs"
                  : "text-gray-600 dark:text-gray-300 hover:text-[#002b60] hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── SECTION 1: DESCRIPTION ── */}
        <div
          id="description"
          className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-5 sm:p-7 shadow-2xs mb-6 scroll-mt-28"
        >
          <h2 className="text-base sm:text-lg font-bold text-[#002b60] dark:text-foreground uppercase mb-3">
            Description
          </h2>
          <div className="text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-gray-300 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white uppercase text-sm sm:text-base">
              {product.name}
            </h3>

            {/* Quick Verdict / Verified Hardware Summary */}
            <div className="p-4 rounded-lg bg-blue-50/60 dark:bg-muted/40 border border-blue-100 dark:border-border text-ink">
              <span className="block font-bold text-xs uppercase tracking-wider text-[#002b60] dark:text-primary mb-1">
                Verified Hardware Summary
              </span>
              <p className="font-medium text-ink leading-relaxed">
                {quickSummary}
              </p>
            </div>

            <p>
              {product.description?.short ||
                `The ${product.name} is engineered for performance, precision, and reliable all-day productivity. Built inside an ultra-durable precision-crafted chassis, it combines enterprise-grade computing power with high mobility.`}
            </p>
            <p>
              Equipped with a vivid anti-glare display, high-speed RAM, and responsive NVMe SSD storage, this laptop handles multitasking, business applications, and media playback effortlessly. With modern security features including fingerprint authentication and TPM security, your sensitive data remains protected.
            </p>
            <h4 className="font-bold text-gray-900 dark:text-white pt-2">
              Buy {product.name} from Best Laptop Shop in Bangladesh: Laptop Point BD
            </h4>
            <p>
              In Bangladesh, you can get the original {product.name} from Laptop Point BD. We have a large collection of the latest pre-owned and brand-new laptops from HP, Dell, Lenovo, Apple, and Asus. Order online or visit our showroom to get your laptop at the best price with 15 Days Replacement Guarantee and 2 Years Free Service Warranty.
            </p>
          </div>
        </div>

        {/* ── VIDEO (only when a valid YouTube link was added in admin) ── */}
        {hasVideo && product.youtubeUrl && (
          <div
            id="video"
            className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-5 sm:p-7 shadow-2xs mb-6 scroll-mt-28"
          >
            <h2 className="text-base sm:text-lg font-bold text-[#002b60] dark:text-foreground uppercase mb-4">
              Product Video
            </h2>
            <div className="max-w-3xl">
              <YouTubeEmbed url={product.youtubeUrl} title={product.name} />
            </div>
          </div>
        )}

        {/* ── SECTION 2: SPECIFICATION ── */}
        <div
          id="specification"
          className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-5 sm:p-7 shadow-2xs mb-6 scroll-mt-28"
        >
          <h2 className="text-base sm:text-lg font-bold text-[#002b60] dark:text-foreground uppercase mb-4">
            Specification
          </h2>

          <ProductSpecTable
            product={product}
            selectedRam={selectedRam}
            selectedSsd={selectedSsd}
          />
        </div>

        {/* ── SECTION 3: EMI PLANS (Minimal Design) ── */}
        <div
          id="emi-plans"
          className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-5 sm:p-6 shadow-2xs mb-6 scroll-mt-28"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 dark:border-border pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#002b60]/10 text-[#002b60] dark:bg-primary/20 dark:text-primary">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#002b60] dark:text-foreground uppercase">
                  EMI Available from ৳{Math.round((currentPrice * 1.18) / 36).toLocaleString()}/month
                </h2>
                <p className="text-[11px] text-gray-500">
                  Easy monthly installments on credit cards from 19+ partner banks in Bangladesh.
                </p>
              </div>
            </div>
            <Link
              href="/emi"
              className="text-xs font-semibold text-[#dc0303] hover:underline self-start sm:self-auto shrink-0"
            >
              View Full EMI Policy →
            </Link>
          </div>

          {/* Minimal 4-Tenure Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
            {[
              { months: 6, rate: 0.04, label: "6 Months" },
              { months: 12, rate: 0.08, label: "12 Months (Popular)" },
              { months: 24, rate: 0.15, label: "24 Months" },
              { months: 36, rate: 0.18, label: "36 Months" },
            ].map((t) => {
              const monthly = Math.round((currentPrice * (1 + t.rate)) / t.months);
              return (
                <div
                  key={t.months}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    t.months === 12
                      ? "border-[#002b60] bg-[#002b60]/5 dark:bg-primary/10 shadow-2xs"
                      : "border-gray-200 dark:border-border bg-gray-50/50 dark:bg-card"
                  }`}
                >
                  <span className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    {t.label}
                  </span>
                  <span className="block text-base font-bold text-[#002b60] dark:text-primary font-mono mt-0.5">
                    ৳{monthly.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-gray-400">per month</span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 pt-2 border-t border-gray-100 dark:border-border">
            <span>
              ✓ Supported on: <strong>City Bank, BRAC Bank, SCB, DBBL, EBL, LankaBangla & 13 more</strong>
            </span>
            <span className="text-gray-400">0% to low interest • Instant approval</span>
          </div>
        </div>

        {/* ── SECTION 4: FAQS ── */}
        <div id="faqs" className="scroll-mt-28">
          <ProductFaqSection />
        </div>

        {/* ── SECTION 5: QUESTIONS ── */}
        <div
          id="questions"
          className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-5 sm:p-7 shadow-2xs mb-6 scroll-mt-28"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 dark:border-border pb-4 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#002b60] dark:text-foreground uppercase">
                Questions ({questions.length})
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Have question about this product? Get specific details about this product from our tech experts.
              </p>
            </div>
            <button
              onClick={() => setIsQuestionModalOpen(true)}
              className="px-4 py-2 border-2 border-[#002b60] text-[#002b60] dark:text-white dark:border-primary text-xs font-bold rounded hover:bg-[#002b60] hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
            >
              Ask Question
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-400">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>There are no questions yet for this product.</p>
              <p className="mt-1">Be the first to ask a question!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="p-3.5 rounded-lg border border-gray-100 dark:border-border bg-gray-50/60 dark:bg-card text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {q.userName}
                    </span>
                    <span className="text-[10px] text-gray-400">{q.createdAt}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    Q: {q.question}
                  </p>
                  {q.answer && (
                    <div className="mt-2.5 pl-3 border-l-2 border-[#002b60] text-gray-600 dark:text-gray-300">
                      <p className="font-semibold text-[#002b60] dark:text-primary">
                        Laptop Point BD:
                      </p>
                      <p>{q.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SECTION 5: REVIEWS ── */}
        <div
          id="reviews"
          className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-5 sm:p-7 shadow-2xs mb-8 scroll-mt-28"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 dark:border-border pb-4 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#002b60] dark:text-foreground uppercase">
                Reviews ({reviewsList.length})
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Get specific details about this product from verified customers who already bought it.
              </p>
            </div>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-4 py-2 border-2 border-[#dc0303] text-[#dc0303] hover:bg-[#dc0303] hover:text-white text-xs font-bold rounded transition-colors cursor-pointer self-start sm:self-auto"
            >
              Write a Review
            </button>
          </div>

          {reviewsList.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-400">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-400 fill-yellow-400" />
              <p>There are no reviews yet for this product.</p>
              <p className="mt-1">Be the first to write a review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewsList.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-lg border border-gray-100 dark:border-border bg-gray-50/60 dark:bg-card text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {r.userName}
                    </span>
                    <span className="text-[10px] text-gray-400">{r.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          r.rating >= s
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SECTION 6: RELATED LAPTOPS (Bottom 4-column Grid) ── */}
        {relatedProducts.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-foreground">
                  Related Laptops
                </h2>
                <p className="text-xs text-gray-500">
                  Top matches for you in this category
                </p>
              </div>
              <Link
                href="/shop"
                className="text-xs font-bold text-[#dc0303] hover:underline"
              >
                View More →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <div key={p.id} className="flex justify-center">
                  <ProductsCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── QUESTION MODAL ── */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-card rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase text-[#002b60] dark:text-foreground">
                Ask a Question
              </h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {questionSuccess ? (
              <div className="py-8 text-center text-xs text-emerald-600 font-semibold">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                Thank you! Your question has been submitted.
              </div>
            ) : (
              <form onSubmit={handleSubmitQuestion} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={questionName}
                    onChange={(e) => setQuestionName(e.target.value)}
                    className="w-full px-3 py-2 border rounded border-gray-300 dark:border-border focus:border-[#002b60] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Question</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Ask your question about this laptop..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="w-full px-3 py-2 border rounded border-gray-300 dark:border-border focus:border-[#002b60] focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsQuestionModalOpen(false)}
                    className="px-3 py-1.5 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingQuestion}
                    className="px-4 py-1.5 bg-[#002b60] text-white rounded font-bold hover:bg-[#002047] disabled:opacity-50"
                  >
                    {isSubmittingQuestion ? "Sending..." : "Submit Question"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── REVIEW MODAL ── */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-card rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase text-[#dc0303]">
                Write a Review
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reviewSuccess ? (
              <div className="py-8 text-center text-xs text-emerald-600 font-semibold">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                Thank you! Your review has been added.
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Your Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewRating(s)}
                        className="cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            reviewRating >= s
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full px-3 py-2 border rounded border-gray-300 dark:border-border focus:border-[#dc0303] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Review</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Write about performance, battery life, condition..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 border rounded border-gray-300 dark:border-border focus:border-[#dc0303] focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-3 py-1.5 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#dc0303] text-white rounded font-bold hover:bg-[#b80202]"
                  >
                    Post Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── LIGHTBOX MODAL ── */}
      {isViewerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setIsViewerOpen(false)}
        >
          <button
            className="absolute right-4 top-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setIsViewerOpen(false)}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevImage();
                }}
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextImage();
                }}
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="relative h-[80vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
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
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/20 rounded-full text-white text-xs">
              {safeImageIndex + 1} / {galleryImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
