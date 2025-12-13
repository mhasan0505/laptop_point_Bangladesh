"use client";

import { useCart } from "@/contexts/CartContext";
import { Product } from "@/types/product";
import { Eye, Heart, Plus, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ProductsCardProps {
  product: Product;
}

const ProductsCard = ({ product }: ProductsCardProps) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id: product.id.toString(),
      name: product.name,
      brand: product.brand || "",
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      specs: product.specs,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="group relative w-full max-w-[280px] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/50">
      {/* Image Container with Hover Actions */}
      <div className="relative aspect-[4/5] bg-gray-50 dark:bg-gray-800/50 p-6 overflow-hidden">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.discount && (
            <span className="px-2 py-1 text-[10px] font-bold tracking-wider text-white bg-black dark:bg-white dark:text-black rounded-sm uppercase">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Floating Action Buttons (Top Right) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className={`p-2 rounded-full shadow-md transition-colors duration-200 ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            }`}
            title="Add to Wishlist"
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`}
            />
          </button>
          <button
            className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-md hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200"
            title="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Product Image */}
        <div className="relative w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
          <Image
            src={product.image}
            alt={product.name}
            width={220}
            height={220}
            className={`object-contain transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            priority
          />
        </div>

        {/* Minimal Add to Cart (Bottom Right Floating) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          className={`absolute bottom-3 right-3 p-3 rounded-full shadow-lg translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95 ${
            addedToCart
              ? "bg-emerald-500 text-white"
              : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
          }`}
          title="Add to Cart"
        >
          {addedToCart ? (
            <ShoppingBag className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Product Info - Minimalist Layout */}
      <div className="p-4">
        <div className="mb-1 text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
          {product.category || "Laptop"}
        </div>

        <h3
          className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[40px]"
          title={product.name}
        >
          {product.name}
        </h3>

        <div className="flex items-end justify-between mt-2">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ৳{product.price.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{product.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsCard;
