"use client";

import { Button } from "@/components/ui/button";
import { useComparison } from "@/contexts/ComparisonContext";
import type { Product } from "@/types/product";
import { motion } from "framer-motion";
import { Star, Trash2 } from "lucide-react";
import Image from "next/image";

const getSpecValue = (
  product: Product,
  key: keyof NonNullable<Product["specs"]>,
) => {
  return product.specs?.[key] ?? "—";
};

const ComparisonTable = () => {
  const { comparisonItems, removeFromComparison } = useComparison();

  const specCategories = [
    {
      title: "Performance",
      items: [
        { label: "Processor", key: "processor" },
        { label: "RAM", key: "ram" },
        { label: "Graphics", key: "graphics" },
      ],
    },
    {
      title: "Display & Size",
      items: [
        { label: "Display", key: "display" },
        { label: "Weight", key: "weight" },
      ],
    },
    {
      title: "Storage & Power",
      items: [
        { label: "Storage", key: "storage" },
        { label: "Battery", key: "battery" },
      ],
    },
  ] as const;

  if (comparisonItems.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <h3 className="text-xl font-bold text-gray-900">No items to compare</h3>
        <p className="text-sm text-gray-500 mt-2">
          Add products to comparison to see them side by side.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto relative scrollbar-hide">
        <div className="min-w-[900px]">
          {/* Header Row (Sticky) */}
          <div
            className="grid sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm"
            style={{
              gridTemplateColumns: `minmax(220px, 1.1fr) repeat(${comparisonItems.length}, minmax(200px, 1fr))`,
            }}
          >
            {/* Empty First Cell */}
            <div className="p-6 sticky left-0 z-30 bg-white border-r border-gray-100 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                Comparison
              </h3>
              <p className="text-sm text-gray-500 font-medium mt-1">
                {comparisonItems.length} items selected
              </p>
            </div>

            {/* Product Headers */}
            {comparisonItems.map((product) => (
              <div key={product.id} className="p-6 relative text-center group">
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-full"
                  aria-label="Remove item"
                  onClick={() => removeFromComparison(product.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="relative h-32 w-full mb-4 flex items-center justify-center">
                  <div className="w-40 h-28 bg-gray-50 rounded-lg flex items-center justify-center">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={160}
                        height={112}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200 rounded-lg" />
                    )}
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 h-10 px-2">
                  {product.name}
                </h4>

                {typeof product.rating === "number" && (
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-gray-700">
                      {product.rating}
                    </span>
                  </div>
                )}

                <div className="font-bold text-lg text-primary mb-4">
                  ৳{product.price.toLocaleString()}
                </div>

                <Button className="w-full rounded-full bg-gray-900 text-white hover:bg-primary hover:text-gray-900 transition-all shadow-none hover:shadow-lg hover:shadow-primary/20">
                  Add to Cart
                </Button>
              </div>
            ))}
          </div>

          {/* Specs Rows */}
          <div className="text-sm">
            {specCategories.map((category) => (
              <div key={category.title}>
                {/* Category Header */}
                <div
                  className="grid bg-gray-50/50"
                  style={{
                    gridTemplateColumns: `minmax(220px, 1.1fr) repeat(${comparisonItems.length}, minmax(200px, 1fr))`,
                  }}
                >
                  <div className="sticky left-0 bg-gray-50/50 z-10 px-6 py-3 border-r border-gray-100">
                    <span className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                      {category.title}
                    </span>
                  </div>
                  <div className="col-span-3"></div>
                </div>

                {/* Spec Items */}
              {category.items.map((item) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="grid group hover:bg-gray-50/30 transition-colors border-b border-gray-100 last:border-0"
                    style={{
                      gridTemplateColumns: `minmax(220px, 1.1fr) repeat(${comparisonItems.length}, minmax(200px, 1fr))`,
                    }}
                  >
                    <div className="sticky left-0 bg-white group-hover:bg-gray-50/50 z-10 p-5 border-r border-gray-100 flex items-center">
                      <span className="font-medium text-gray-500">
                        {item.label}
                      </span>
                    </div>
                    {comparisonItems.map((p) => (
                      <div
                        key={p.id}
                        className="p-5 text-gray-700 font-medium flex items-center justify-center text-center"
                      >
                        {getSpecValue(p, item.key)}
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;
