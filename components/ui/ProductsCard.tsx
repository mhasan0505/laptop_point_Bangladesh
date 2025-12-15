"use client";

import QuickViewModal from "@/components/product/QuickViewModal";
import { useCart } from "@/contexts/CartContext";
import { useComparison } from "@/contexts/ComparisonContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Product } from "@/types/product";
import { Eye, Heart, Plus, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductsCardProps {
  product: Product;
}

const ProductsCard = ({ product }: ProductsCardProps) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToComparison, removeFromComparison, isInComparison, canAddMore } =
    useComparison();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInComparison(product.id);

  const handleAddToCart = () => {
    addToCart({
      id: product.id.toString(),
      name: product.name,
      brand: product.brand || "",
      price: product.price,
      originalPrice: product.originalPrice || 0,
      image:
        typeof product.image === "string" ? product.image : product.image.src,
      specs: product.specs,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const toggleComparison = () => {
    if (isCompared) {
      removeFromComparison(product.id);
    } else {
      if (canAddMore()) {
        addToComparison(product);
      } else {
        alert("You can compare up to 4 products at a time");
      }
    }
  };

  return (
    <div className="group relative w-full max-w-[280px] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/50">
      <Link href={`/product/${product.slug}`} className="block h-full">
        {/* Image Container with Hover Actions */}
        <div className="relative aspect-4/5 bg-gray-50 dark:bg-gray-800/50 p-6 overflow-hidden">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {product.discount && (
              <span className="px-2 py-1 text-[10px] font-bold tracking-wider text-white bg-black dark:bg-white dark:text-black rounded-sm uppercase">
                -{product.discount}%
              </span>
            )}
          </div>

          {/* Floating Action Buttons (Top Right) */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-100 translate-x-0 lg:translate-x-10 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100 transition-all duration-300 ease-out">
            <button
              onClick={(e) => {
                e.preventDefault(); // Prevent navigation
                e.stopPropagation();
                toggleWishlist();
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
              onClick={(e) => {
                e.preventDefault(); // Prevent navigation
                e.stopPropagation();
                setShowQuickView(true);
              }}
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
              e.preventDefault(); // Prevent navigation
              e.stopPropagation();
              handleAddToCart();
            }}
            className={`absolute bottom-3 right-3 p-3 rounded-full shadow-lg opacity-100 translate-y-0 lg:translate-y-4 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95 ${
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

          {/* Add to Comparison (Bottom Left Floating) */}
          <button
            onClick={(e) => {
              e.preventDefault(); // Prevent navigation
              e.stopPropagation();
              toggleComparison();
            }}
            disabled={!canAddMore() && !isCompared}
            className={`absolute bottom-3 left-3 px-3 py-2 rounded-full shadow-lg opacity-100 translate-y-0 lg:translate-y-4 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-300 text-xs font-semibold flex items-center gap-1 ${
              isCompared
                ? "bg-yellow-500 text-white"
                : !canAddMore()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            title="Add to Compare"
          >
            <input
              type="checkbox"
              checked={isCompared}
              onChange={() => {}}
              className="w-3 h-3 pointer-events-none"
            />
            Compare
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

            <div className="flex items-center gap-1 text-orange-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-orange-500" />
              <span>{product.rating?.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </Link>

      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </div>
  );
};

export default ProductsCard;
