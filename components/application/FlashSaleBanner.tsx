"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HotDealData {
  headline: string;
  subtext: string;
  badgeText: string;
  bannerImageUrl: string;
  targetDate: string;
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
}

const FALLBACK: HotDealData = {
  headline: "Flash Sale Ends In",
  subtext:
    "Grab your favourite laptops at unbeatable prices. Discounts up to 40% on selected premium models.",
  badgeText: "Limited Time Offer",
  bannerImageUrl: "",
  targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  ctaLabel: "Shop Deals Now",
  ctaHref: "/shop",
  active: true,
};

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(targetDate: string): TimeLeft {
  const diff = +new Date(targetDate) - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function FlashSaleBanner() {
  const [data, setData] = useState<HotDealData>(FALLBACK);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calcTimeLeft(FALLBACK.targetDate),
  );

  // Fetch live config
  useEffect(() => {
    let active = true;
    fetch("/api/hot-deal")
      .then((r) => r.json())
      .then((d: HotDealData) => {
        if (!active) return;
        setData(d);
        setTimeLeft(calcTimeLeft(d.targetDate));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    const id = setInterval(
      () => setTimeLeft(calcTimeLeft(data.targetDate)),
      1000,
    );
    return () => clearInterval(id);
  }, [data.targetDate]);

  // Don't render if admin marked inactive
  if (!data.active) return null;

  const timeUnits = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="w-full bg-linear-to-r from-red-600 to-rose-600 text-white rounded-2xl p-6 md:p-10 mb-12 shadow-lg overflow-hidden relative">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        {/* Left: text + countdown */}
        <div className="text-center md:text-left space-y-4 flex-1">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-semibold text-yellow-300">
            <Clock className="animate-pulse" size={18} />
            <span>{data.badgeText}</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
            {data.headline}
          </h2>

          <p className="text-red-100 text-lg max-w-md">{data.subtext}</p>

          {/* Countdown */}
          <div className="flex gap-4 sm:gap-6 flex-wrap justify-center md:justify-start">
            {timeUnits.map((unit) => (
              <div key={unit.label} className="flex flex-col items-center">
                <motion.div
                  key={unit.value}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-white text-red-600 rounded-xl flex items-center justify-center text-2xl sm:text-4xl font-bold shadow-md"
                >
                  {unit.value.toString().padStart(2, "0")}
                </motion.div>
                <span className="text-xs sm:text-sm font-medium mt-2 uppercase tracking-wide text-red-100">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Centre: optional banner image */}
        {data.bannerImageUrl && (
          <div className="relative h-40 w-64 md:h-52 md:w-80 shrink-0 rounded-xl overflow-hidden">
            <Image
              src={data.bannerImageUrl}
              alt={data.headline}
              fill
              className="object-contain drop-shadow-2xl"
              unoptimized
            />
          </div>
        )}

        {/* Right: CTA */}
        <div className="shrink-0">
          <Link
            href={data.ctaHref || "/shop"}
            className="px-8 py-4 bg-white text-red-600 font-bold rounded-lg shadow-lg hover:bg-red-50 hover:scale-105 transition-all transform inline-block"
          >
            {data.ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
