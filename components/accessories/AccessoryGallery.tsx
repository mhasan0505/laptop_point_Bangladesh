"use client";

import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Pause,
  Play,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";

interface AccessoryGalleryProps {
  images: string[];
  name: string;
  autoPlayMs?: number;
}

export default function AccessoryGallery({
  images,
  name,
  autoPlayMs = 4000,
}: AccessoryGalleryProps) {
  const safeImages = images.length > 0 ? images : ["/accessory-placeholder.svg"];
  const hasMultiple = safeImages.length > 1;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isLightboxZoomed, setIsLightboxZoomed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hoverPos, setHoverPos] = useState({ x: 50, y: 50 });
  const mainImgRef = useRef<HTMLDivElement>(null);

  const safeIndex = Math.min(activeIndex, safeImages.length - 1);
  const currentSrc = safeImages[safeIndex];

  const goToNext = useCallback(() => {
    if (safeImages.length < 2) return;
    setActiveIndex((i) => (i + 1) % safeImages.length);
  }, [safeImages.length]);

  const goToPrev = useCallback(() => {
    if (safeImages.length < 2) return;
    setActiveIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
  }, [safeImages.length]);

  // Respect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Autoplay gallery (pauses on hover, lightbox open, reduced motion, or manual pause)
  useEffect(() => {
    if (!hasMultiple || !isAutoPlay || isGalleryHovered || isViewerOpen || prefersReducedMotion) {
      return;
    }
    const timer = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      setActiveIndex((i) => (i + 1) % safeImages.length);
    }, autoPlayMs);
    return () => window.clearInterval(timer);
  }, [hasMultiple, isAutoPlay, isGalleryHovered, isViewerOpen, prefersReducedMotion, autoPlayMs, safeImages.length, activeIndex]);

  // Keyboard navigation & scroll lock when fullscreen lightbox is open
  useEffect(() => {
    if (!isViewerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsViewerOpen(false);
        setIsLightboxZoomed(false);
      } else if (e.key === "ArrowRight" && hasMultiple) {
        goToNext();
        setIsLightboxZoomed(false);
      } else if (e.key === "ArrowLeft" && hasMultiple) {
        goToPrev();
        setIsLightboxZoomed(false);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isViewerOpen, hasMultiple, goToNext, goToPrev]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!mainImgRef.current) return;
    const rect = mainImgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setHoverPos({ x, y });
  };

  return (
    <div
      className="space-y-3"
      onMouseEnter={() => setIsGalleryHovered(true)}
      onMouseLeave={() => {
        setIsGalleryHovered(false);
        setIsHovering(false);
      }}
    >
      {/* Main Image Container */}
      <div
        ref={mainImgRef}
        className="group relative aspect-square w-full overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface-2 cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => {
          setIsLightboxZoomed(false);
          setIsViewerOpen(true);
        }}
      >
        {/* Top-Right Controls: Play/Pause + Expand */}
        <div className="absolute right-3 top-3 z-30 flex items-center gap-1.5">
          {hasMultiple && !prefersReducedMotion && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAutoPlay((prev) => !prev);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink shadow-xs transition-colors hover:bg-brand-navy hover:text-white cursor-pointer"
              aria-label={isAutoPlay ? "Pause slideshow" : "Play slideshow"}
              title={isAutoPlay ? "Pause slideshow" : "Play slideshow"}
            >
              {isAutoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxZoomed(false);
              setIsViewerOpen(true);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink shadow-xs transition-colors hover:bg-brand-navy hover:text-white cursor-pointer"
            aria-label="Zoom image fullscreen"
            title="Zoom fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Image Counter Pill */}
        {hasMultiple && (
          <span className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-white backdrop-blur-xs">
            {safeIndex + 1} / {safeImages.length}
          </span>
        )}

        {/* Hover Magnifier Lens (Desktop) */}
        {isHovering && (
          <div
            className="pointer-events-none absolute inset-0 z-20 hidden bg-surface-2 md:block"
            style={{
              backgroundImage: `url(${currentSrc})`,
              backgroundSize: "240%",
              backgroundPosition: `${hoverPos.x}% ${hoverPos.y}%`,
              backgroundRepeat: "no-repeat",
            }}
          />
        )}

        <Image
          key={currentSrc}
          src={currentSrc}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain p-8 mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Clickable Thumbnails + Prev/Next */}
      {hasMultiple && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={goToPrev}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink transition-transform hover:bg-surface-2 active:scale-90 cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <ul className="flex gap-2 overflow-x-auto py-1">
            {safeImages.map((src, i) => {
              const isActive = i === safeIndex;
              return (
                <li key={`${src}-${i}`} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    aria-label={`View image ${i + 1} of ${safeImages.length}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative h-16 w-16 overflow-hidden rounded-[var(--radius-sm)] bg-surface-2 p-1 transition-all active:scale-95 cursor-pointer ${
                      isActive
                        ? "border-2 border-brand-red shadow-xs opacity-100"
                        : "border border-line opacity-70 hover:opacity-100 hover:border-brand-navy"
                    }`}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain p-1.5 mix-blend-multiply"
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={goToNext}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink transition-transform hover:bg-surface-2 active:scale-90 cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Fullscreen Zoomable Lightbox Modal */}
      {isViewerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${name} image viewer`}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => {
            setIsViewerOpen(false);
            setIsLightboxZoomed(false);
          }}
        >
          {/* Top-right Zoom + Close */}
          <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxZoomed((z) => !z);
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/25 active:scale-90 cursor-pointer"
              aria-label={isLightboxZoomed ? "Zoom out" : "Zoom in"}
            >
              {isLightboxZoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsViewerOpen(false);
                setIsLightboxZoomed(false);
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/25 active:scale-90 cursor-pointer"
              aria-label="Close image viewer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                  setIsLightboxZoomed(false);
                }}
                className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/25 active:scale-90 cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                  setIsLightboxZoomed(false);
                }}
                className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/25 active:scale-90 cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          {/* Lightbox Image Stage */}
          <div
            className={`relative h-[74vh] w-full max-w-5xl overflow-hidden ${
              isLightboxZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxZoomed((z) => !z);
            }}
          >
            <Image
              src={currentSrc}
              alt={name}
              fill
              sizes="100vw"
              priority
              className={`object-contain transition-transform duration-300 ${
                isLightboxZoomed ? "scale-175" : "scale-100"
              }`}
            />
          </div>

          {/* Bottom Counter & Thumbnail Strip */}
          {hasMultiple && (
            <div
              className="mt-4 flex flex-col items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs tabular-nums text-white">
                {safeIndex + 1} / {safeImages.length}
              </span>
              <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                {safeImages.map((src, i) => (
                  <button
                    key={`lb-${src}-${i}`}
                    type="button"
                    onClick={() => {
                      setActiveIndex(i);
                      setIsLightboxZoomed(false);
                    }}
                    aria-label={`Select image ${i + 1}`}
                    className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white/95 p-1 transition-all cursor-pointer ${
                      i === safeIndex
                        ? "ring-2 ring-brand-red opacity-100"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={src} alt="" fill sizes="48px" className="object-contain p-1" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
