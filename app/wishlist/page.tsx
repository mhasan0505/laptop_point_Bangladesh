"use client";

import ProductsCard from "@/components/ui/ProductsCard";
import { useWishlist } from "@/contexts/WishlistContext";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";

const WishlistPage = () => {
  const { wishlistItems, clearWishlist } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-6">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Add products to your wishlist to save them for later and keep track
            of items you love.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Wishlist
            </h1>
            <p className="text-gray-600">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"}
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <button
              onClick={clearWishlist}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear Wishlist
            </button>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {wishlistItems.map((product) => (
            <ProductsCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
