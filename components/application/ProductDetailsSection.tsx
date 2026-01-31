"use client";

import {
  ChevronDown,
  Heart,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ProductDetailsProps {
  product?: {
    name: string;
    category: string;
    description: string;
    price: number;
    originalPrice?: number;
    inStock: boolean;
    rating: number;
    reviewCount: number;
    images: string[];
    specifications?: Array<{ label: string; value: string }>;
  };
}

const ProductDetailsSection = ({ product }: ProductDetailsProps) => {
  // Default product data for demonstration
  const defaultProduct = {
    name: "HP Elitebook 840 G3",
    category: "Laptops",
    description:
      "Professional business laptop featuring Intel Core i5 processor, 8GB RAM, and 256GB SSD. Perfect for productivity with a stunning 14-inch FHD display, premium build quality, and long battery life. Ideal for professionals who demand performance and reliability.",
    price: 1200.0,
    originalPrice: 1300.0,
    inStock: true,
    rating: 4.5,
    reviewCount: 128,
    images: [
      "/products/hp/HP_Elitebook_840_G3/front.png",
      "/products/hp/HP_Elitebook_840_G3/front.png",
      "/products/hp/HP_Elitebook_840_G3/front.png",
      "/products/hp/HP_Elitebook_840_G3/front.png",
    ],
    specifications: [
      { label: "Processor", value: "Intel Core i5-6300U (6th Gen)" },
      { label: "RAM", value: "8GB DDR4" },
      { label: "Storage", value: "256GB SSD" },
      { label: "Display", value: '14" FHD (1920x1080)' },
      { label: "Graphics", value: "Intel HD Graphics 520" },
      { label: "Operating System", value: "Windows 10 Pro" },
      { label: "Battery", value: "Around 3 hours" },
      { label: "Weight", value: "1.5 kg" },
      { label: "Connectivity", value: "Wi-Fi, Bluetooth, USB 3.0, HDMI" },
      { label: "Warranty", value: "1 Year" },
    ],
  };

  const productData = product || defaultProduct;
  const savings = productData.originalPrice
    ? productData.originalPrice - productData.price
    : 0;
  const discountPercentage = productData.originalPrice
    ? Math.round((savings / productData.originalPrice) * 100)
    : 0;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [isZoomed, setIsZoomed] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2)",
    });
  };

  const toggleZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isZoomed) {
      // Zoom out
      setIsZoomed(false);
      setZoomStyle({
        transformOrigin: "center center",
        transform: "scale(1)",
      });
    } else {
      // Zoom in
      setIsZoomed(true);
      const { left, top, width, height } =
        e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;

      setZoomStyle({
        transformOrigin: `${x}% ${y}%`,
        transform: "scale(2)",
      });
    }
  };

  const handleMouseLeave = () => {
    if (isZoomed) {
      setIsZoomed(false);
      setZoomStyle({
        transformOrigin: "center center",
        transform: "scale(1)",
      });
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <div className="w-full bg-linear-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950 py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square w-full bg-linear-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden border border-border/30 shadow-lg group">
              {/* Discount Badge */}
              {discountPercentage > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-linear-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  -{discountPercentage}% OFF
                </div>
              )}

              {/* Main Product Image */}
              <div
                className={`relative w-full h-full flex items-center justify-center p-8 overflow-hidden ${
                  isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                }`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={toggleZoom}
              >
                <div
                  className="relative w-full h-full transition-transform duration-200 ease-out"
                  style={zoomStyle}
                >
                  <Image
                    src={productData.images[selectedImage]}
                    alt={productData.name}
                    width={500}
                    height={500}
                    className={`w-full h-full object-contain mix-blend-multiply ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    priority
                  />
                </div>

                {/* Loading skeleton */}
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 bg-gray-200/80 dark:bg-gray-700/80 rounded-2xl animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-3">
              {productData.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedImage(index);
                    setImageLoaded(false);
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                    selectedImage === index
                      ? "border-primary shadow-lg shadow-primary/20"
                      : "border-border/30 hover:border-primary/50"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${productData.name} - Image ${index + 1}`}
                    width={100}
                    height={100}
                    className="object-contain mix-blend-multiply p-2 bg-linear-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Information Section */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div className="inline-block">
              <span className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
                {productData.category}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              {productData.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 transition-all duration-200 ${
                      star <= Math.floor(productData.rating)
                        ? "text-yellow-500 fill-yellow-500"
                        : star - 0.5 <= productData.rating
                          ? "text-yellow-500 fill-yellow-500/50"
                          : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {productData.rating.toFixed(1)} ({productData.reviewCount}{" "}
                reviews)
              </span>
            </div>

            {/* Price Section */}
            <div className="bg-linear-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-2xl p-6 border border-primary/20">
              <div className="space-y-2">
                {productData.originalPrice && (
                  <div className="flex items-center gap-3">
                    <span className="text-lg text-muted-foreground line-through">
                      ${productData.originalPrice.toFixed(2)}
                    </span>
                    <span className="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">
                      Save ${savings.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="text-4xl md:text-5xl font-bold text-primary">
                  ${productData.price.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  productData.inStock
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-red-500"
                }`}
              ></div>
              <span
                className={`font-medium ${
                  productData.inStock
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {productData.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {productData.description}
            </p>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-3 font-semibold min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                disabled={!productData.inStock}
                className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-primary to-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>

              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  isWishlisted
                    ? "bg-linear-to-br from-red-500 to-pink-600 text-white border-transparent shadow-lg shadow-red-500/30"
                    : "border-border hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-950/20"
                }`}
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart
                  className={`w-6 h-6 transition-all duration-300 ${
                    isWishlisted ? "fill-current" : ""
                  }`}
                />
              </button>

              <button
                className="p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:scale-105"
                aria-label="Share product"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* Specifications Section */}
            {productData.specifications &&
              productData.specifications.length > 0 && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground">
                      Specifications
                    </h2>
                    <button
                      onClick={() => setShowAllSpecs(!showAllSpecs)}
                      className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      <span className="text-sm font-medium">
                        {showAllSpecs ? "Show Less" : "Show All"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          showAllSpecs ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="divide-y divide-border">
                      {(showAllSpecs
                        ? productData.specifications
                        : productData.specifications.slice(0, 5)
                      ).map((spec, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-2 gap-4 p-4 hover:bg-muted/50 transition-colors"
                        >
                          <span className="font-medium text-foreground">
                            {spec.label}
                          </span>
                          <span className="text-muted-foreground">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSection;
