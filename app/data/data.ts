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
    return "/products/microsoft/Microsoft_Surface_laptop_3";
  if (m.includes("surface laptop 4"))
    return "/products/microsoft/Microsoft_Surface_laptop_4";
  if (m.includes("surface book")) return "/products/microsoft/Surface_Book";

  return null;
};

// Helper to generate slugs
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};

// Helper to generate descriptions based on model
const getDescription = (
  model: string,
  brand: string,
  specs: RawProduct["specs"]
) => {
  const m = model.toLowerCase();
  let short = "";
  let full = "";

  if (brand === "HP") {
    if (m.includes("840 g3")) {
      short = "Reliable business workhorse with efficient performance.";
      full =
        "The HP EliteBook 840 G3 is a versatile tailored for business professionals. With its lightweight design, durable build, and essential connectivity options, it's perfect for daily productivity.";
    } else if (m.includes("840 g6")) {
      short = "Premium ultrabook with sleek design and powerful security.";
      full =
        "Experience premium mobility with the HP EliteBook 840 G6. Featuring an ultra-bright display, aluminum chassis, and enterprise-grade security, it's designed for the modern mobile workforce.";
    } else if (m.includes("1040")) {
      short = "Convertible business 2-in-1 with stunning display.";
      full =
        "The HP EliteBook x360 1040 G8 adapts to your work style with its 360-degree hinge. Enjoy ease of use as a tablet or laptop, backed by powerful processing for demanding tasks.";
    } else {
      short = `Professional-grade ${brand} laptop for business and study.`;
      full = `This ${brand} ${model} offers a perfect balance of performance and portability. Equipped with a ${specs.processor} processor and fast SSD storage, it handles multitasking with ease.`;
    }
  } else if (brand === "Dell") {
    if (m.includes("3190")) {
      short = "Rugged and compact, perfect for students.";
      full =
        "The Dell Latitude 3190 2-in-1 is built to withstand the rigors of student life. Its durable hinge and spill-resistant keyboard make it an ideal educational companion.";
    } else if (m.includes("7400")) {
      short = "Compact commercial laptop with great battery life.";
      full =
        "The Dell Latitude 7400 stands out with its small footprint and long battery life. Validated for security and manageability, it's a top choice for IT professionals.";
    } else {
      short = `Durable and secure ${brand} Latitude series laptop.`;
      full = `Boost your productivity with the ${brand} ${model}. Known for its reliability and comfortable keyboard, this laptop is engineered to keep you efficient throughout the workday.`;
    }
  } else if (brand === "Lenovo") {
    if (m.includes("x1 carbon")) {
      short = "Ultralight business laptop with legendary keyboard.";
      full =
        "The ThinkPad X1 Carbon Gen 6 is a masterpiece of engineering. Weighing just under 2.5 lbs, it delivers heavyweight performance with its premium carbon fiber chassis.";
    } else {
      short = `Legendary ${brand} ThinkPad reliability and performance.`;
      full = `The ${brand} ${model} carries the legacy of the ThinkPad series with its robust build quality and exceptional typing experience. Ideal for coding, writing, and heavy office work.`;
    }
  } else if (brand === "Microsoft") {
    short = "Elegant and powerful touchscreen laptop.";
    full = `The Microsoft ${model} combines style and speed. With its vibrant PixelSense touchscreen and all-day battery life, it's perfect for creators and professionals who value aesthetics and performance.`;
  } else {
    short = `Premium used ${brand} laptop with official warranty.`;
    full = `Get the best value with this ${brand} ${model}. Thoroughly tested and refurbished to meet high standards, it comes with our official warranty for your peace of mind.`;
  }

  return { short, full };
};

interface RawProduct {
  id: number;
  sku: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  pricing: {
    sale_price: number;
    market_price: number;
    discount_percentage: number;
  };
  stock: {
    quantity: number;
    status: string;
  };
  specs: {
    processor: string;
    ram: string;
    storage: string;
    display: {
      size: string;
      resolution: string;
    };
    graphics: string;
    weight: string;
  };
  description: {
    short: string;
    full: string;
  };
  features?: string[];
  images?: string[];
  condition?: string;
}

// Map each product
const laptops: Product[] = (productsRaw as unknown as RawProduct[]).map((p) => {
  const folder = getImageFolder(p.model || p.name);
  const description = getDescription(p.model || p.name, p.brand, p.specs);

  // Construct images array if folder exists
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
    slug: slugify(p.name),
    brand: p.brand,
    price: p.pricing.sale_price,
    originalPrice: p.pricing.market_price,
    discount: p.pricing.discount_percentage,
    rating: 4.5 + Math.random() * 0.5, // Simulate rating
    reviews: Math.floor(Math.random() * 500) + 50, // Simulate reviews
    inStock: p.stock.quantity > 0,
    condition: p.condition ? [p.condition] : [],
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
    description: description,
    sku: p.sku,
  };
});

export const laptopData = {
  laptops,
};
