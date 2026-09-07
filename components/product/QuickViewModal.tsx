"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Product } from "@/types/product";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  StarHalf,
  Truck,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewContent = ({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);

  const isWishlisted = isInWishlist(product.id);

  // Manage body overflow and recently viewed updates on mount
  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = "hidden";

    // Update recently viewed
    try {
      const saved = localStorage.getItem("recentlyViewed");
      let recent: Product[] = saved ? JSON.parse(saved) : [];
      recent = recent.filter((p: Product) => p.id !== product.id);
      recent.unshift(product);
      if (recent.length > 10) recent.pop();
      localStorage.setItem("recentlyViewed", JSON.stringify(recent));
    } catch (error) {
      console.error("Failed to update recently viewed:", error);
    }

    // Cleanup: unlock body scroll
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [product]);

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id.toString(),
        name: product.name,
        brand: product.brand || "",
        price: product.price,
        originalPrice: product.originalPrice,
        image:
          typeof product.image === "string"
            ? product.image
            : product.image.src || "",
      },
      quantity,
    );
    onClose();
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-9999 flex items-center justify-center p-4 md:p-6"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-4xl overflow-hidden shadow-2xl w-full max-w-5xl relative max-h-[90vh] overflow-y-auto flex flex-col md:flex-row"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-900 transition-all shadow-sm hover:shadow-md backdrop-blur-sm"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image Section */}
        <div className="w-full md:w-1/2 bg-gray-50 p-8 md:p-12 lg:p-16 flex items-center justify-center relative min-h-[300px] md:min-h-[500px]">
          {/* Floating Badges */}
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
            {discountPercentage > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-red-500/20 tracking-wide uppercase">
                -{discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Main Product Image */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative w-full aspect-square"
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain mix-blend-multiply drop-shadow-xl"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
            />
          </motion.div>
        </div>

        {/* Right Column: Details Section */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col h-full bg-white">
          <div className="flex-1">
            {/* Breadcrumb / Brand */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                {product.brand || "Brand"}
              </span>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {product.category || "Laptop"}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
              {product.name}
            </h2>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const rating = product.rating || 0;
                  if (rating >= star) {
                    return (
                      <Star
                        key={star}
                        className="w-4 h-4 fill-orange-500 text-orange-500"
                      />
                    );
                  }
                  if (rating >= star - 0.5) {
                    return (
                      <StarHalf
                        key={star}
                        className="w-4 h-4 fill-orange-500 text-orange-500"
                      />
                    );
                  }
                  return (
                    <Star
                      key={star}
                      className="w-4 h-4 fill-gray-100 text-gray-200"
                    />
                  );
                })}
              </div>
              <span className="text-sm font-medium text-gray-500">
                {product.reviews || 0} Reviews
              </span>
              <div className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> In Stock
              </span>
            </div>

            {/* Price Block */}
            <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-4xl font-bold text-gray-900">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <div className="flex flex-col mb-1.5">
                    <span className="text-sm text-gray-400 line-through">
                      ৳{product.originalPrice.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Price includes VAT & Tax. Free shipping available.
              </p>
            </div>

            {/* Key Features / Specs */}
            {product.specs && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                  Key Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(product.specs)
                    .slice(0, 4)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-start gap-2 text-sm bg-white border border-gray-100 p-2.5 rounded-lg"
                      >
                        <span className="font-medium text-gray-500 capitalize min-w-[70px]">
                          {key}:
                        </span>
                        <span className="text-gray-900 font-medium truncate">
                          {value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions Section */}
          <div className="pt-6 border-t border-gray-100 mt-auto">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center bg-gray-100 rounded-full p-1 w-[140px] justify-between">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-gray-900 text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-900 shadow-sm hover:shadow-md transition-all"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  className="flex-1 h-12 rounded-full text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all gap-2"
                  onClick={handleAddToCart}
                  aria-label="Add to cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </Button>

                {/* Wishlist Button */}
                <Button
                  variant="outline"
                  className={`h-12 w-12 rounded-full border-gray-200 hover:border-red-200 hover:bg-red-50 p-0 transition-colors ${
                    isWishlisted
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "bg-white text-gray-400"
                  }`}
                  onClick={handleWishlistToggle}
                  aria-label={
                    isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  <Heart
                    className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`}
                  />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center gap-2.5 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium">Official Warranty</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg justify-center">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Fast Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isOpen) {
      timer = setTimeout(() => setMounted(true), 0);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && product && (
        <QuickViewContent
          key={product.id}
          product={product}
          onClose={onClose}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default QuickViewModal;
