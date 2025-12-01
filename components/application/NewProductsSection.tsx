"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductsCard from "../ui/ProductsCard";

const NewProductsSection = () => {
  return (
    <div className="w-full bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950 py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              New Arrivals
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Discover our latest products
            </p>
          </div>

          {/* Navigation Buttons - Hidden on mobile, visible on tablet+ */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              className="new-products-prev p-2.5 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              className="new-products-next p-2.5 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Swiper Carousel */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            centeredSlides={false}
            navigation={{
              nextEl: ".new-products-next",
              prevEl: ".new-products-prev",
            }}
            pagination={{
              clickable: true,
              el: ".custom-pagination",
              renderBullet: (_, className) => {
                return `<span class="${className} bg-gray-400! dark:bg-gray-500! opacity-100! w-2! h-2! mx-1! rounded-full! transition-all duration-200"></span>`;
              },
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              // Mobile (small)
              320: {
                slidesPerView: 1,
                spaceBetween: 12,
              },
              // Mobile (large)
              480: {
                slidesPerView: 1.5,
                spaceBetween: 16,
              },
              // Tablet (small)
              640: {
                slidesPerView: 2,
                spaceBetween: 16,
              },
              // Tablet (large)
              768: {
                slidesPerView: 2.5,
                spaceBetween: 20,
              },
              // Laptop (small)
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              // Laptop (large)
              1280: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
              // Desktop
              1536: {
                slidesPerView: 5,
                spaceBetween: 24,
              },
            }}
            className="pb-12! md:pb-14!"
          >
            {[...Array(8)].map((_, index) => (
              <SwiperSlide key={index} className="h-auto! py-2">
                <div className="flex justify-center">
                  <ProductsCard />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom pagination container */}
          <div className="custom-pagination flex justify-center gap-1 mt-4 sm:mt-6" />
        </div>

        {/* Mobile Navigation Buttons - Only visible on mobile */}
        <div className="flex sm:hidden justify-center items-center gap-3 mt-6">
          <button
            className="new-products-prev p-3 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 shadow-md active:scale-95 border border-gray-200 dark:border-gray-700"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            className="new-products-next p-3 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 shadow-md active:scale-95 border border-gray-200 dark:border-gray-700"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewProductsSection;
