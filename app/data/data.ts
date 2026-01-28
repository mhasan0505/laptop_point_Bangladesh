import { Product } from "@/types/product";
import { RawProduct } from "@/types/raw-product";
import productsRaw from "./products.json";

// Helper to encode image paths with proper URL encoding
// Converts spaces and special characters to URL-safe format
// Only encode the folder names, not the slashes
const encodeImagePath = (path: string): string => {
  // Split the path and encode each segment except empty ones
  return path
    .split("/")
    .map((segment) => (segment ? encodeURIComponent(segment) : segment))
    .join("/");
};

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
  if (m.includes("firefly 14 g9"))
    return "/products/hp/HP Zbook Firefly 14 G9 Core i7 12TH Gen 16";

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
    return "/products/lenovo/Lenovo_Thinkpad_X1_Carbon_i5_10TH_Gen_16512_Touchscreen";
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
  if (m.includes("surface book"))
    return "/products/microsoft/Microsoft_Surface_laptop_4";

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

// Map each product
const laptops: Product[] = (productsRaw as RawProduct[]).map((p) => {
  // Use p.name preferably as it contains more detail (e.g. i5 vs i7 for Surface)
  const folder = getImageFolder(p.name || p.model);
  const description = p.description;

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
      } else if (folder.includes("Firefly 14 G9")) {
        mappedImages = [
          `${folder}/512/main.png`,
          `${folder}/512/front.png`,
          `${folder}/512/front1.png`,
          `${folder}/512/side.png`,
          `${folder}/512/port.png`,
          `${folder}/512/port2.png`,
          `${folder}/512/keyboard.png`,
        ];
        mainImage = `${folder}/512/main.png`;
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
      } else if (
        folder.includes(
          "Lenovo_Thinkpad_X1_Carbon_i5_10TH_Gen_16512_Touchscreen",
        )
      ) {
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
    image: encodeImagePath(mainImage),
    images: mappedImages.map(encodeImagePath),
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

// Debug: Check that slugs are created
if (laptops.length > 0) {
  console.log("✓ First product slug:", laptops[0].slug);
  console.log("✓ First product name:", laptops[0].name);
  console.log("✓ First product id:", laptops[0].id);
}

export const laptopData = {
  laptops,
};
