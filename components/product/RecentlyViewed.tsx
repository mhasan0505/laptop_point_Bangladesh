"use client";

import { Product } from "@/types/product";
import { useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductsCard from "../ui/ProductsCard";

const RecentlyViewed = () => {
  // Use lazy initial state to read from localStorage only once during initialization
  const [recentProducts, setRecentProducts] = useState<Product[]>(() => {
    if (typeof window === "undefined") return [];

    const saved = localStorage.getItem("recentlyViewed");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse recently viewed items", e);
        return [];
      }
    }
    return [];
  });

  if (recentProducts.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50/50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Recently Viewed
        </h2>

        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
          }}
          className="pb-12 px-4!"
        >
          {recentProducts.map((product) => (
            <SwiperSlide key={`recent-${product.id}`}>
              <ProductsCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default RecentlyViewed;
