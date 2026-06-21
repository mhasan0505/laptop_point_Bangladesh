"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

/* ── Product data ──────────────────────────────────────────── */
const products = [
  {
    name: "HP ZBook FireFly 14 G8",
    tagline: "Mobile Workstation. Desktop Power.",
    subtitle: "i5 11th Gen · 16 GB RAM · 512 GB SSD",
    image: "/products/hp/HP-Zbook-Firefly-14-G8-Core-i5-11TH-Gen-16-512/main.png",
    slug: "hp-zbook-firefly-14-g8-laptop-14-inch-1920-x-1080-fhd-ips-anti-glare-11th-generation-intel-core-i5-1145g7-processor-16-gb-ddr4-3200mhz-ram-512-gb-pcie-nvme-ssd-windows-11",
    specs: ["NVIDIA® T500 GPU", "14\" FHD IPS", "Wi-Fi 6", "Thunderbolt™ 4"],
    badge: "Workstation",
    color: "#3B82F6",
    colorName: "blue",
    price: "From ৳65,000",
    metric: { value: "Up to 14 hrs", label: "Battery life" },
  },
  {
    name: "HP Elitebook 1040 G8",
    tagline: "Executive thin. Enterprise secure.",
    subtitle: "i7 11th Gen · 16 GB RAM · 512 GB SSD",
    image: "/products/hp/HP-Elitebook-X360-1040-G8-Core-I7-11TH-Gen-16-512/main.jpg",
    slug: "hp-elitebook-x360-1040-g8-intel-core-i7-1185g7-16gb-ram-512gb-ssd-14-fhd-windows-11-pro",
    specs: ["14\" FHD 400 nits", "Bang & Olufsen Audio", "HP Sure View", "1.1 kg ultralight"],
    badge: "Premium",
    color: "#F59E0B",
    colorName: "amber",
    price: "From ৳75,000",
    metric: { value: "1.1 kg", label: "Starting weight" },
  },
  {
    name: "Dell XPS 14",
    tagline: "The InfinityEdge icon.",
    subtitle: "i7 8th Gen · 16 GB RAM · 256 GB SSD",
    image: "/products/dell/Dell-XPS-13-9370code-i7-8th-Gen-16-256/main.png",
    slug: "dell-xps-14",
    specs: ["InfinityEdge Display", "Aluminum unibody", "Thunderbolt™ 3", "Windows Hello"],
    badge: "Flagship",
    color: "#6B7280",
    colorName: "slate",
    price: "From ৳68,000",
    metric: { value: "91.5%", label: "Screen-to-body" },
  },
  {
    name: "Lenovo X1 Yoga i5 12th Gen",
    tagline: "Flip. Write. Present.",
    subtitle: "i5 12th Gen · 16 GB RAM · 512 GB SSD · Touchscreen",
    image: "/products/lenovo/Lenovo-Thinkpad-X1-Carbon-i5-10TH-Gen-16512-Touchscreen/main.jpg",
    slug: "lenovo-x1-yoga-i5-12th-gen",
    specs: ["14\" WUXGA Touch", "360° hinge", "Built-in pen", "MIL-STD-810H"],
    badge: "Convertible",
    color: "#10B981",
    colorName: "emerald",
    price: "From ৳85,000",
    metric: { value: "360°", label: "Hinge rotation" },
  },
];

/* ── Color palette per product ─────────────────────────────── */
const palette = (colorName: string) => {
  const map: Record<string, { light: string; border: string; glow: string }> = {
    blue:    { light: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-200 dark:border-blue-800", glow: "shadow-blue-500/15" },
    amber:   { light: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-200 dark:border-amber-800", glow: "shadow-amber-500/15" },
    slate:   { light: "bg-slate-100 dark:bg-slate-800/30", border: "border-slate-200 dark:border-slate-700", glow: "shadow-slate-500/15" },
    emerald: { light: "bg-emerald-100 dark:bg-emerald-900/30", border: "border-emerald-200 dark:border-emerald-800", glow: "shadow-emerald-500/15" },
  };
  return map[colorName] ?? map.blue;
};

/* ── Section ────────────────────────────────────────────────── */
const CascadeTabsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProduct = products[activeIndex];
  const colors = palette(activeProduct.colorName);
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-60px" });

  return (
    <section ref={sectionRef} className="relative py-20 lg:py-28 overflow-hidden bg-white dark:bg-neutral-950">
      {/* Background ambient glow that shifts with active product */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <motion.div
          key={activeProduct.color}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute top-1/3 right-0 w-175 h-175 -translate-y-1/2 translate-x-1/4 rounded-full blur-[140px]"
          style={{ backgroundColor: activeProduct.color, opacity: 0.06 }}
        />
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
      </div>

      <div className="container px-4 md:px-6 w-full max-w-[95%] mx-auto relative z-10">
        {/* ── Header ── */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row justify-between items-end mb-10 lg:mb-12 gap-6"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-400">
                Curated Selection
              </p>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight capitalize text-neutral-900 dark:text-white leading-[1.1]">
              Every laptop here offers 
              <br className="hidden md:block" /> great value for your money
            </h2>
          </div>
          <Link
            href="/shop"
            className="group flex items-center gap-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-white/15 rounded-full px-6 py-3 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 dark:hover:bg-white dark:hover:text-neutral-900 transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md"
          >
            See the full collection
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </motion.div>

        {/* ── Cascade Tabs ── */}
        <div className="relative mb-10 lg:mb-14">
          {/* Tab track with sliding highlight */}
          <div className="relative bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-1.5">
            {/* Sliding active background pill */}
            <motion.div
              layout
              className="absolute top-1.5 bottom-1.5 rounded-xl bg-white dark:bg-neutral-700 shadow-sm border border-neutral-200/80 dark:border-neutral-600"
              style={{
                left: `calc(${activeIndex} * (100% / ${products.length}) + 6px)`,
                width: `calc(100% / ${products.length} - 12px)`,
              }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />

            {/* Tab buttons — grid layout, no scrollbar */}
            <div className="relative grid grid-cols-4">
              {products.map((product, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={product.slug}
                    onClick={() => setActiveIndex(i)}
                    className={`group relative flex items-center justify-center gap-2 rounded-xl px-2 py-3 md:px-3 md:py-4 text-center transition-colors duration-300 z-10 ${
                      isActive
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                    }`}
                  >
                    {/* Color indicator dot with pulse ring */}
                    <span className="relative flex shrink-0">
                      <span
                        className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                          isActive ? "scale-125" : "scale-100 opacity-60 group-hover:opacity-100"
                        }`}
                        style={{ backgroundColor: product.color }}
                      />
                      {isActive && (
                        <span
                          className="absolute inset-0 rounded-full animate-ping opacity-25"
                          style={{ backgroundColor: product.color }}
                        />
                      )}
                    </span>

                    <div className="min-w-0">
                      <span className={`block text-xs md:text-sm leading-tight font-semibold truncate ${
                        isActive ? "text-neutral-900 dark:text-white" : "text-neutral-600 dark:text-neutral-400"
                      }`}>
                        {product.name.split(" ").slice(0, 2).join(" ")}
                      </span>
                      <span className={`block text-[10px] md:text-[11px] mt-0.5 truncate ${
                        isActive ? "text-neutral-500 dark:text-neutral-400" : "text-neutral-400 dark:text-neutral-500"
                      }`}>
                        {product.name.split(" ").slice(2).join(" ")}
                      </span>
                    </div>

                    {/* Active accent bar below tab */}
                    {isActive && (
                      <motion.div
                        layoutId="cascade-tab-accent"
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.75 rounded-full"
                        style={{ backgroundColor: product.color }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Active Product Panel ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
            className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center"
          >
            {/* ── Image Column ── */}
            <div className="relative order-1 lg:order-1 group/img">
              <div className={`relative rounded-3xl overflow-hidden ${colors.light} border ${colors.border} ${colors.glow} shadow-sm transition-shadow duration-500 group-hover/img:shadow-xl`}>
                <div className="aspect-4/3 relative overflow-hidden">
                  <Image
                    src={activeProduct.image}
                    alt={activeProduct.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    className="object-contain p-8 lg:p-12 transition-transform duration-700 group-hover/img:scale-[1.03]"
                  />
                </div>
                {/* Price badge */}
                <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-lg border border-neutral-200/60 dark:border-white/10">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">{activeProduct.price}</span>
                </div>
                {/* Metric badge */}
                <div className="absolute top-4 left-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-sm border border-neutral-200/60 dark:border-white/10">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">{activeProduct.metric.value}</span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 ml-1.5">{activeProduct.metric.label}</span>
                </div>
                {/* Badge pill */}
                <motion.div
                  key={activeProduct.badge}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm border border-neutral-200/60 dark:border-white/10"
                  style={{ backgroundColor: `${activeProduct.color}18`, color: activeProduct.color }}
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{activeProduct.badge}</span>
                </motion.div>
              </div>
            </div>

            {/* ── Content Column ── */}
            <div className="order-2 space-y-5 lg:space-y-6">
              {/* Product identity */}
              <div className="space-y-2.5">
                <h3 className="text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-neutral-900 dark:text-white leading-[1.15] tracking-tight">
                  {activeProduct.name}
                </h3>
                <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {activeProduct.tagline}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {activeProduct.subtitle}
                </p>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {activeProduct.specs.map((spec, i) => (
                  <motion.div
                    key={spec}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-100 dark:border-neutral-800 transition-colors duration-200 hover:border-neutral-200 dark:hover:border-neutral-700"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: activeProduct.color }}
                    />
                    <span className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200">{spec}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href={`/product/${activeProduct.slug}`}
                  className="group/btn inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
                  style={{ backgroundColor: activeProduct.color, boxShadow: `0 8px 24px ${activeProduct.color}25` }}
                >
                  Shop {activeProduct.name.split(" ").slice(0, 2).join(" ")}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                </Link>
                <Link
                  href={`/product/${activeProduct.slug}`}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 border-2 hover:shadow-md"
                  style={{ borderColor: activeProduct.color, color: activeProduct.color }}
                >
                  View details
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default CascadeTabsSection;
