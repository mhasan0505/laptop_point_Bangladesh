"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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

const HeroSection = () => {
  const [slides, setSlides] = useState<SlideItem[]>(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);

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
              alt: b.alt || b.title || "Promotional Banner",
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

  // Auto-play functionality
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="w-full h-56 px-4 sm:px-8 md:px-12 lg:px-20 sm:h-72 md:h-96 lg:h-125 bg-white relative overflow-hidden group">
      {/* Slides */}
      {slides.map((slide, index) => {
        const isCurrent = index === currentSlide;
        const content = (
          <>
            {slide.mobileImage ? (
              <>
                <div className="relative w-full h-full md:hidden">
                  <Image
                    src={slide.mobileImage}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                    quality={85}
                    sizes="100vw"
                    className="object-contain"
                  />
                </div>
                <div className="relative w-full h-full hidden md:block">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                    quality={85}
                    sizes="100vw"
                    className="object-contain"
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
                quality={85}
                sizes="100vw"
                className="object-contain"
              />
            )}
          </>
        );

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isCurrent ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {slide.linkHref ? (
              <Link href={slide.linkHref} className="block w-full h-full relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset">
                {content}
              </Link>
            ) : (
              content
            )}
          </div>
        );
      })}

      {/* Previous Button */}
      {slides.length > 1 && (
        <button
          onClick={goToPrevious}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 sm:p-2.5 rounded-full opacity-70 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 z-10 cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Next Button */}
      {slides.length > 1 && (
        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 sm:p-2.5 rounded-full opacity-70 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 z-10 cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Navigation Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer ${
                index === currentSlide
                  ? "bg-primary w-7 sm:w-8"
                  : "bg-black/30 hover:bg-black/50 w-2.5"
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
