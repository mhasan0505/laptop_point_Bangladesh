"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Flame, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ShoppingBag, 
  Cpu, 
  HardDrive, 
  Layers, 
  Monitor, 
  ArrowRight,
  Zap,
  Check
} from "lucide-react";
import { formatBDT } from "@/lib/format";
import { useCart } from "@/contexts/CartContext";
import type { PowerDealConfigData } from "@/lib/power-deal-data";
import type { PowerDealItem } from "@/components/power-deal/PowerDealTypes";

interface Props {
  config: PowerDealConfigData;
  initialDeals: PowerDealItem[];
}

export default function PowerDealClientView({ config, initialDeals }: Props) {
  const { addToCart } = useCart();
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // Countdown State
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetTime = config.targetDate ? new Date(config.targetDate).getTime() : Date.now() + 86400000;
      const difference = targetTime - Date.now();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [config.targetDate]);

  // Extract unique brands
  const brands = ["All", ...Array.from(new Set(initialDeals.map((d) => d.brand).filter(Boolean)))];

  const filteredDeals = selectedBrand === "All"
    ? initialDeals
    : initialDeals.filter((d) => d.brand.toLowerCase() === selectedBrand.toLowerCase());

  const handleAddToCart = (deal: PowerDealItem) => {
    addToCart({
      id: deal.id,
      name: deal.name,
      brand: deal.brand,
      price: deal.salePrice,
      originalPrice: deal.originalPrice,
      image: deal.image || "/Hero/HP.png",
      specs: {
        processor: deal.cpu,
        ram: deal.ram,
        storage: deal.storage,
        display: deal.screen,
      },
    });

    setAddedIds((prev) => ({ ...prev, [deal.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [deal.id]: false }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-rose-500 selection:text-white">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-rose-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
            {config.savingsHighlight || "Limited-Time Clearance Pricing"}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
            {config.title || "THE POWER DEAL"}
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-400 mb-10 leading-relaxed">
            {config.subtitle || "Authentic commercial laptops and high-performance workstations at verified clearance prices. Tested by engineers with official warranty."}
          </p>

          {/* Countdown Clock Box */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 bg-neutral-900/80 border border-white/10 rounded-2xl p-4 sm:px-8 sm:py-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium">
              <Clock className="w-4 h-4 text-rose-400" />
              <span>Deals Expire In:</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center bg-black/50 border border-white/5 rounded-xl px-3 py-1.5 min-w-[54px]">
                <span className="text-xl sm:text-2xl font-black text-white font-mono">{String(timeLeft.days).padStart(2, "0")}</span>
                <span className="text-[10px] text-neutral-400 uppercase font-medium">Days</span>
              </div>
              <span className="text-neutral-600 font-bold">:</span>
              <div className="flex flex-col items-center bg-black/50 border border-white/5 rounded-xl px-3 py-1.5 min-w-[54px]">
                <span className="text-xl sm:text-2xl font-black text-white font-mono">{String(timeLeft.hours).padStart(2, "0")}</span>
                <span className="text-[10px] text-neutral-400 uppercase font-medium">Hours</span>
              </div>
              <span className="text-neutral-600 font-bold">:</span>
              <div className="flex flex-col items-center bg-black/50 border border-white/5 rounded-xl px-3 py-1.5 min-w-[54px]">
                <span className="text-xl sm:text-2xl font-black text-white font-mono">{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span className="text-[10px] text-neutral-400 uppercase font-medium">Mins</span>
              </div>
              <span className="text-neutral-600 font-bold">:</span>
              <div className="flex flex-col items-center bg-black/50 border border-white/5 rounded-xl px-3 py-1.5 min-w-[54px]">
                <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono">{String(timeLeft.seconds).padStart(2, "0")}</span>
                <span className="text-[10px] text-neutral-400 uppercase font-medium">Secs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Bar */}
      <div className="border-b border-white/5 bg-neutral-900/50 py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-around gap-4 text-xs sm:text-sm text-neutral-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>25+ Hardware Checkpoints Certified</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>15-Day Immediate Replacement Warranty</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>2-Year Free Service Support</span>
          </div>
        </div>
      </div>

      {/* Main Catalog Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Brand Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedBrand.toLowerCase() === b.toLowerCase()
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-1 ring-rose-500"
                    : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-white/5"
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="text-xs text-neutral-400 font-medium">
            Showing <span className="text-white font-bold">{filteredDeals.length}</span> active deals
          </div>
        </div>

        {/* Deals Grid */}
        {filteredDeals.length === 0 ? (
          <div className="text-center py-24 bg-neutral-900/30 rounded-3xl border border-white/5">
            <Zap className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Deals in this Category</h3>
            <p className="text-sm text-neutral-400 max-w-sm mx-auto mb-6">
              All deals for this brand are currently sold out or being restocked. Check back soon!
            </p>
            <button
              onClick={() => setSelectedBrand("All")}
              className="px-4 py-2 rounded-xl bg-neutral-800 text-white text-xs font-semibold hover:bg-neutral-700"
            >
              View All Power Deals
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDeals.map((deal) => {
              const savings = deal.savings || Math.max(0, deal.originalPrice - deal.salePrice);
              const discountPct = deal.discountPercentage || (deal.originalPrice > 0 ? Math.round((savings / deal.originalPrice) * 100) : 0);
              const isAdded = addedIds[deal.id];

              return (
                <div
                  key={deal.id}
                  className="group relative flex flex-col justify-between bg-neutral-900/60 rounded-2xl border border-white/10 hover:border-rose-500/50 p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-600/10 hover:-translate-y-1 backdrop-blur-sm"
                >
                  {/* Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-600/20 text-rose-400 border border-rose-500/30">
                      {deal.badge || `${discountPct}% OFF`}
                    </span>
                    {deal.techBadge && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-300 border border-white/5">
                        {deal.techBadge}
                      </span>
                    )}
                  </div>

                  {/* Product Image */}
                  <div className="relative w-full aspect-[4/3] bg-neutral-950/60 rounded-xl overflow-hidden mb-4 border border-white/5 flex items-center justify-center p-4">
                    <Image
                      src={deal.image || "/Hero/HP.png"}
                      alt={deal.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>

                  {/* Brand & Title */}
                  <div className="flex-1 flex flex-col mb-4">
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1">
                      {deal.brand}
                    </span>
                    <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-rose-200 transition-colors">
                      {deal.name}
                    </h3>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-1.5 mt-3 pt-3 border-t border-white/5 text-[11px] text-neutral-300">
                      <div className="flex items-center gap-1.5 truncate" title={deal.cpu}>
                        <Cpu className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="truncate">{deal.cpu}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate" title={deal.ram}>
                        <Layers className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="truncate">{deal.ram}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate" title={deal.storage}>
                        <HardDrive className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="truncate">{deal.storage}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate" title={deal.screen}>
                        <Monitor className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="truncate">{deal.screen}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-3 border-t border-white/5">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <div className="text-xl font-black text-rose-400">
                          {formatBDT(deal.salePrice)}
                        </div>
                        {deal.originalPrice > deal.salePrice && (
                          <div className="text-xs text-neutral-500 line-through">
                            {formatBDT(deal.originalPrice)}
                          </div>
                        )}
                      </div>
                      {savings > 0 && (
                        <div className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Save {formatBDT(savings)}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAddToCart(deal)}
                        disabled={isAdded}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isAdded
                            ? "bg-emerald-600 text-white"
                            : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Added
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Add Cart
                          </>
                        )}
                      </button>

                      <Link
                        href="/checkout"
                        onClick={() => handleAddToCart(deal)}
                        className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center justify-center gap-1 shadow-lg shadow-rose-600/30"
                      >
                        <span>Buy Now</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
