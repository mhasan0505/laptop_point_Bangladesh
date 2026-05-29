"use client";

import { motion, useInView } from "framer-motion";
import { ArrowRight, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface OfferCard {
  _key: string;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeColor: string;
  imageUrl: string;
  bgGradient: string;
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
}

interface SpecialOffersData {
  sectionHeading: string;
  sectionSubheading: string;
  offers: OfferCard[];
}

// Gradient map — maps the stored colour name → actual Tailwind classes
const gradientMap: Record<string, { from: string; to: string; text: string; sub: string }> = {
  slate:  { from: "from-slate-800",   to: "to-slate-950",   text: "text-white",     sub: "text-slate-300" },
  blue:   { from: "from-blue-700",    to: "to-blue-950",    text: "text-white",     sub: "text-blue-200" },
  violet: { from: "from-violet-700",  to: "to-violet-950",  text: "text-white",     sub: "text-violet-200" },
  green:  { from: "from-emerald-600", to: "to-emerald-900", text: "text-white",     sub: "text-emerald-200" },
  red:    { from: "from-red-600",     to: "to-red-900",     text: "text-white",     sub: "text-red-200" },
  amber:  { from: "from-amber-400",   to: "to-orange-600",  text: "text-amber-950", sub: "text-amber-800" },
};

// Badge colour map
const badgeMap: Record<string, string> = {
  red:    "bg-red-500 text-white",
  amber:  "bg-amber-400 text-amber-950",
  green:  "bg-emerald-500 text-white",
  blue:   "bg-blue-500 text-white",
  purple: "bg-violet-500 text-white",
  rose:   "bg-rose-500 text-white",
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function SpecialOffersSection() {
  const [data, setData] = useState<SpecialOffersData | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    let active = true;
    fetch(`/api/special-offers?_t=${Date.now()}`)
      .then((r) => r.json())
      .then((d: SpecialOffersData) => {
        if (!active) return;
        if (d.offers?.length > 0) setData(d);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Don't render the section at all if there are no offers
  if (!data || data.offers.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[95%]">
        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1.5 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Limited Time
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
              {data.sectionHeading}
            </h2>
            {data.sectionSubheading && (
              <p className="mt-1.5 text-sm text-neutral-500">
                {data.sectionSubheading}
              </p>
            )}
          </div>
          <Link
            href="/deals"
            className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 border border-neutral-200 rounded-full px-5 py-2 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all group whitespace-nowrap"
          >
            View all deals
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* ── Offer cards grid ── */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className={`grid gap-4 ${
            data.offers.length === 1
              ? "grid-cols-1"
              : data.offers.length === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : data.offers.length === 3
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          }`}
        >
          {data.offers.map((offer, idx) => {
            const grad = gradientMap[offer.bgGradient] ?? gradientMap.slate;
            const badge = badgeMap[offer.badgeColor] ?? badgeMap.red;
            const isWide = data.offers.length >= 4 && idx === 0;

            return (
              <motion.div
                key={offer._key}
                variants={cardVariants}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${grad.from} ${grad.to} shadow-lg hover:shadow-2xl transition-shadow duration-300 ${
                  isWide ? "sm:col-span-2" : ""
                }`}
              >
                {/* Decorative circle */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/5 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-black/10 blur-2xl" />

                <Link href={offer.ctaHref || "/shop"} className="flex h-full flex-col p-6 relative z-10 min-h-[200px]">
                  {/* Badge */}
                  {offer.badgeText && (
                    <span className={`self-start mb-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm ${badge}`}>
                      <Tag className="h-3 w-3" />
                      {offer.badgeText}
                    </span>
                  )}

                  {/* Text */}
                  <div className="flex-1">
                    <h3 className={`text-xl font-extrabold leading-tight ${grad.text}`}>
                      {offer.title}
                    </h3>
                    {offer.subtitle && (
                      <p className={`mt-1 text-sm ${grad.sub}`}>{offer.subtitle}</p>
                    )}
                  </div>

                  {/* Image */}
                  {offer.imageUrl && (
                    <div className="mt-4 flex w-full shrink-0 items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={offer.imageUrl}
                        alt={offer.title || "Special Offer"}
                        className={`object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105 ${
                          isWide ? "h-40" : "h-32"
                        }`}
                        style={{ width: "auto", maxWidth: "100%" }}
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* CTA row */}
                  <div className="mt-5 flex items-center gap-1.5">
                    <span className={`text-sm font-bold ${grad.text} group-hover:underline`}>
                      {offer.ctaLabel || "Shop Now"}
                    </span>
                    <ArrowRight className={`h-4 w-4 ${grad.text} group-hover:translate-x-1 transition-transform`} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
