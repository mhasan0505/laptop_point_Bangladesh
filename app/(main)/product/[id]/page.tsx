"use client";

import { laptopData } from "@/app/data/data";
import ProductsCard from "@/components/ui/ProductsCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useComparison } from "@/contexts/ComparisonContext";
import { useWishlist } from "@/contexts/WishlistContext";
import {
  ArrowLeft,
  Check,
  Heart,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToComparison, removeFromComparison, isInComparison, canAddMore } =
    useComparison();

  // Find product by ID
  const product = laptopData.laptops.find((p) => p.id.toString() === params.id);

  const [mainImage, setMainImage] = useState(product?.image);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Product Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The product you are looking for does not exist or has been removed.
        </p>
        <Link href="/shop">
          <Button>Back to Shop</Button>
        </Link>
      </div>
    );
  }

  // Related products (same brand or category)
  const relatedProducts = laptopData.laptops
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.brand === product.brand || p.category === product.category)
    )
    .slice(0, 4);

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInComparison(product.id);

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
            : (product.image as any).src || "",
      },
      quantity
    );
  };

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Back */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="text-sm text-gray-500">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>{" "}
            /{" "}
            <Link href="/shop" className="hover:text-primary">
              Shop
            </Link>{" "}
            / <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Column: Images */}
            <div className="p-8 lg:p-12 bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center">
              <div className="relative w-full aspect-square max-w-[500px] bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm mb-6 flex items-center justify-center">
                {/* Floating Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {discountPercentage > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-red-500/20 tracking-wide uppercase">
                      -{discountPercentage}% OFF
                    </span>
                  )}
                  {product.condition &&
                    product.condition.map((cond) => (
                      <span
                        key={cond}
                        className="bg-black/5 backdrop-blur-md text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 uppercase"
                      >
                        {cond}
                      </span>
                    ))}
                </div>

                <Image
                  src={mainImage || product.image}
                  alt={product.name}
                  fill
                  className="object-contain hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-4 w-full justify-center">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMainImage(img)}
                      className={`relative w-20 h-20 rounded-xl bg-white p-2 border-2 transition-all flex-shrink-0 ${
                        (mainImage || product.image) === img
                          ? "border-primary shadow-md scale-105"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`View ${idx + 1}`}
                        fill
                        className="object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Product Info */}
            <div className="p-8 lg:p-12 flex flex-col">
              <div className="mb-2">
                <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
                  {product.brand}
                </span>
                <span className="ml-3 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {product.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Stock */}
              <div className="flex items-center gap-6 mb-8 text-sm">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (product.rating || 5)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-medium text-gray-600">
                    ({product.reviews || 0} Reviews)
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                  <Check className="w-4 h-4" />
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-end gap-4 mb-8">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <div className="flex flex-col mb-2">
                    <span className="text-lg text-gray-400 line-through">
                      ৳{product.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-red-500 font-medium">
                      You save ৳
                      {(product.originalPrice - product.price).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 border-b border-gray-100 pb-8">
                {/* Find description from data or use placeholder text */}
                {(product as any).description?.short ||
                  "No description available."}
              </p>

              {/* Features List (Short) */}
              {product.features && (
                <ul className="mb-8 space-y-2">
                  {product.features.slice(0, 4).map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1.5 w-full sm:w-[140px] justify-between">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  className="flex-1 h-14 rounded-full text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all gap-2"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className={`h-14 w-14 rounded-full border-gray-200 p-0 transition-colors ${
                      isWishlisted
                        ? "bg-red-50 border-red-200 text-red-500"
                        : "hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                    }`}
                    onClick={() =>
                      isWishlisted
                        ? removeFromWishlist(product.id)
                        : addToWishlist(product)
                    }
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        isWishlisted ? "fill-current" : ""
                      }`}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    className={`h-14 w-14 rounded-full border-gray-200 p-0 transition-colors ${
                      isCompared
                        ? "bg-yellow-50 border-yellow-200 text-yellow-600"
                        : "hover:border-yellow-200 hover:bg-yellow-50 hover:text-yellow-600"
                    }`}
                    onClick={() =>
                      isCompared
                        ? removeFromComparison(product.id)
                        : canAddMore() && addToComparison(product)
                    }
                    disabled={!isCompared && !canAddMore()}
                  >
                    <Share2 className="w-5 h-5" />{" "}
                    {/* Using Share2 as placeholder for compare icon if standard isn't available, or rotate icon */}
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900 uppercase">
                      Official Warranty
                    </span>
                    <span className="text-[10px] text-gray-500">
                      2 Years Guarantee
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900 uppercase">
                      Free Delivery
                    </span>
                    <span className="text-[10px] text-gray-500">
                      All over Bangladesh
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section (Description, Specs, Reviews) */}
          <div className="border-t border-gray-200">
            <div className="flex items-center justify-center gap-8 border-b border-gray-200 px-4">
              {["description", "specifications", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-6 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/20 p-8 md:p-12 lg:p-16 min-h-[400px]">
              {activeTab === "description" && (
                <div className="max-w-4xl mx-auto space-y-6 text-gray-600 leading-relaxed">
                  <p className="text-lg font-medium text-gray-900">
                    {(product as any).description?.short}
                  </p>
                  <p>
                    {(product as any).description?.full ||
                      "Full description coming soon..."}
                  </p>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="max-w-3xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    {product.specs &&
                      Object.entries(product.specs).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex flex-col py-3 border-b border-gray-200"
                        >
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                            {key}
                          </span>
                          <span className="font-medium text-gray-900">
                            {value}
                          </span>
                        </div>
                      ))}
                    <div className="flex flex-col py-3 border-b border-gray-200">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                        Stock ID
                      </span>
                      <span className="font-medium text-gray-900">
                        {(product as any).sku || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="max-w-2xl mx-auto text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-50 text-yellow-500 mb-4">
                    <Star className="w-8 h-8 fill-current" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No Reviews Yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Be the first to review this product.
                  </p>
                  <Button variant="outline">Write a Review</Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <div key={p.id} className="flex justify-center">
                  <ProductsCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
