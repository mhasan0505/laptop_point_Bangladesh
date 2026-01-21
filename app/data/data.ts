import { Product } from "@/types/product";
import productsRaw from "./products.json";

// Helper to map product ID/SKU/Model to image folder path
const getImageFolder = (model: string): string | null => {
  const m = model.toLowerCase();

  // HP
  if (m.includes("440 g3"))
    return "/products/hp/HP Probook 440 G3 Core i5 6TH Gen 8-256";
  if (m.includes("840 g3"))
    return "/products/hp/HP Elitebook 840 G3 Core i5 6TH Gen 8-256";
  if (m.includes("840 g6"))
    return "/products/hp/HP Elitebook 840 G6 Core i5 8TH Gen 8-256";
  if (m.includes("zbook 14u g6"))
    return "/products/hp/HP Zbook 14U G6 Core i5 8TH Gen 8-256";
  if (m.includes("840 g7"))
    return "/products/hp/HP Elitebook 840 G7 Core i5 10TH Gen 16-512";
  if (m.includes("840 g8"))
    return "/products/hp/HP Elitebook 840 G8 Core i5 11TH Gen 16-512";
  if (m.includes("845 g7"))
    return "/products/hp/HP Elitebook 845 G7 Ryzen 5 Pro 16-512";
  if (m.includes("845 g8"))
    return "/products/hp/HP Elitebook 845 G8 Ryzen 5 pro 16-512";
  if (m.includes("1040 g8") || m.includes("x360 1040"))
    return "/products/hp/HP Elitebook X360 1040 G8 Core I7 11TH Gen 16-512";
  if (m.includes("firefly 14 g9")) return null; // Uses placeholder or generic

  // Dell
  if (m.includes("3190"))
    return "/products/dell/Dell_latitude 3190 2-1 Pentium Silver 8-128";
  if (m.includes("3310"))
    return "/products/dell/Dell latitude 3310 Core i5 8TH Gen 8-256";
  if (m.includes("3410"))
    return "/products/dell/Dell latitude 3410 Core i5 10TH Gen 16-512";
  if (m.includes("7490"))
    return "/products/dell/Dell latitude 7490 Core i5 8TH Gen 8-256";
  if (m.includes("7400"))
    return "/products/dell/Dell latitude 7400 Core i5 8TH gen 16256 Metal body";
  if (m.includes("7420"))
    return "/products/dell/Dell latitude 7420 2-1 Core i5 11TH Gen 16512";

  // Lenovo
  if (m.includes("t490"))
    return "/products/lenovo/Lenovo_Thinkpad_T490_code_i5";
  if (m.includes("t14") && !m.includes("t490"))
    return "/products/lenovo/Lenovo_Thinkpad_T14";
  // X1 Carbon - distinguish between Gen 8 (i5/10th) and Gen 9 (i7/11th)
  if (
    m.includes("x1 carbon gen 8") ||
    (m.includes("x1 carbon") && m.includes("i5"))
  )
    return "/products/lenovo/19. Lenovo Thinkpad X1 Carbon i5 10TH Gen 16512 Touchscreen";
  if (
    m.includes("x1 carbon gen 9") ||
    (m.includes("x1 carbon") && m.includes("i7"))
  )
    return "/products/lenovo/Lenovo_Thinkpad_X1_core_i7";
  // Fallback for generic X1 Carbon
  if (m.includes("x1 carbon") || m.includes("x1c"))
    return "/products/lenovo/Lenovo_Thinkpad_X1_core_i7";

  // Microsoft
  if (m.includes("surface laptop 3") && m.includes("i5"))
    return "/products/microsoft/Microsoft_Surface_laptop_3_code_i5";
  if (m.includes("surface laptop 3") && m.includes("i7"))
    return "/products/microsoft/Microsoft_Surface_laptop_3_code_i7";
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
  specs: RawProduct["specs"],
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
    } else if (m.includes("firefly")) {
      short = "Professional mobile workstation for power users.";
      full =
        "The HP ZBook Firefly 14 G9 is a true mobile powerhouse. With pro-level performance and a color-accurate display, it's perfect for designers, architects, and power users who need workstation capabilities on the go.";
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
  // Use p.name preferably as it contains more detail (e.g. i5 vs i7 for Surface)
  const folder = getImageFolder(p.name || p.model);
  const description = getDescription(p.model || p.name, p.brand, p.specs);

  let mappedImages: string[] = p.images || [];
  let mainImage = mappedImages[0] || "/placeholder.png";

  if (folder) {
    // Check if it's one of the new Laptop Point BD folders which use .jpg
    const isNewStructure = folder.includes("Laptop Point BD");
    const isHP = folder.includes("products/hp");
    const isMicrosoft = folder.includes("products/microsoft");
    const isDell = folder.includes("products/dell");
    const isLenovo = folder.includes("products/lenovo");

    if (isNewStructure) {
      mappedImages = [
        `${folder}/main.jpg`,
        `${folder}/front.jpg`,
        `${folder}/back.jpg`,
        `${folder}/side.jpg`,
        // Include keyborad.jpg if exists, handling typo or standard
        `${folder}/keyboard.jpg`,
      ];
      mainImage = `${folder}/main.jpg`;
    } else if (isHP) {
      // HP products use .jpg format with varying image files
      mainImage = `${folder}/main.jpg`;

      // HP product mappings based on actual folder contents
      if (folder.includes("440 G3")) {
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/front.jpg`,
          `${folder}/back.jpg`,
          `${folder}/keyborad.jpg`,
        ];
      } else if (folder.includes("840 G3")) {
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/side.jpg`,
          `${folder}/side1.jpg`,
          `${folder}/back.jpg`,
        ];
      } else if (folder.includes("840 G6")) {
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/back.jpg`,
          `${folder}/side.jpg`,
          `${folder}/side1.jpg`,
          `${folder}/port.jpg`,
          `${folder}/port2.jpg`,
        ];
      } else if (folder.includes("840 G7")) {
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/front.jpg`,
          `${folder}/back.jpg`,
          `${folder}/side.jpg`,
          `${folder}/side1.jpg`,
        ];
      } else if (folder.includes("840 G8") && folder.includes("I7")) {
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/front.jpg`,
          `${folder}/back.jpg`,
          `${folder}/side.jpg`,
        ];
      } else if (folder.includes("840 G8")) {
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/front.jpg`,
          `${folder}/back.jpg`,
          `${folder}/side.jpg`,
        ];
      } else if (folder.includes("845 G7")) {
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/front.jpg`,
          `${folder}/back.jpg`,
          `${folder}/side.jpg`,
        ];
      } else if (folder.includes("845 G8")) {
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/front.jpg`,
          `${folder}/back.jpg`,
          `${folder}/side.jpg`,
        ];
      } else if (folder.includes("X360 1040")) {
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/front1.jpg`,
          `${folder}/front2.jpg`,
          `${folder}/back.jpg`,
          `${folder}/side.jpg`,
          `${folder}/side1.jpg`,
          `${folder}/port.jpg`,
        ];
      } else if (folder.includes("14U G6")) {
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/back.jpg`,
          `${folder}/port.jpg`,
          `${folder}/side.jpg`,
          `${folder}/side1.jpg`,
        ];
      } else {
        // Fallback for other HP products
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/front.jpg`,
          `${folder}/back.jpg`,
          `${folder}/side.jpg`,
        ];
      }
    } else if (isDell || isLenovo) {
      // Dell and Lenovo products use .jpg format, but each has different files
      // Map product-specific images based on actual folder contents
      mainImage = `${folder}/main.jpg`;

      // Dell product mappings
      if (folder.includes("Dell_latitude 3190")) {
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/image.jpg`,
          `${folder}/image2.jpg`,
          `${folder}/image3.jpg`,
        ];
      } else if (folder.includes("Dell latitude 3310")) {
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/front.jpg`,
          `${folder}/back.jpg`,
          `${folder}/back2.jpg`,
          `${folder}/side.jpg`,
          `${folder}/flip.jpg`,
          `${folder}/flip2.jpg`,
        ];
      } else if (folder.includes("Dell latitude 3410")) {
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/front.jpg`,
          `${folder}/fullSize.jpg`,
          `${folder}/dual.jpg`,
          `${folder}/rotate.jpg`,
        ];
      } else if (folder.includes("Dell latitude 7490")) {
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/side.jpg`,
          `${folder}/port.jpg`,
          `${folder}/cables.jpg`,
        ];
      } else if (folder.includes("Dell latitude 7400")) {
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/front.jpg`,
          `${folder}/back.jpg`,
          `${folder}/back2.jpg`,
          `${folder}/port.jpg`,
          `${folder}/side (1).jpg`,
          `${folder}/side (2).jpg`,
          `${folder}/side3.jpg`,
        ];
      } else if (folder.includes("Dell latitude 7420")) {
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/port.jpg`,
          `${folder}/side (1).jpg`,
          `${folder}/side (2).jpg`,
          `${folder}/side (3).jpg`,
          `${folder}/side (4).jpg`,
          `${folder}/side (5).jpg`,
        ];
      }
      // Lenovo product mappings
      else if (folder.includes("Lenovo_Thinkpad_T490_code_i5")) {
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/front.jpg`,
          `${folder}/back.jpg`,
          `${folder}/fullSize.jpg`,
          `${folder}/side1.jpg`,
          `${folder}/side2.jpg`,
          `${folder}/port.jpg`,
          `${folder}/port2.jpg`,
          `${folder}/port3.jpg`,
        ];
      } else if (folder.includes("Lenovo_Thinkpad_T14")) {
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/front.jpg`,
          `${folder}/fullSize.jpg`,
          `${folder}/side.jpg`,
          `${folder}/side1.jpg`,
          `${folder}/side2.jpg`,
        ];
      } else if (folder.includes("19. Lenovo Thinkpad X1 Carbon")) {
        // X1 Carbon Gen 8 (i5)
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/front.jpg`,
          `${folder}/back.jpg`,
          `${folder}/close.jpg`,
          `${folder}/image.jpg`,
          `${folder}/image1.jpg`,
          `${folder}/imageg.jpg`,
          `${folder}/keyborad.jpg`,
          `${folder}/keyborad1.jpg`,
        ];
      } else if (folder.includes("Lenovo_Thinkpad_X1_core_i7")) {
        // X1 Carbon Gen 9 (i7) - same files as Gen 8
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/front.jpg`,
          `${folder}/back.jpg`,
          `${folder}/close.jpg`,
          `${folder}/image.jpg`,
          `${folder}/image1.jpg`,
          `${folder}/imageg.jpg`,
          `${folder}/keyborad.jpg`,
          `${folder}/keyborad1.jpg`,
        ];
      } else {
        // Fallback for any other Dell/Lenovo products
        mappedImages = [
          `${folder}/main.jpg`,
          `${folder}/front.jpg`,
          `${folder}/back.jpg`,
          `${folder}/side.jpg`,
        ];
      }
    } else if (isMicrosoft) {
      if (folder.includes("Microsoft_Surface_laptop_4")) {
        mappedImages = [
          `${folder}/main.png`,
          `${folder}/front.png`,
          `${folder}/front2.png`,
          `${folder}/side.png`,
          `${folder}/side2.png`,
          `${folder}/back.png`,
        ];
      } else {
        mappedImages = [
          `${folder}/main.png`,
          `${folder}/front.png`,
          `${folder}/side.png`,
          `${folder}/port.png`,
          `${folder}/back.png`,
          `${folder}/keyborad.png`, // Note: typo in filename on disk
        ];
      }
      mainImage = `${folder}/main.png`;
    } else {
      mappedImages = [
        `${folder}/main.png`,
        `${folder}/front.png`,
        `${folder}/port.png`,
        `${folder}/side01.png`,
        `${folder}/side02.png`,
        `${folder}/keyboard.png`,
      ];
      mainImage = `${folder}/main.png`;
    }
  }

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
