"use client";

import { laptopData } from "@/app/data/data";
import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Laptop,
  LayoutGrid,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductsCard from "../ui/ProductsCard";

interface BrandProductSectionProps {
  brand: string;
  title: string;
  description: string;
  badgeText: string;
  theme: "hp" | "dell" | "lenovo" | "microsoft";
}

const BrandProductSection = ({
  brand,
  title,
  description,
  badgeText,
  theme,
}: BrandProductSectionProps) => {
  const [activeCategory, setActiveCategory] = useState("All Series");

  // Filter for brand laptops
  const brandProducts = laptopData.laptops.filter(
    (product) => product.brand?.toLowerCase() === brand.toLowerCase()
  );

  // Extract unique categories
  const categories = [
    "All Series",
    ...Array.from(new Set(brandProducts.map((p) => p.category || "General"))),
  ];

  // Filter based on active tab
  const filteredProducts =
    activeCategory === "All Series"
      ? brandProducts
      : brandProducts.filter((p) => p.category === activeCategory);

  // Icon mapping
  const categoryIcons: Record<string, React.ElementType> = {
    "All Series": LayoutGrid,
    Professional: Briefcase,
    Business: Building2,
    Gaming: Gamepad2,
    Budget: Wallet,
    General: Laptop,
    Ultrabook: Briefcase,
    Workstation: Building2,
    Convertible: Laptop,
    "Convertible 2-in-1": Laptop,
  };

  // Theme configurations
  const themeConfig = {
    hp: {
      gradient: "from-yellow-500/5 to-purple-500/5",
      badgeBg: "bg-yellow-100 dark:bg-yellow-900/30",
      badgeText: "text-yellow-800 dark:text-yellow-400",
      accentRing: "ring-yellow-400",
      accentText: "text-yellow-400",
      accentBg: "bg-yellow-400",
      activeTabShadow: "shadow-yellow-500/25",
      titleGradient:
        "from-gray-900 to-gray-600 dark:from-white dark:to-gray-400",
      hoverBg: "hover:bg-yellow-400",
    },
    dell: {
      gradient: "from-blue-500/5 to-cyan-500/5",
      badgeBg: "bg-blue-100 dark:bg-blue-900/30",
      badgeText: "text-blue-800 dark:text-blue-400",
      accentRing: "ring-blue-400",
      accentText: "text-blue-400",
      accentBg: "bg-blue-400",
      activeTabShadow: "shadow-blue-500/25",
      titleGradient:
        "from-blue-900 to-blue-600 dark:from-blue-100 dark:to-blue-400",
      hoverBg: "hover:bg-blue-400",
    },
    lenovo: {
      gradient: "from-red-500/5 to-gray-500/5",
      badgeBg: "bg-red-100 dark:bg-red-900/30",
      badgeText: "text-red-800 dark:text-red-400",
      accentRing: "ring-red-500",
      accentText: "text-red-500",
      accentBg: "bg-red-500",
      activeTabShadow: "shadow-red-500/25",
      titleGradient:
        "from-red-900 to-gray-800 dark:from-red-100 dark:to-gray-400", // ThinkPad style
      hoverBg: "hover:bg-red-500",
    },
    microsoft: {
      gradient: "from-gray-200/50 to-gray-100/50", // Clean surface look
      badgeBg: "bg-gray-100 dark:bg-gray-800",
      badgeText: "text-gray-800 dark:text-gray-200",
      accentRing: "ring-gray-400",
      accentText: "text-gray-500",
      accentBg: "bg-gray-400",
      activeTabShadow: "shadow-gray-500/25",
      titleGradient:
        "from-gray-900 to-gray-500 dark:from-white dark:to-gray-400",
      hoverBg: "hover:bg-gray-400",
    },
  };

  const currentTheme = themeConfig[theme];

  if (brandProducts.length === 0) return null;

  return (
    <div className="relative w-full bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-16 md:py-24 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div
          className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px] ${
            theme === "hp"
              ? "bg-yellow-500/5"
              : theme === "dell"
              ? "bg-blue-500/5"
              : theme === "lenovo"
              ? "bg-red-500/5"
              : "bg-gray-500/5"
          }`}
        />
        <div
          className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] ${
            theme === "hp"
              ? "bg-purple-500/5"
              : theme === "dell"
              ? "bg-cyan-500/5"
              : theme === "lenovo"
              ? "bg-gray-500/5"
              : "bg-blue-500/5"
          }`}
        />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-3"
          >
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${currentTheme.badgeBg} ${currentTheme.badgeText}`}
            >
              {badgeText}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r ${currentTheme.titleGradient} mb-4`}
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed"
          >
            {description}
          </motion.p>
        </div>

        {/* Category Tabs */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10">
            {categories.map((category) => {
              const Icon = categoryIcons[category] || Laptop;
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? `text-gray-900 shadow-lg ${currentTheme.activeTabShadow} ring-2 ${currentTheme.accentRing} ring-offset-2 dark:ring-offset-gray-900`
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId={`activeTab-${brand}`}
                      className={`absolute inset-0 rounded-full ${currentTheme.accentBg}`}
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <Icon
                    className={`w-4 h-4 relative z-10 ${
                      isActive ? "text-gray-900" : currentTheme.accentText
                    }`}
                  />
                  <span className="relative z-10">{category}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Carousel & Controls */}
        <div className="relative group/carousel">
          {/* Navigation Buttons */}
          <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 -left-12 -right-12 justify-between pointer-events-none z-20">
            <button
              className={`${brand}-prev pointer-events-auto p-4 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-white shadow-lg ${currentTheme.hoverBg} hover:text-gray-900 dark:hover:bg-yellow-400 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 -translate-x-4 group-hover/carousel:translate-x-0`}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              className={`${brand}-next pointer-events-auto p-4 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-white shadow-lg ${currentTheme.hoverBg} hover:text-gray-900 dark:hover:bg-yellow-400 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 translate-x-4 group-hover/carousel:translate-x-0`}
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={{
                nextEl: `.${brand}-next`,
                prevEl: `.${brand}-prev`,
              }}
              pagination={{
                clickable: true,
                el: `.${brand}-pagination`,
                renderBullet: (_, className) => {
                  return `<span class="${className} w-2 h-2 rounded-full transition-all duration-300 mx-1"></span>`;
                },
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              breakpoints={{
                480: { slidesPerView: 1.5, spaceBetween: 20 },
                640: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 28 },
                1280: { slidesPerView: 4, spaceBetween: 32 },
              }}
              className="pb-16!"
            >
              {filteredProducts.map((product) => (
                <SwiperSlide
                  key={product.id}
                  className="h-auto! pt-2 pb-6 px-1"
                >
                  <div className="h-full flex justify-center">
                    <ProductsCard product={product} />
                  </div>
                </SwiperSlide>
              ))}
              {filteredProducts.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                  No products found in this category.
                </div>
              )}
            </Swiper>

            {/* Custom Pagination */}
            <div
              className={`${brand}-pagination flex justify-center gap-2 w-auto!`}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BrandProductSection;
