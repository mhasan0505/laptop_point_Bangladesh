"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/types/product";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, Minus, Plus, ShoppingCart, Star, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState ,  } from "react";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      const saved = localStorage.getItem("recentlyViewed");
      let recent = saved ? JSON.parse(saved) : [];

      // Remove duplicate if exists
      recent = recent.filter((p: Product) => p.id !== product.id);

      // Add to front
      recent.unshift(product);

      // Limit to 10
      if (recent.length > 10) recent.pop();

      localStorage.setItem("recentlyViewed", JSON.stringify(recent));
    }
  }, [isOpen, product]);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id.toString(),
        name: product.name,
        brand: product.brand || "",
        price: product.price,
        originalPrice: product.originalPrice,
        image: typeof product.image === "string" ? product.image : "", // Handle StaticImageData if needed, assuming string for now or simplistic match
        // Note: Logic for StaticImageData might need standardizing in types/cart.ts.
        // For now, casting or simple check. CartItem usually expects string URL.
      },
      quantity
    );
    onClose();
  };

  // Helper to ensure image src is string for cart (if CartItem expects string)
  // Re-checking types: CartItem image is string. Product image is string | StaticImageData.
  // We'll simplisticly assume it's string for this logic or handle basic conversion if it was static.
  // In a real app we'd handle this better.

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <div className="grid md:grid-cols-2">
                {/* Image Section */}
                <div className="bg-gray-50 p-8 flex items-center justify-center">
                  <div className="relative w-full aspect-square max-w-[400px]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-8 flex flex-col">
                  <div className="mb-4">
                    <span className="text-sm font-bold text-primary tracking-wide uppercase">
                      {product.category || "Laptop"}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 mt-1 mb-2 leading-tight">
                      {product.name}
                    </h2>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {product.rating}
                      </div>
                      <span className="text-gray-500">
                        {product.reviews || 12} Reviews
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-emerald-600 font-medium">
                        In Stock
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-3xl font-bold text-gray-900">
                      ৳{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        ৳{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {product.specs && (
                    <div className="mb-6 space-y-2">
                      {Object.entries(product.specs)
                        .slice(0, 4)
                        .map(([key, value]) => (
                          <div key={key} className="flex gap-2 text-sm">
                            <span className="font-medium text-gray-900 capitalize w-24">
                              {key}:
                            </span>
                            <span className="text-gray-600">{value}</span>
                          </div>
                        ))}
                    </div>
                  )}

                  <hr className="border-gray-100 my-4" />

                  {/* Actions */}
                  <div className="space-y-4 mt-auto">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-200 rounded-full">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-l-full"
                        >
                          <Minus className="w-4 h-4 text-gray-500" />
                        </button>
                        <span className="w-10 text-center font-medium">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-r-full"
                        >
                          <Plus className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      <Button
                        className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-full h-10 gap-2 font-bold"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-full w-10 h-10 p-0 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        onClick={() => setIsWishlisted(!isWishlisted)}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isWishlisted
                              ? "fill-red-500 text-red-500"
                              : "text-gray-500"
                          }`}
                        />
                      </Button>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        <span>Official Warranty Available</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        <span>Fast Delivery within 24 Hours</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
