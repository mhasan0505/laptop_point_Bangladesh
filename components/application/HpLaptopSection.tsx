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

const HpLaptopSection = () => {
  const [activeCategory, setActiveCategory] = useState("All Series");

  // Filter for all HP brand laptops first
  const allHpLaptops = laptopData.laptops.filter(
    (product) => product.brand === "HP"
  );

  // Extract unique categories from HP laptops
  const categories = [
    "All Series",
    ...new Set(allHpLaptops.map((p) => p.category || "General")),
  ];

  // Filter based on active tab
  const filteredProducts =
    activeCategory === "All Series"
      ? allHpLaptops
      : allHpLaptops.filter((p) => p.category === activeCategory);

  // Icon mapping for categories
  const categoryIcons: Record<string, React.ElementType> = {
    "All Series": LayoutGrid,
    Professional: Briefcase,
    Business: Building2,
    Gaming: Gamepad2,
    Budget: Wallet,
    General: Laptop,
  };

  return (
    <div className="relative w-full bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-16 md:py-24 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
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
            <span className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-semibold tracking-wide uppercase">
              Premium Collection
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-4"
          >
            HP Laptop Series
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed"
          >
            Experience power and elegance with our curated selection of HP
            laptops. Designed for professionals, business leaders, and creators.
          </motion.p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10">
          {categories.map((category) => {
            const Icon = categoryIcons[category] || Laptop;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeCategory === category
                    ? "text-gray-900 shadow-lg shadow-yellow-500/25 ring-2 ring-yellow-400 ring-offset-2 dark:ring-offset-gray-900"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {activeCategory === category && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-yellow-400 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon
                  className={`w-4 h-4 relative z-10 ${
                    activeCategory === category
                      ? "text-gray-900"
                      : "text-yellow-400"
                  }`}
                />
                <span className="relative z-10">{category}</span>
              </button>
            );
          })}
        </div>

        {/* Carousel & Controls */}
        <div className="relative group/carousel">
          {/* Navigation Buttons */}
          <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 -left-12 -right-12 justify-between pointer-events-none z-20">
            <button
              className="hp-prev pointer-events-auto p-4 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-white shadow-lg hover:bg-yellow-400 hover:text-gray-900 dark:hover:bg-yellow-400 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 -translate-x-4 group-hover/carousel:translate-x-0"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              className="hp-next pointer-events-auto p-4 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-white shadow-lg hover:bg-yellow-400 hover:text-gray-900 dark:hover:bg-yellow-400 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 translate-x-4 group-hover/carousel:translate-x-0"
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
              centeredSlides={true}
              navigation={{
                nextEl: ".hp-next",
                prevEl: ".hp-prev",
              }}
              pagination={{
                clickable: true,
                el: ".hp-pagination",
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
            <div className="hp-pagination flex justify-center gap-2 w-auto!" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HpLaptopSection;
