// Image paths are relative to the public directory
const Hp_probook_440_g3_front = "/products/hp/HP_Probook_440_G3/front.png";
const Hp_probook_440_g3 = "/products/hp/HP_Probook_440_G3/main.png";
const Hp_probook_440_g3_port = "/products/hp/HP_Probook_440_G3/port.png";
const Hp_probook_440_g3_side1 = "/products/hp/HP_Probook_440_G3/side01.png"; // Assuming standard naming if file missing
const Hp_probook_440_g3_side2 = "/products/hp/HP_Probook_440_G3/side02.png";
const Hp_probook_440_g3_keyboard =
  "/products/hp/HP_Probook_440_G3/keyboard.png"; // Fallback if missing

const Hp_elitebook_840_g3 = "/products/hp/HP_Elitebook_840_G3/main.png";
const Hp_elitebook_840_g3_front = "/products/hp/HP_Elitebook_840_G3/front.png";
const Hp_elitebook_840_g3_port = "/products/hp/HP_Elitebook_840_G3/port.png";
const Hp_elitebook_840_g3_side1 = "/products/hp/HP_Elitebook_840_G3/side01.png";
const Hp_elitebook_840_g3_side2 = "/products/hp/HP_Elitebook_840_G3/side02.png";
const Hp_elitebook_840_g3_keyboard =
  "/products/hp/HP_Elitebook_840_G3/keyboard.png";

// Assuming similar casing for others, updating to lowercase as seen in explorer
const Hp_elitebook_840_g6 = "/products/hp/HP_Elitebook_840_G6/main.png";
const Hp_elitebook_840_g6_front = "/products/hp/HP_Elitebook_840_G6/front.png";
const Hp_elitebook_840_g6_port = "/products/hp/HP_Elitebook_840_G6/port.png";
const Hp_elitebook_840_g6_side1 = "/products/hp/HP_Elitebook_840_G6/side01.png";
const Hp_elitebook_840_g6_side2 = "/products/hp/HP_Elitebook_840_G6/side02.png";
const Hp_elitebook_840_g6_keyboard =
  "/products/hp/HP_Elitebook_840_G6/keyboard.png";

const Hp_elitebook_840_g7 = "/products/hp/HP_Elitebook_840_G7/main.png";
const Hp_elitebook_840_g7_front = "/products/hp/HP_Elitebook_840_G7/front.png";
const Hp_elitebook_840_g7_port = "/products/hp/HP_Elitebook_840_G7/port.png";
const Hp_elitebook_840_g7_side1 = "/products/hp/HP_Elitebook_840_G7/side01.png";
const Hp_elitebook_840_g7_side2 = "/products/hp/HP_Elitebook_840_G7/side02.png";

// Placeholder for missing Zbook images if directory empty
const Hp_zbook_14u_g6 = "/products/hp/HP_Zbook_14U_G6/main.png";
const Hp_zbook_14u_g6_front = "/products/hp/HP_Zbook_14U_G6/front.png";
const Hp_zbook_14u_g6_port = "/products/hp/HP_Zbook_14U_G6/port.png";
const Hp_zbook_14u_g6_side1 = "/products/hp/HP_Zbook_14U_G6/side01.png";
const Hp_zbook_14u_g6_side2 = "/products/hp/HP_Zbook_14U_G6/side02.png";

export const laptopData = {
  laptops: [
    {
      id: "LP001",
      name: "HP ProBook 440 G3 (V3E80PA) Laptop",
      brand: "HP",
      price: 19990,
      originalPrice: 21700,
      discount: 13,
      rating: 4.8,
      reviews: 342,
      inStock: true,
      condition: ["New", "Used"],
      color: ["Black", "Silver", "Gold"],
      image: Hp_probook_440_g3,
      images: [
        Hp_probook_440_g3,
        Hp_probook_440_g3_side1,
        Hp_probook_440_g3_side2,
        Hp_probook_440_g3_front,
        Hp_probook_440_g3_port,
        Hp_probook_440_g3_keyboard,
      ],
      specs: {
        processor: "Intel Core i5 (6th Gen)-6200U",
        cpu_speed: "2.3GHz",
        ram: "8GB",
        storage: "256GB SSD",
        display: '14.1" HD SVA Antiglare Flat LED',
        graphics: "Integrated GPU",
        battery: "Up to 22 hours",
      },
      features: [
        "DTS Studio Sound",
        "Multi Card Slot:- 5-in-1 Card Reader",
        "Starting at 1.68 kg",
        "Window 10 Professional",
      ],
      category: "Professional",
    },
    {
      id: "LP002",
      name: 'HP EliteBook 840 G3 14" Anti-Glare FHD Full HD',
      brand: "HP",
      price: 21700,
      originalPrice: 28000,
      discount: 7,
      rating: 4.7,
      reviews: 285,
      inStock: true,
      condition: ["New", "Used"],
      color: ["Black", "Silver"],
      image: Hp_elitebook_840_g3,
      images: [
        Hp_elitebook_840_g3,
        Hp_elitebook_840_g3_side1,
        Hp_elitebook_840_g3_side2,
        Hp_elitebook_840_g3_front,
        Hp_elitebook_840_g3_port,
        Hp_elitebook_840_g3_keyboard,
      ],
      specs: {
        processor: "Intel Core i5 (6th Gen)",
        cpu_speed: "2.4GHz",
        ram: "8GB",
        storage: "256GB SSD",
        display: '14" FHD LED',
        graphics: "Intel HD Graphics 520",
        battery: "Up to 10 hours",
      },
      features: [
        "Business-grade durability",
        "Enhanced security features",
        "Long battery life",
        "Premium design",
      ],
      category: "Business",
    },
    {
      id: "LP003",
      name: "HP Elitebook 840 G6 Core i5 8TH Gen 8/256",
      brand: "HP",
      price: 42990,
      originalPrice: 47000,
      discount: 9,
      rating: 4.8,
      reviews: 412,
      inStock: true,
      condition: ["New", "Used"],
      color: ["Silver"],
      image: Hp_elitebook_840_g6,
      images: [
        Hp_elitebook_840_g6,
        Hp_elitebook_840_g6_side1,
        Hp_elitebook_840_g6_side2,
        Hp_elitebook_840_g6_front,
        Hp_elitebook_840_g6_port,
        Hp_elitebook_840_g6_keyboard,
      ],
      specs: {
        processor: "Intel Core i5 (8th Gen)",
        cpu_speed: "1.8GHz",
        ram: "8GB",
        storage: "256GB SSD",
        display: '14" FHD IPS',
        graphics: "Intel UHD Graphics 620",
        battery: "Up to 14 hours",
      },
      features: [
        "Sure View privacy screen",
        "Thunderbolt 3",
        "IR camera with facial recognition",
        "MIL-STD-810G tested",
      ],
      category: "Business",
    },
    {
      id: "LP004",
      name: "HP Zbook 14U G6 Core i5 8TH Gen 8/256",
      brand: "HP",
      price: 58990,
      originalPrice: 65000,
      discount: 9,
      rating: 4.6,
      reviews: 198,
      inStock: true,
      condition: ["New"],
      color: ["Black"],
      image: Hp_zbook_14u_g6, // Ensure this exists or fallback
      images: [
        Hp_zbook_14u_g6,
        Hp_zbook_14u_g6,
        Hp_zbook_14u_g6,
        Hp_zbook_14u_g6,
      ],
      specs: {
        processor: "Intel Core i7 (8th Gen)",
        cpu_speed: "1.8GHz",
        ram: "16GB",
        storage: "512GB SSD",
        display: '14" FHD IPS',
        graphics: "AMD Radeon Pro WX 3200",
        battery: "Up to 12 hours",
      },
      features: [
        "Workstation-class graphics",
        "ISV certified applications",
        "Military-grade durability",
        "Professional color accuracy",
      ],
      category: "Professional",
    },
    {
      id: "LP005",
      name: "HP Elitebook 840 G7",
      brand: "HP",
      price: 62990,
      originalPrice: 69000,
      discount: 9,
      rating: 4.9,
      reviews: 524,
      inStock: true,
      condition: ["New", "Refurbished"],
      color: ["Silver"],
      image: Hp_elitebook_840_g7,
      images: [
        Hp_elitebook_840_g7,
        Hp_elitebook_840_g7,
        Hp_elitebook_840_g7,
        Hp_elitebook_840_g7,
      ],
      specs: {
        processor: "Intel Core i7 (10th Gen)",
        cpu_speed: "1.8GHz",
        ram: "16GB",
        storage: "512GB SSD",
        display: '14" FHD IPS',
        graphics: "Intel UHD Graphics",
        battery: "Up to 16 hours",
      },
      features: [
        "5G/4G LTE option",
        "Sure View Reflect privacy screen",
        "Premium audio by Bang & Olufsen",
        "AI-based noise cancellation",
      ],
      category: "Business",
    },
    {
      id: "LP006",
      name: "Dell XPS 15 9530",
      brand: "Dell",
      price: 1899.0,
      originalPrice: 2299.0,
      discount: 17,
      rating: 4.6,
      reviews: 528,
      inStock: true,
      condition: ["New", "Used"],
      image: Hp_elitebook_840_g7, // Placeholder using existing import
      images: [Hp_elitebook_840_g7],
      specs: {
        processor: "Intel Core i7-13700H",
        ram: "16GB",
        storage: "512GB SSD",
        display: '15.6" FHD+ InfinityEdge',
        graphics: "NVIDIA RTX 4050",
        battery: "Up to 13 hours",
        weight: "4.23 lbs",
      },
      features: [
        "Fingerprint Reader",
        "Backlit Keyboard",
        "Thunderbolt 4",
        "Wi-Fi 6E",
      ],
      category: "Professional",
    },
    {
      id: "LP007",
      name: "ASUS ROG Strix G16",
      brand: "ASUS",
      price: 1649.0,
      originalPrice: 1899.0,
      discount: 13,
      rating: 4.7,
      reviews: 412,
      inStock: true,
      image: Hp_elitebook_840_g7, // Placeholder
      images: [Hp_elitebook_840_g7],
      specs: {
        processor: "Intel Core i9-13980HX",
        ram: "16GB",
        storage: "1TB SSD",
        display: '16" FHD+ 165Hz',
        graphics: "NVIDIA RTX 4060",
        battery: "Up to 8 hours",
        weight: "5.51 lbs",
      },
      features: [
        "RGB Keyboard",
        "MUX Switch",
        "Dolby Atmos",
        "Advanced Cooling",
      ],
      category: "Gaming",
    },
    {
      id: "LP008",
      name: "Lenovo ThinkPad X1 Carbon Gen 11",
      brand: "Lenovo",
      price: 1599.0,
      originalPrice: 1999.0,
      discount: 20,
      rating: 4.7,
      reviews: 635,
      inStock: true,
      condition: ["New", "Used"],
      image: Hp_elitebook_840_g7, // Placeholder
      images: [Hp_elitebook_840_g7],
      specs: {
        processor: "Intel Core i7-1355U",
        ram: "16GB",
        storage: "512GB SSD",
        display: '14" WUXGA IPS',
        graphics: "Intel Iris Xe",
        battery: "Up to 16 hours",
        weight: "2.48 lbs",
      },
      features: [
        "Fingerprint Reader",
        "Backlit Keyboard",
        "MIL-STD-810H",
        "Privacy Shutter",
      ],
      category: "Business",
    },
    {
      id: "LP009",
      name: "HP Pavilion 15",
      brand: "HP",
      price: 679.0,
      originalPrice: 849.0,
      discount: 20,
      rating: 4.3,
      reviews: 892,
      inStock: true,
      condition: ["New", "Used"],
      image: Hp_probook_440_g3, // Reusing existing image
      images: [Hp_probook_440_g3],
      specs: {
        processor: "AMD Ryzen 5 7530U",
        ram: "8GB",
        storage: "512GB SSD",
        display: '15.6" FHD IPS',
        graphics: "AMD Radeon",
        battery: "Up to 9 hours",
        weight: "3.86 lbs",
      },
      features: ["HD Webcam", "Dual Speakers", "Fast Charge", "Wi-Fi 6"],
      category: "Budget",
    },
    {
      id: "LP010",
      name: "Acer Aspire 5",
      brand: "Acer",
      price: 549.0,
      originalPrice: 699.0,
      discount: 21,
      rating: 4.2,
      reviews: 1024,
      inStock: true,
      condition: ["New", "Used"],
      image: Hp_elitebook_840_g7, // Placeholder
      images: [Hp_elitebook_840_g7],
      specs: {
        processor: "Intel Core i5-1235U",
        ram: "8GB",
        storage: "256GB SSD",
        display: '15.6" FHD IPS',
        graphics: "Intel Iris Xe",
        battery: "Up to 8 hours",
        weight: "3.88 lbs",
      },
      features: ["Backlit Keyboard", "HD Webcam", "USB-C", "Wi-Fi 6"],
      category: "Budget",
    },
  ],
};
