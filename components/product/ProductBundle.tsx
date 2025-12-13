"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Check, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const ProductBundle = () => {
  const { addToCart } = useCart();
  const [selectedItems, setSelectedItems] = useState([true, true, true]);
  const [addedToCart, setAddedToCart] = useState(false);

  // Mock Bundle Data
  const mainProduct = {
    id: "bundle-1-main",
    name: "HP Envy 13 x360",
    price: 125000,
    originalPrice: 135000,
    image: "/hp-laptop.png",
  };

  const bundleItems = [
    {
      id: "bundle-1-acc1",
      name: "HP Wireless Mouse",
      price: 1500,
      originalPrice: 2200,
      image: "/hp-laptop.png", // using placeholder
    },
    {
      id: "bundle-1-acc2",
      name: 'Laptop Sleeve 13.3"',
      price: 1200,
      originalPrice: 1800,
      image: "/hp-laptop.png", // using placeholder
    },
  ];

  const allItems = [mainProduct, ...bundleItems];

  const totalPrice = allItems.reduce((sum, item, index) => {
    return selectedItems[index] ? sum + item.price : sum; // 0 is main product (always selected? or handle logic)
  }, 0);

  const totalOriginalPrice = allItems.reduce((sum, item, index) => {
    return selectedItems[index]
      ? sum + (item.originalPrice || item.price)
      : sum;
  }, 0);

  const discount = totalOriginalPrice - totalPrice;

  const handleAddBundle = () => {
    allItems.forEach((item, index) => {
      // Logic: if index 0 (main) is unselected, should we block? Assuming main is mandatory in this UI but let's allow flexibility
      // Modify logic: index 0 corresponds to selectedItems[0]
      if (selectedItems[index]) {
        addToCart({
          id: item.id,
          name: item.name,
          brand: "HP", // mock
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.image,
        });
      }
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const toggleItem = (index: number) => {
    // Prevent unselecting main product (index 0) if desired. Let's allow everything.
    const newSelected = [...selectedItems];
    newSelected[index] = !newSelected[index];
    setSelectedItems(newSelected);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6">
        Frequently Bought Together
      </h3>

      <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
        {/* Visuals */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
          {allItems.map((item, index) => (
            <div key={item.id} className="flex items-center">
              <div className="relative group">
                <div className="relative w-24 h-24 lg:w-32 lg:h-32 bg-gray-50 rounded-lg p-2 border border-gray-100 flex items-center justify-center">
                  {/* Checkbox overlay */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedItems[index]}
                      onChange={() => toggleItem(index)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </div>
                  <div
                    className={`relative w-full h-full ${
                      !selectedItems[index] &&
                      "opacity-40 grayscale transition-all"
                    }`}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                {/* Tooltip Name */}
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-gray-900 text-white text-xs rounded px-2 py-1 text-center z-20">
                  {item.name}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>

              {index < allItems.length - 1 && (
                <div className="mx-2 text-gray-300">
                  <Plus className="w-6 h-6" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary & Action */}
        <div className="flex flex-col gap-4 min-w-[250px] bg-gray-50/50 p-6 rounded-xl border border-gray-100 w-full lg:w-auto">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                ৳{totalPrice.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ৳{totalOriginalPrice.toLocaleString()}
              </span>
            </div>
            {discount > 0 && (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block">
                Save ৳{discount.toLocaleString()}
              </span>
            )}
          </div>

          <ul className="space-y-2">
            {allItems.map(
              (item, index) =>
                selectedItems[index] && (
                  <li
                    key={item.id}
                    className="text-xs text-gray-600 flex items-center justify-between"
                  >
                    <span className="line-clamp-1 flex-1">{item.name}</span>
                    <span className="font-medium">
                      ৳{item.price.toLocaleString()}
                    </span>
                  </li>
                )
            )}
          </ul>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
            onClick={handleAddBundle}
            disabled={!selectedItems.some(Boolean)}
          >
            {addedToCart ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Added to Cart
              </>
            ) : (
              `Add ${selectedItems.filter(Boolean).length} Items to Cart`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductBundle;
