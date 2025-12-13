"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Star, Trash2 } from "lucide-react";

// Mock data structure
const comparisonProducts = [
  {
    id: 1,
    name: "HP EliteBook 840 G8",
    image: "/hp-laptop.png",
    price: 85000,
    rating: 4.8,
    specs: {
      processor: "Intel Core i5-1135G7",
      ram: "16GB DDR4",
      storage: "512GB NVMe SSD",
      display: "14-inch FHD IPS",
      graphics: "Intel Iris Xe",
      battery: "53Wh Li-ion",
      os: "Windows 11 Pro",
      weight: "1.32 kg",
      warranty: "3 Years",
    },
  },
  {
    id: 2,
    name: "HP ProBook 450 G9",
    image: "/hp-laptop.png",
    price: 72000,
    rating: 4.5,
    specs: {
      processor: "Intel Core i5-1235U",
      ram: "8GB DDR4",
      storage: "512GB NVMe SSD",
      display: "15.6-inch FHD",
      graphics: "Intel Iris Xe",
      battery: "51Wh Li-ion",
      os: "Windows 11 Home",
      weight: "1.74 kg",
      warranty: "2 Years",
    },
  },
  {
    id: 3,
    name: "HP Pavilion 15",
    image: "/hp-laptop.png",
    price: 92000,
    rating: 4.7,
    specs: {
      processor: "AMD Ryzen 7 5825U",
      ram: "16GB DDR4",
      storage: "1TB NVMe SSD",
      display: "15.6-inch FHD IPS",
      graphics: "AMD Radeon",
      battery: "41Wh Li-ion",
      os: "Windows 11 Home",
      weight: "1.75 kg",
      warranty: "2 Years",
    },
  },
];

const ComparisonTable = () => {
  const specCategories = [
    {
      title: "Performance",
      items: [
        { label: "Processor", key: "processor" },
        { label: "RAM", key: "ram" },
        { label: "Graphics", key: "graphics" },
        { label: "OS", key: "os" },
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
        { label: "Warranty", key: "warranty" },
      ],
    },
  ];

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto relative scrollbar-hide">
        <div className="min-w-[900px]">
          {/* Header Row (Sticky) */}
          <div className="grid grid-cols-4 sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
            {/* Empty First Cell */}
            <div className="p-6 sticky left-0 z-30 bg-white border-r border-gray-100 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                Comparison
              </h3>
              <p className="text-sm text-gray-500 font-medium mt-1">
                {comparisonProducts.length} items selected
              </p>
            </div>

            {/* Product Headers */}
            {comparisonProducts.map((product) => (
              <div key={product.id} className="p-6 relative text-center group">
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-full"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="relative h-32 w-full mb-4 flex items-center justify-center">
                  <div className="w-40 h-28 bg-gray-50 rounded-lg flex items-center justify-center">
                    {/* Placeholder for Product Image */}
                    <div className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200 rounded-lg animate-pulse" />
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 h-10 px-2">
                  {product.name}
                </h4>

                <div className="flex items-center justify-center gap-1 mb-3">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold text-gray-700">
                    {product.rating}
                  </span>
                </div>

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
                <div className="grid grid-cols-4 bg-gray-50/50">
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
                    className="grid grid-cols-4 group hover:bg-gray-50/30 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <div className="sticky left-0 bg-white group-hover:bg-gray-50/50 z-10 p-5 border-r border-gray-100 flex items-center">
                      <span className="font-medium text-gray-500">
                        {item.label}
                      </span>
                    </div>
                    {comparisonProducts.map((p) => (
                      <div
                        key={p.id}
                        className="p-5 text-gray-700 font-medium flex items-center justify-center text-center"
                      >
                        {item.key === "warranty" ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold">
                            <Check className="w-3.5 h-3.5" />
                            {p.specs[item.key as keyof typeof p.specs]}
                          </div>
                        ) : (
                          p.specs[item.key as keyof typeof p.specs]
                        )}
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
