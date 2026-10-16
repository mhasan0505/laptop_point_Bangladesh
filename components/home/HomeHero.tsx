"use client";

import TrustRow from "@/components/home/TrustRow";
import { StorefrontContact } from "@/lib/public-content";
import { ChevronLeft, ChevronRight, MessageCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface SlideItem {
  id: string | number;
  image: string;
  mobileImage?: string;
  alt: string;
  linkHref?: string;
  headline?: string | null;
  subtext?: string | null;
  ctaLabel?: string | null;
}

/* ─── Helper: Slide Image ─── */
function SlideImage({ slide, index }: { slide: SlideItem; index: number }) {
  return slide.mobileImage ? (
    <>
      <div className="relative w-full h-full block sm:hidden">
        <Image
          src={slide.mobileImage}
          alt={slide.alt}
          fill
          priority={index === 0}
          loading={index === 0 ? "eager" : "lazy"}
          sizes="100vw"
          className="object-contain p-3"
        />
      </div>
      <div className="relative w-full h-full hidden sm:block">
        <Image
          src={slide.image}
          alt={slide.alt}
          fill
          priority={index === 0}
          loading={index === 0 ? "eager" : "lazy"}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain p-6 sm:p-8"
        />
      </div>
    </>
  ) : (
    <Image
      src={slide.image}
      alt={slide.alt}
      fill
      priority={index === 0}
      loading={index === 0 ? "eager" : "lazy"}
      sizes="(min-width: 1024px) 50vw, 100vw"
      className="object-contain p-6 sm:p-8"
    />
  );
}

const DEFAULT_SLIDES: SlideItem[] = [
  { id: 1, image: "/Hero/HP.png", alt: "HP EliteBook & ProBook", linkHref: "/shop?brand=HP" },
  { id: 2, image: "/Hero/dell.png", alt: "Dell Latitude & XPS", linkHref: "/shop?brand=Dell" },
  { id: 3, image: "/Hero/lenovo.png", alt: "Lenovo ThinkPad Series", linkHref: "/shop?brand=Lenovo" },
  { id: 4, image: "/Hero/Microsoft.png", alt: "Microsoft Surface Studio & Laptop", linkHref: "/shop?brand=Microsoft" },
];

interface HomeHeroProps {
  contact: StorefrontContact;
}

export default function HomeHero({ contact }: HomeHeroProps) {
  const [slides, setSlides] = useState<SlideItem[]>(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Entry animation
  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Check reduced motion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  // Fetch live banners from admin/banners storage
  useEffect(() => {
    let ignore = false;
    fetch("/api/banners?placement=home.hero")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data?.banners && Array.isArray(data.banners) && data.banners.length > 0) {
          const liveSlides: SlideItem[] = data.banners
            .filter((b: any) => b.active !== false && (b.desktopImageUrl || b.image))
            .map((b: any) => ({
              id: b.id,
              image: b.desktopImageUrl || b.image,
              mobileImage: b.mobileImageUrl || undefined,
              alt: b.alt || b.title || "Featured laptop offer",
              linkHref: b.linkHref || "/shop",
              headline: b.headline || null,
              subtext: b.subtext || null,
              ctaLabel: b.ctaLabel || null,
            }));

          if (liveSlides.length > 0) {
            setSlides(liveSlides);
          }
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // 6s auto-advance carousel (pause on hover/focus, disabled if reduced motion)
  useEffect(() => {
    if (slides.length <= 1 || isPaused || prefersReducedMotion) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(nextSlide, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isPaused, prefersReducedMotion, nextSlide]);

  const dialableWa = contact.whatsapp.replace(/[^\d]/g, "");

  return (
    <section
      aria-label="Welcome to Laptop Point BD"
      className="relative w-full overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eef2f9 50%, #f0f4ff 100%)" }}
    >
      {/* ── Subtle geometric grid background ── */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
        <svg
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", inset: 0, opacity: 0.35 }}
        >
          <defs>
            <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#002b60" strokeWidth="0.5" opacity="0.12" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
        {/* Radial glow top-right */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "55%",
            height: "80%",
            background: "radial-gradient(ellipse at center, rgba(0,43,96,0.07) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        {/* Radial glow bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-5%",
            width: "40%",
            height: "60%",
            background: "radial-gradient(ellipse at center, rgba(220,3,3,0.05) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* ── Main content ── */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-10 pb-6 sm:pt-14 sm:pb-10 lg:pt-16 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

          {/* ── Left: Copy & CTA ── */}
          <div
            className="lg:col-span-6 flex flex-col justify-center"
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? "translateY(0)" : "translateY(18px)",
              transition: prefersReducedMotion ? "none" : "opacity 0.65s ease, transform 0.65s ease",
            }}
          >
            {/* Eyebrow pill */}
            <div className="mb-5 flex items-center gap-2.5">
              <span
                className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold uppercase max-w-full truncate"
                style={{
                  background: "rgba(0,43,96,0.07)",
                  color: "#002b60",
                  border: "1px solid rgba(0,43,96,0.12)",
                  backdropFilter: "blur(6px)",
                  letterSpacing: "0.08em",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0"
                  style={{ animation: prefersReducedMotion ? "none" : "pulse 2s infinite" }}
                  aria-hidden="true"
                />
                Tested · Warrantied · Nationwide Delivery
              </span>
            </div>

            {/* H1 — gradient headline */}
            <h1
              className="font-bold tracking-tight mb-5"
              style={{
                fontSize: "clamp(2rem, 2.2vw + 1.4rem, 3.5rem)",
                lineHeight: 1.07,
                letterSpacing: "-0.03em",
              }}
            >
              <span
                style={{
                  background: "linear-gradient(135deg, #0b1220 0%, #002b60 55%, #1a4a9e 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Quality Laptops,{" "}
              </span>
              <span
                style={{
                  background: "linear-gradient(135deg, #dc0303 0%, #b80202 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Certified &amp; Warrantied
              </span>
            </h1>

            {/* Description */}
            <p
              className="text-ink-2 mb-7 leading-relaxed"
              style={{ fontSize: "clamp(0.95rem, 1vw + 0.6rem, 1.1rem)", maxWidth: "48ch" }}
            >
              Power-packed laptops, engineer-verified and ready to perform — backed by
              genuine warranty, available for hands-on testing at our showroom or delivered
              safely anywhere across Bangladesh.
            </p>

            {/* Trust grid — 2×2 compact */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-7">
              {[
                { icon: "✓", title: "Engineer Certified", sub: "Hardware-tested before delivery" },
                { icon: "🛡", title: "Genuine Warranty", sub: "15-day replacement · 2-yr service" },
                { icon: "🚚", title: "Nationwide Delivery", sub: "Fast shipping across Bangladesh" },
                { icon: "🏪", title: "Visit Showroom", sub: "Try before you buy · Mirpur-10" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.65)",
                    border: "1px solid rgba(0,43,96,0.08)",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 1px 4px rgba(11,18,32,0.05)",
                  }}
                >
                  <span className="text-sm sm:text-base leading-none mt-0.5 shrink-0" aria-hidden="true">{item.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs font-semibold text-ink leading-snug truncate">{item.title}</p>
                    <p className="text-[10px] sm:text-[11px] text-ink-2 leading-snug mt-0.5 line-clamp-2">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full font-semibold text-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2 w-full sm:w-auto"
                style={{
                  background: "linear-gradient(135deg, #002b60 0%, #1a4a9e 100%)",
                  boxShadow: "0 4px 14px rgba(0,43,96,0.28), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                Shop Laptops
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              {contact.whatsapp && (
                <a
                  href={`https://wa.me/${dialableWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-brand-navy w-full sm:w-auto"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(0,43,96,0.14)",
                    backdropFilter: "blur(8px)",
                    color: "#334155",
                    boxShadow: "0 1px 4px rgba(11,18,32,0.07)",
                  }}
                >
                  <MessageCircle className="w-4 h-4" style={{ color: "#25D366" }} aria-hidden="true" />
                  Talk on WhatsApp
                </a>
              )}
            </div>

            {/* Brand logos row */}
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-2.5"
                style={{ color: "rgba(0,43,96,0.45)" }}
              >
                Shop by Brand
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { name: "HP", src: "/brand_logo/hp.png", href: "/shop?brand=HP" },
                  { name: "Dell", src: "/brand_logo/dell.png", href: "/shop?brand=Dell" },
                  { name: "Lenovo", src: "/brand_logo/lenovo.png", href: "/shop?brand=Lenovo" },
                  { name: "Asus", src: "/brand_logo/asus.png", href: "/shop?brand=Asus" },
                  { name: "Acer", src: "/brand_logo/acer.png", href: "/shop?brand=Acer" },
                  { name: "Apple", src: "/brand_logo/apple.png", href: "/shop?brand=Apple" },
                ].map((brand) => (
                  <Link
                    key={brand.name}
                    href={brand.href}
                    aria-label={`Shop ${brand.name} laptops`}
                    className="flex items-center justify-center rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-brand-navy"
                    style={{
                      width: "52px",
                      height: "36px",
                      background: "rgba(255,255,255,0.8)",
                      border: "1px solid rgba(0,43,96,0.1)",
                      backdropFilter: "blur(6px)",
                      boxShadow: "0 1px 3px rgba(11,18,32,0.06)",
                      overflow: "hidden",
                      padding: "6px 8px",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.98)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 3px 10px rgba(0,43,96,0.12)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.8)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(11,18,32,0.06)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    <Image
                      src={brand.src}
                      alt={brand.name}
                      width={36}
                      height={22}
                      className="object-contain w-full h-full"
                      style={{ filter: "grayscale(20%) contrast(1.05)" }}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>


          {/* ── Right: Glassmorphism Carousel Card ── */}
          <div
            className="lg:col-span-6"
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? "translateY(0)" : "translateY(24px)",
              transition: prefersReducedMotion ? "none" : "opacity 0.75s ease 0.15s, transform 0.75s ease 0.15s",
            }}
          >
            {/* Decorative gradient border ring */}
            <div
              style={{
                padding: "3px",
                borderRadius: "28px",
                background:
                  "linear-gradient(135deg, rgba(0,43,96,0.18) 0%, rgba(220,3,3,0.12) 50%, rgba(0,43,96,0.08) 100%)",
              }}
            >
              {/* Frosted glass card */}
              <div
                className="relative overflow-hidden group/hero"
                style={{
                  borderRadius: "26px",
                  background: "rgba(255,255,255,0.72)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  boxShadow:
                    "0 8px 32px rgba(0,43,96,0.1), 0 2px 8px rgba(11,18,32,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
              >
                {/* Aspect-ratio container */}
                <div style={{ aspectRatio: "4/3", position: "relative" }}>

                  {/* Slides */}
                  {slides.map((slide, index) => {
                    const isCurrent = index === currentSlide;
                    return (
                      <div
                        key={slide.id}
                        style={{
                          position: "absolute",
                          inset: 0,
                          opacity: isCurrent ? 1 : 0,
                          zIndex: isCurrent ? 10 : 0,
                          pointerEvents: isCurrent ? "auto" : "none",
                          transition: prefersReducedMotion ? "none" : "opacity 0.45s ease",
                        }}
                        aria-hidden={!isCurrent}
                      >
                        {slide.linkHref ? (
                          <Link
                            href={slide.linkHref}
                            className="block w-full h-full relative focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-inset"
                            style={{ borderRadius: "24px" }}
                            tabIndex={isCurrent ? 0 : -1}
                          >
                            <SlideImage slide={slide} index={index} />
                          </Link>
                        ) : (
                          <div className="relative w-full h-full">
                            <SlideImage slide={slide} index={index} />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Prev / Next controls */}
                  {slides.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevSlide}
                        aria-label="Previous banner"
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-brand-navy opacity-0 group-hover/hero:opacity-100 focus:opacity-100"
                        style={{
                          background: "rgba(255,255,255,0.88)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid rgba(0,43,96,0.1)",
                          boxShadow: "0 2px 8px rgba(11,18,32,0.1)",
                        }}
                      >
                        <ChevronLeft className="w-4 h-4 text-ink" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={nextSlide}
                        aria-label="Next banner"
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-brand-navy opacity-0 group-hover/hero:opacity-100 focus:opacity-100"
                        style={{
                          background: "rgba(255,255,255,0.88)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid rgba(0,43,96,0.1)",
                          boxShadow: "0 2px 8px rgba(11,18,32,0.1)",
                        }}
                      >
                        <ChevronRight className="w-4 h-4 text-ink" aria-hidden="true" />
                      </button>

                      {/* Pill dot indicators */}
                      <div
                        className="absolute bottom-4 inset-x-0 z-20 flex items-center justify-center gap-1.5"
                        role="tablist"
                        aria-label="Hero slide indicators"
                      >
                        {slides.map((s, idx) => (
                          <button
                            key={s.id}
                            type="button"
                            role="tab"
                            aria-selected={idx === currentSlide}
                            aria-label={`Go to slide ${idx + 1}`}
                            onClick={() => setCurrentSlide(idx)}
                            className="focus:outline-none focus:ring-2 focus:ring-brand-navy rounded-full"
                            style={{
                              height: "4px",
                              width: idx === currentSlide ? "24px" : "8px",
                              borderRadius: "9999px",
                              background: idx === currentSlide ? "#002b60" : "rgba(0,43,96,0.22)",
                              transition: prefersReducedMotion
                                ? "none"
                                : "width 0.35s ease, background 0.35s ease",
                              padding: 0,
                              border: "none",
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Inner top shimmer */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "10%",
                    right: "10%",
                    height: "1px",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
                    pointerEvents: "none",
                    zIndex: 30,
                  }}
                />
              </div>
            </div>



          </div>
        </div>

        {/* ── Trust Row ── */}
        <div className="mt-10 sm:mt-12">
          <TrustRow />
        </div>
      </div>
    </section>
  );
}


