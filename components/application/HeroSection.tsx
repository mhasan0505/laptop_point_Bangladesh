"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HeroSlide {
  _key: string;
  imageUrl: string;
  alt?: string;
  linkHref?: string;
  active: boolean;
}

// Static fallback slides used when no API slides are configured yet
const FALLBACK_SLIDES: HeroSlide[] = [
  { _key: "hp",        imageUrl: "/Hero/HP.png",        alt: "HP Laptops",        active: true },
  { _key: "dell",      imageUrl: "/Hero/dell.png",      alt: "Dell Laptops",      active: true },
  { _key: "lenovo",    imageUrl: "/Hero/lenovo.png",    alt: "Lenovo Laptops",    active: true },
  { _key: "microsoft", imageUrl: "/Hero/Microsoft.png", alt: "Microsoft Laptops", active: true },
];

const HeroSection = () => {
  const [slides, setSlides] = useState<HeroSlide[]>(FALLBACK_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch from API; fall back to static if empty or error
  useEffect(() => {
    let active = true;
    fetch("/api/hero-banners")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        const apiSlides: HeroSlide[] = data.slides ?? [];
        if (apiSlides.length > 0) setSlides(apiSlides);
      })
      .catch(() => {/* keep fallback */});
    return () => { active = false; };
  }, []);

  // Reset slide index when slides change
  useEffect(() => {
    setCurrentSlide(0);
  }, [slides]);

  // Auto-play
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToPrevious = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToNext = () =>
    setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <div className="w-full h-56 px-4 sm:px-8 md:px-12 lg:px-20 sm:h-72 md:h-96 lg:h-125 bg-white relative overflow-hidden group">
      {/* Slides */}
      {slides.map((slide, index) => {
        const inner = (
          <Image
            src={slide.imageUrl}
            alt={slide.alt || `Hero slide ${index + 1}`}
            fill
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
            quality={85}
            sizes="100vw"
            className="object-contain"
            unoptimized={slide.imageUrl.startsWith("http")}
          />
        );

        return (
          <div
            key={slide._key}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.linkHref ? (
              <Link href={slide.linkHref} className="block w-full h-full">
                {inner}
              </Link>
            ) : (
              inner
            )}
          </div>
        );
      })}

      {/* Previous Button */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Next Button */}
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Navigation Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-primary w-8" : "w-3 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSection;
