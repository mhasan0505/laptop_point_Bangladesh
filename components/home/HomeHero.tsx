"use client";

import TrustRow from "@/components/home/TrustRow";
import { StorefrontContact } from "@/lib/public-content";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface SlideItem {
  id: string | number;
  image: string;
  mobileImage?: string;
  alt: string;
  linkHref?: string;
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
      className="relative w-full bg-surface pt-6 pb-8 sm:pt-8 sm:pb-12 lg:pt-12 lg:pb-14"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Hero 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-10 sm:mb-14 lg:mb-16">
          {/* Left Column: Human Value Prop & CTA */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">
            {/* Eyebrow */}
            <div className="mb-3.5 inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" aria-hidden="true" />
              <span className="text-caption font-semibold tracking-wider uppercase text-brand-navy">
                Tested • Warrantied • Delivered across Bangladesh
              </span>
            </div>

            {/* H1 Display Headline (Only H1 on the page) */}
            <h1 className="text-display font-bold text-ink tracking-tight mb-4">
              Quality Used Laptops, Verified and Warrantied
            </h1>

            {/* Body LG Description */}
            <p className="text-body-lg text-ink-2 max-w-[54ch] mb-6 sm:mb-8 leading-relaxed">
              Every device is inspected by our hardware technicians, backed by genuine
              replacement warranty, and ready for hands-on showroom testing or safe
              nationwide delivery.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center h-12 sm:h-11 px-7 rounded-full bg-brand-red hover:bg-brand-red-hover text-white font-semibold text-small shadow-soft hover:shadow-lift transition-all focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2"
              >
                Shop laptops
              </Link>

              {contact.whatsapp && (
                <a
                  href={`https://wa.me/${dialableWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-12 sm:h-11 px-4 rounded-full text-small font-semibold text-ink-2 hover:text-ink hover:underline focus:outline-none focus:ring-2 focus:ring-brand-navy transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" aria-hidden="true" />
                  <span>Talk to us on WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Featured Banner Carousel with Soft Navy Tint Background */}
          <div className="lg:col-span-6">
            <div
              className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-[var(--radius-lg)] bg-brand-navy/[0.04] border border-line/80 overflow-hidden group/hero shadow-soft"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
            >
              {/* Carousel Slides */}
              {slides.map((slide, index) => {
                const isCurrent = index === currentSlide;

                return (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-300 ease-out ${
                      isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    }`}
                    aria-hidden={!isCurrent}
                  >
                    {slide.linkHref ? (
                      <Link
                        href={slide.linkHref}
                        className="block w-full h-full relative focus:outline-none focus:ring-2 focus:ring-brand-navy"
                        tabIndex={isCurrent ? 0 : -1}
                      >
                        <Image
                          src={slide.image}
                          alt={slide.alt}
                          fill
                          priority={index === 0}
                          loading={index === 0 ? "eager" : "lazy"}
                          sizes="(min-width: 1024px) 50vw, 100vw"
                          className="object-contain p-4 sm:p-6"
                        />
                      </Link>
                    ) : (
                      <div className="relative w-full h-full">
                        <Image
                          src={slide.image}
                          alt={slide.alt}
                          fill
                          priority={index === 0}
                          loading={index === 0 ? "eager" : "lazy"}
                          sizes="(min-width: 1024px) 50vw, 100vw"
                          className="object-contain p-4 sm:p-6"
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Prev / Next controls (44x44 targets) */}
              {slides.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous banner"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-surface/90 hover:bg-surface text-ink border border-line shadow-soft opacity-0 group-hover/hero:opacity-100 focus:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  >
                    <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next banner"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-surface/90 hover:bg-surface text-ink border border-line shadow-soft opacity-0 group-hover/hero:opacity-100 focus:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  >
                    <ChevronRight className="w-5 h-5" aria-hidden="true" />
                  </button>

                  {/* Dot Indicators */}
                  <div
                    className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-1.5 pointer-events-auto"
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
                        className={`h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-brand-navy ${
                          idx === currentSlide
                            ? "w-6 bg-brand-navy"
                            : "w-2 bg-ink/20 hover:bg-ink/40"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Compact Trust Row Below Hero */}
        <TrustRow />
      </div>
    </section>
  );
}
