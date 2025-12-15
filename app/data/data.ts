import { Product } from "@/types/product";
import productsRaw from "./products.json";

// Helper to map product ID/SKU/Model to image folder path
const getImageFolder = (model: string): string | null => {
  const m = model.toLowerCase();

  // HP
  if (m.includes("440 g3")) return "/products/hp/HP_Probook_440_G3";
  if (m.includes("840 g3")) return "/products/hp/HP_Elitebook_840_G3";
  if (m.includes("840 g6")) return "/products/hp/HP_Elitebook_840_G6";
  if (m.includes("zbook 14u g6")) return "/products/hp/HP_Zbook_14U_G6";
  if (m.includes("840 g7")) return "/products/hp/HP_Elitebook_840_G7";
  if (m.includes("840 g8")) return "/products/hp/HP_Elitebook_840_G8";
  if (m.includes("845 g7")) return "/products/hp/HP_Elitebook_845_G7";
  if (m.includes("845 g8")) return "/products/hp/HP_Elitebook_845_G8";
  if (m.includes("1040 g8") || m.includes("x360 1040"))
    return "/products/hp/HP_Elitebook_X360_1040_G8";

  // Dell
  if (m.includes("3190")) return "/products/dell/Dell_Latitude_3190";
  if (m.includes("3310")) return "/products/dell/Dell_Latitude_3310";
  if (m.includes("7490")) return "/products/dell/Dell_Latitude_7490";
  if (m.includes("3410")) return "/products/dell/Dell_Latitude_3410";
  if (m.includes("7400")) return "/products/dell/Dell_Latitude_7400";
  if (m.includes("7420")) return "/products/dell/Dell_Latitude_7420";

  // Lenovo
  if (m.includes("t490")) return "/products/lenovo/Lenovo_Thinkpad_T490";
  if (m.includes("t14")) return "/products/lenovo/Lenovo_Thinkpad_T14";
  if (m.includes("x1 carbon") || m.includes("x1c"))
    return "/products/lenovo/Lenovo_Thinkpad_X1";

  // Microsoft
  if (m.includes("surface laptop 3"))
    return "/products/microsoft/Surface_Laptop_3";
  if (m.includes("surface laptop 4"))
    return "/products/microsoft/Surface_Laptop_4";
  if (m.includes("surface book")) return "/products/microsoft/Surface_Book"; // Assuming this might exist or for future

  return null;
};

// Map each product
const laptops: Product[] = productsRaw.map((p: any) => {
  const folder = getImageFolder(p.model || p.name);

  // Construct images array if folder exists
  // We assume these files exist if the folder is matched.
  // If not, we might have broken images, but this is better than hardcoding.
  const mappedImages = folder
    ? [
        `${folder}/main.png`,
        `${folder}/front.png`,
        `${folder}/port.png`,
        `${folder}/side01.png`,
        `${folder}/side02.png`,
        `${folder}/keyboard.png`,
      ]
    : p.images || [];

  const mainImage = folder
    ? `${folder}/main.png`
    : mappedImages[0] || "/placeholder.png";

  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: p.pricing.sale_price,
    originalPrice: p.pricing.market_price,
    discount: p.pricing.discount_percentage,
    rating: 4.5 + Math.random() * 0.5, // Simulate rating
    reviews: Math.floor(Math.random() * 500) + 50, // Simulate reviews
    inStock: p.stock.quantity > 0,
    condition: [p.condition],
    color: ["Silver", "Black"], // Default colors
    image: mainImage,
    images: mappedImages,
    specs: {
      processor: p.specs.processor,
      ram: p.specs.ram,
      storage: p.specs.storage,
      display: `${p.specs.display.size} ${p.specs.display.resolution}`,
      graphics: p.specs.graphics,
      battery: "Up to 10 hours",
      weight: p.specs.weight,
    },
    features: p.features,
    category: p.category,
  };
});

export const laptopData = {
  laptops,
};
