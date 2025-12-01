"use client";

import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface CartItemProps {
  item: {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice: number;
    image: string | { src: string };
    quantity: number;
    condition?: string;
    color?: string;
    specs?: {
      processor?: string;
      ram?: string;
      storage?: string;
      display?: string;
    };
  };
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.id);
    setShowRemoveConfirm(false);
  };

  const imageUrl = typeof item.image === "string" ? item.image : item.image.src;
  const discount = Math.round(
    ((item.originalPrice - item.price) / item.originalPrice) * 100
  );

  return (
    <div className="relative bg-white dark:bg-card rounded-xl border border-border/30 p-4 sm:p-6 transition-all duration-300 hover:shadow-lg">
      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Remove Item?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to remove this item from your cart?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image */}
        <div className="relative w-full sm:w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className="object-contain p-2 transition-transform duration-300 hover:scale-110"
          />
          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discount}%
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-base sm:text-lg line-clamp-2 mb-1">
                {item.name}
              </h3>
              <p className="text-sm text-muted-foreground">{item.brand}</p>
            </div>
            <button
              onClick={() => setShowRemoveConfirm(true)}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-500"
              aria-label="Remove item"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Specs */}
          {item.specs && (
            <div className="flex flex-wrap gap-2 mb-3">
              {item.specs.processor && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {item.specs.processor}
                </span>
              )}
              {item.specs.ram && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {item.specs.ram} RAM
                </span>
              )}
              {item.specs.storage && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {item.specs.storage}
                </span>
              )}
            </div>
          )}

          {/* Options */}
          {(item.condition || item.color) && (
            <div className="flex gap-3 mb-3 text-sm">
              {item.condition && (
                <span className="text-muted-foreground">
                  Condition:{" "}
                  <span className="font-medium text-foreground">
                    {item.condition}
                  </span>
                </span>
              )}
              {item.color && (
                <span className="text-muted-foreground">
                  Color:{" "}
                  <span className="font-medium text-foreground">
                    {item.color}
                  </span>
                </span>
              )}
            </div>
          )}

          {/* Price and Quantity */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-auto">
            {/* Quantity Controls */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Quantity:</span>
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={item.quantity >= 10}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="flex flex-col items-end">
              {item.originalPrice > item.price && (
                <span className="text-sm text-muted-foreground line-through">
                  ৳{item.originalPrice.toLocaleString()}
                </span>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-primary">
                  ৳{(item.price * item.quantity).toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  (৳{item.price.toLocaleString()} each)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
