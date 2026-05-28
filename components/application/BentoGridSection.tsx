"use client";

import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

/* ── Motion config ──────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.52, ease: "easeOut" as const },
  },
};

/* ── Shared card primitives ─────────────────────────────────── */
function SpecChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-white/10 text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
      {label}
    </span>
  );
}

/* ── Section ────────────────────────────────────────────────── */
const BentoGridSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-20 bg-neutral-50/50 dark:bg-neutral-900/40 overflow-hidden">
      <div className="container px-4 md:px-6 w-full max-w-[95%] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"
        >
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-500">
              Curated Selection
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
              Every laptop here is
              <br className="hidden md:block" /> worth your money.
            </h2>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-white/15 rounded-full px-5 py-2.5 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 dark:hover:bg-white dark:hover:text-neutral-900 transition-all duration-200 group whitespace-nowrap"
          >
            See the full collection
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </motion.div>

        {/* Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 md:auto-rows-[300px] gap-4"
        >
          {/* ── Card 1: Hero ── col-span-2, row-span-2 ── */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 md:row-span-2 min-h-100 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/10 overflow-hidden flex flex-col group shadow-sm hover:shadow-xl transition-shadow duration-300"
          >
            {/* Image */}
            <div className="relative flex-1 bg-neutral-50 dark:bg-neutral-800 overflow-hidden">
              <Image
                src="/products/hp/HP-Elitebook-840-G6-Core-i5-8TH-Gen-8-256/main.jpg"
                alt="HP Elitebook 840 G6"
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                priority
                loading="eager"
                className="object-contain p-8 group-hover:scale-[1.03] transition-transform duration-500"
              />
              {/* Editor's pick badge */}
              <span className="absolute top-4 left-4 bg-yellow-400 text-yellow-950 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                Editor&apos;s Pick
              </span>
            </div>
            {/* Text strip */}
            <div className="p-5 border-t border-neutral-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-neutral-900 dark:text-white text-base leading-snug">
                  HP Elitebook 840 G6
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <SpecChip label="i5 8th Gen" />
                  <SpecChip label="8 GB RAM" />
                  <SpecChip label="256 GB SSD" />
                </div>
              </div>
              <Link
                href="/shop?product=hp-elitebook-840-g6"
                className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-white hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors whitespace-nowrap group/cta"
              >
                Shop now
                <ArrowRight className="w-3.5 h-3.5 group-hover/cta:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* ── Card 2: HP Probook 440 G3 ── col-span-1, row-span-1 ── */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-1 md:row-span-1 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/10 overflow-hidden flex flex-col group shadow-sm hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative flex-1 bg-neutral-50 dark:bg-neutral-800 overflow-hidden">
              <Image
                src="/products/hp/HP-Probook-440-G3-Core-i5-6TH-Gen-8-256/main.jpg"
                alt="HP Probook 440 G3"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                loading="lazy"
                className="object-contain p-5 group-hover:scale-[1.04] transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-neutral-100 dark:border-white/10">
                Portable
              </span>
            </div>
            <div className="px-4 py-3 border-t border-neutral-100 dark:border-white/10">
              <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                HP Probook 440 G3
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                i5 6th · 14&quot; · Slim Build
              </p>
            </div>
          </motion.div>

          {/* ── Card 3: Elitebook Side Profile ── col-span-1, row-span-1 ── */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-1 md:row-span-1 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/10 overflow-hidden flex flex-col group shadow-sm hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative flex-1 bg-neutral-50 dark:bg-neutral-800 overflow-hidden">
              <Image
                src="/products/hp/HP-Elitebook-840-G6-Core-i5-8TH-Gen-8-256/side.jpg"
                alt="HP Elitebook 840 G6 side profile"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                loading="lazy"
                className="object-contain p-5 group-hover:scale-[1.04] transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-neutral-100 dark:border-white/10">
                Under 18 mm thin
              </span>
            </div>
            <div className="px-4 py-3 border-t border-neutral-100 dark:border-white/10">
              <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                Slim Profile
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Elitebook G6 · Side view
              </p>
            </div>
          </motion.div>

          {/* ── Card 4: Ports ── col-span-1, row-span-1 ── */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-1 md:row-span-1 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/10 overflow-hidden flex flex-col group shadow-sm hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative flex-1 bg-neutral-50 dark:bg-neutral-800 overflow-hidden">
              <Image
                src="/products/hp/HP-Elitebook-840-G6-Core-i5-8TH-Gen-8-256/port.jpg"
                alt="HP Elitebook ports"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                loading="lazy"
                className="object-contain p-5 group-hover:scale-[1.04] transition-transform duration-500"
              />
            </div>
            <div className="px-4 py-3 border-t border-neutral-100 dark:border-white/10">
              <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                Ready for Everything
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                USB-A · HDMI · USB-C · SD
              </p>
            </div>
          </motion.div>

          {/* ── Card 5: Elitebook G3 ── col-span-2, row-span-1 ── */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 md:row-span-1 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/10 overflow-hidden flex flex-col md:flex-row group shadow-sm hover:shadow-xl transition-shadow duration-300"
          >
            {/* Image — left half on md */}
            <div className="relative w-full md:w-[55%] min-h-48 md:min-h-0 bg-neutral-50 dark:bg-neutral-800 overflow-hidden shrink-0">
              <Image
                src="/products/hp/HP-Elitebook-840-G3-Core-i5-6TH-Gen-8-256/main.jpg"
                alt="HP Elitebook 840 G3"
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                loading="lazy"
                className="object-contain p-6 group-hover:scale-[1.03] transition-transform duration-500"
              />
            </div>
            {/* Text — right half on md */}
            <div className="flex flex-col justify-center gap-3 p-6 border-t border-neutral-100 dark:border-white/10 md:border-t-0 md:border-l">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-yellow-500">
                  Reliable Choice
                </span>
                <h3 className="font-bold text-neutral-900 dark:text-white text-lg leading-snug mt-1">
                  HP Elitebook 840 G3
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                  A proven workhorse — fast, durable, and built for long shifts.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <SpecChip label="i5 6th Gen" />
                <SpecChip label="8 GB RAM" />
                <SpecChip label="256 GB SSD" />
              </div>
              <Link
                href="/shop?product=hp-elitebook-840-g3"
                className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-white hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors w-fit group/cta"
              >
                View details
                <ArrowRight className="w-3.5 h-3.5 group-hover/cta:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default BentoGridSection;
