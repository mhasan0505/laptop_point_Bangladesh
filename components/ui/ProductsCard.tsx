"use client";

import { useCart } from "@/contexts/CartContext";
import { Eye, Heart, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const ProductsCard = () => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id: "LP002",
      name: "HP Elitebook 840 G3",
      brand: "HP",
      price: 21700,
      originalPrice: 28000,
      image: "/products/hp/HP_Elitebook_840_G3/front.png",
      specs: {
        processor: "Intel Core i5 (6th Gen)",
        ram: "8GB",
        storage: "256GB SSD",
        display: '14" FHD LED',
      },
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div
      className="group relative w-[280px] h-[460px] flex flex-col bg-white dark:bg-card rounded-xl border border-border/30 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Stock & Discount Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-linear-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm">
          <span>In Stock</span>
        </div>
        {/* <div className="text-white bg-red-500 text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg">
          -8% OFF
        </div> */}
      </div>

      {/* Wishlist & Quick View Buttons */}
      <div
        className={`absolute top-3 right-3 z-10 flex flex-col gap-2 transition-all duration-300 ${
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 ${
            isWishlisted
              ? "bg-linear-to-br from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/30"
              : "bg-white/10 dark:bg-black/10 text-gray-700 dark:text-gray-200 hover:bg-red-500/90 hover:text-white shadow-md"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-4 h-4 transition-all duration-300 ${
              isWishlisted ? "fill-current scale-110" : "scale-100"
            }`}
          />
        </button>
        <button
          className="p-2.5 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-full text-gray-700 dark:text-gray-200 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 shadow-md"
          aria-label="Quick view"
          onClick={(e) => e.stopPropagation()}
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Product Image Container */}
      <div className="relative h-[220px] flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 overflow-hidden group">
        {/* Animated linear overlay */}
        <div
          className={`absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 transition-opacity duration-700 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        ></div>

        {/* Product Image */}
        <div className="relative w-full h-full flex items-center justify-center p-8">
          <Image
            src="/products/hp/HP_Elitebook_840_G3/front.png"
            alt="HP Elitebook 840 G3"
            width={200}
            height={200}
            className={`object-contain transition-all duration-700 ${
              isHovered ? "scale-110" : "scale-100"
            } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
            priority
          />

          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 bg-gray-200/80 dark:bg-gray-700/80 rounded-2xl animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-linear-to-r from-primary to-primary/90 text-white px-6 py-2.5 rounded-full font-medium text-sm shadow-lg transition-all duration-300 whitespace-nowrap ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          } hover:shadow-xl hover:shadow-primary/20 hover:scale-105`}
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{addedToCart ? "Added!" : "Add to Cart"}</span>
        </button>
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col p-5 space-y-3">
        {/* Category */}
        <span className="text-xs font-medium text-primary/80 dark:text-primary/60">
          Laptops
        </span>

        {/* Product Name */}
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
          HP Elitebook 840 G3
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2">
          Business laptop with Intel Core i5, 8GB RAM, 256GB SSD, 14&quot; FHD
          display
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 transition-all duration-200 ${
                  star <= 4
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-200 dark:text-gray-700"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-1">
            (4.0) • 128 reviews
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Price Section */}
        <div className="pt-3 mt-auto">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground line-through">
                $1,300.00
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-primary">
                  $1,200.00
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  You save $100.00
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status ribbon */}
      {/* <div className="absolute -right-8 top-4 w-32 bg-primary text-white text-xs font-semibold text-center py-1 transform rotate-45 shadow-md">
        Popular
      </div> */}
    </div>
  );
};

export default ProductsCard;
