"use client";

import FlashSaleBanner from "@/components/application/FlashSaleBanner";
import ProductsCard from "@/components/ui/ProductsCard";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";

export default function DealsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (active && Array.isArray(data)) {
          setAllProducts(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load live products for deals:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  const discountedProducts = allProducts.filter(
    (product) => product.discount && product.discount > 0
  );

  return (
    <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-12">
      <h1 className="text-3xl font-bold mb-8">Hot Deals</h1>

      <FlashSaleBanner />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {discountedProducts.length > 0 ? (
          discountedProducts.map((product) => (
            <ProductsCard key={product.id} product={product} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No active deals at the moment. Check back later!
          </p>
        )}
      </div>
    </div>
  );
}
