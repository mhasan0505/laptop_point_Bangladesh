"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface FlashSaleBannerProps {
  targetDate: string; // ISO string format
}

export default function FlashSaleBanner({ targetDate }: FlashSaleBannerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      setTimeLeft(timeLeft);
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // Run immediately

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeUnits = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="w-full bg-linear-to-r from-red-600 to-rose-600 text-white rounded-2xl p-6 md:p-10 mb-12 shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-semibold text-yellow-300">
            <Clock className="animate-pulse" size={18} />
            <span>Limited Time Offer</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Flash Sale Ends In
          </h2>
          <p className="text-red-100 text-lg max-w-md">
            Grab your favorite laptops at unbeatable prices. Discounts up to 40%
            on selected premium models.
          </p>
        </div>

        <div className="flex gap-4 sm:gap-6 flex-wrap justify-center">
          {timeUnits.map((unit, index) => (
            <div key={index} className="flex flex-col items-center">
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

        <div className="shrink-0">
          <Link
            href="/shop"
            className="px-8 py-4 bg-white text-red-600 font-bold rounded-lg shadow-lg hover:bg-red-50 hover:scale-105 transition-all transform"
          >
            Shop Deals Now
          </Link>
        </div>
      </div>
    </div>
  );
}
