// ─── Accessories Data & Category Metadata ──────────────────────────────────────
export interface AccessoryCategoryMeta {
  slug: "power-docks" | "keyboards" | "mice" | "monitors" | "bags-sleeves";
  name: string;
  tagline: string;
  icon: string;
  accent: string;
  accentSoft: string;
}

export interface AccessoryItem {
  id: string;
  name: string;
  categorySlug: "power-docks" | "keyboards" | "mice" | "monitors" | "bags-sleeves";
  categoryName: string;
  compatibility: string[];
  color: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  specs: string[]; // e.g. ["40Gbps", "Dual 4K", "100W PD"]
  image: string;
}

export const ACCESSORY_CATEGORIES: AccessoryCategoryMeta[] = [
  {
    slug: "power-docks",
    name: "Power & Docks",
    tagline: "Thunderbolt & High-Wattage GaN",
    icon: "/icons/accessories.png",
    accent: "#0B79BE",
    accentSoft: "rgba(11, 121, 190, 0.08)",
  },
  {
    slug: "keyboards",
    name: "Keyboards & Typing",
    tagline: "Mechanical & Low-Profile Wireless",
    icon: "/icons/computer-accessories.png",
    accent: "#58BA46",
    accentSoft: "rgba(88, 186, 70, 0.08)",
  },
  {
    slug: "mice",
    name: "Precision Mice",
    tagline: "Ergonomic & Ultra-Light Wireless",
    icon: "/icons/mouse.png",
    accent: "#8E24AA",
    accentSoft: "rgba(142, 36, 170, 0.08)",
  },
  {
    slug: "monitors",
    name: "Monitors & Displays",
    tagline: "Calibrated 4K / 5K Reference Screens",
    icon: "/icons/monitor.png",
    accent: "#E65100",
    accentSoft: "rgba(230, 81, 0, 0.08)",
  },
  {
    slug: "bags-sleeves",
    name: "Bags & Sleeves",
    tagline: "Full-Grain Leather & Ballistic Nylon",
    icon: "/icons/accessories.png",
    accent: "#37474F",
    accentSoft: "rgba(55, 71, 79, 0.08)",
  },
];

export const ACCESSORY_ITEMS: AccessoryItem[] = [
  // ── Power & Docks ──
  {
    id: "tb4-dock-pro",
    name: "Thunderbolt 4 Pro Universal Dock",
    categorySlug: "power-docks",
    categoryName: "Power & Docks",
    compatibility: ["Dell", "HP", "ThinkPad", "Surface", "MacBook"],
    color: "Space Gray",
    price: 32000,
    originalPrice: 36000,
    badge: "Thunderbolt 4",
    specs: ["40Gbps Speed", "Dual 4K / 8K", "100W Power Delivery", "12-in-1 Hub"],
    image: "/icons/accessories.png",
  },
  {
    id: "compact-gan-100w",
    name: "100W 4-Port GaN Fast Charger",
    categorySlug: "power-docks",
    categoryName: "Power & Docks",
    compatibility: ["All USB-C Laptops", "Smartphones", "Tablets"],
    color: "Matte Black",
    price: 8500,
    badge: "Bestseller",
    specs: ["100W Max PD", "Gallium Nitride", "3x USB-C + 1x USB-A", "Foldable Plug"],
    image: "/icons/accessories.png",
  },
  {
    id: "65w-slim-travel-adapter",
    name: "65W Ultra-Slim USB-C Power Adapter",
    categorySlug: "power-docks",
    categoryName: "Power & Docks",
    compatibility: ["Dell Latitude", "HP EliteBook", "ThinkPad X1"],
    color: "Midnight Black",
    price: 4500,
    specs: ["65W Fast Charge", "Braided 2m Cable", "Overvoltage Protection"],
    image: "/icons/accessories.png",
  },
  {
    id: "magsafe-magnetic-hub",
    name: "Magnetic 7-in-1 Dual-Port Hub",
    categorySlug: "power-docks",
    categoryName: "Power & Docks",
    compatibility: ["Ultrabooks", "MacBook Air", "Surface Pro"],
    color: "Silver",
    price: 11000,
    badge: "New",
    specs: ["4K@60Hz HDMI", "10Gbps USB-C", "SD / MicroSD", "Aluminum Shell"],
    image: "/icons/accessories.png",
  },

  // ── Keyboards & Typing ──
  {
    id: "mech-keyboard-pro",
    name: "Pro Wireless Mechanical Keyboard",
    categorySlug: "keyboards",
    categoryName: "Keyboards & Typing",
    compatibility: ["Windows", "macOS", "Linux"],
    color: "Space Gray",
    price: 18500,
    originalPrice: 21000,
    badge: "Hot-Swappable",
    specs: ["Custom Gateron Switches", "Tri-Mode Wireless", "PBT Keycaps", "RGB Backlight"],
    image: "/icons/computer-accessories.png",
  },
  {
    id: "slim-wireless-keyboard",
    name: "Ultra-Slim Bluetooth Keyboard",
    categorySlug: "keyboards",
    categoryName: "Keyboards & Typing",
    compatibility: ["Windows 11", "macOS", "iPadOS"],
    color: "Silver",
    price: 9000,
    specs: ["Scissor Switch", "3-Device Fast Switch", "1 Month Battery", "Ergonomic Tilt"],
    image: "/icons/computer-accessories.png",
  },
  {
    id: "tenkeyless-creator-board",
    name: "Creator Edition TKL Keyboard",
    categorySlug: "keyboards",
    categoryName: "Keyboards & Typing",
    compatibility: ["Windows", "macOS"],
    color: "Matte Black",
    price: 14500,
    badge: "Creator Choice",
    specs: ["Programmable Rotary Dial", "Sound-Dampened Foam", "Detachable Type-C"],
    image: "/icons/computer-accessories.png",
  },

  // ── Precision Mice ──
  {
    id: "ergo-mouse-pro",
    name: "Ergonomic Precision Master Mouse",
    categorySlug: "mice",
    categoryName: "Precision Mice",
    compatibility: ["Windows", "macOS", "Linux"],
    color: "Matte Black",
    price: 12500,
    originalPrice: 15000,
    badge: "Top Rated",
    specs: ["4000 DPI MagSpeed", "Silent Click", "Thumb Wheel", "USB-C Rechargeable"],
    image: "/icons/mouse.png",
  },
  {
    id: "travel-mouse-mini",
    name: "Pocket Wireless Travel Mouse",
    categorySlug: "mice",
    categoryName: "Precision Mice",
    compatibility: ["All Laptops", "Tablets"],
    color: "Space Gray",
    price: 5500,
    specs: ["Ambidextrous Design", "Bluetooth 5.2 + 2.4G", "12-Month Battery Life"],
    image: "/icons/mouse.png",
  },
  {
    id: "vertical-ergonomic-mouse",
    name: "Natural Vertical Ergonomic Mouse",
    categorySlug: "mice",
    categoryName: "Precision Mice",
    compatibility: ["Windows", "macOS"],
    color: "Graphite",
    price: 9800,
    badge: "Posture Care",
    specs: ["57° Natural Angle", "Reduced Wrist Strain", "Smooth Optical Sensor"],
    image: "/icons/mouse.png",
  },

  // ── Monitors & Displays ──
  {
    id: "pro-reference-monitor-27",
    name: "27\" 4K Pro Color Reference Monitor",
    categorySlug: "monitors",
    categoryName: "Monitors & Displays",
    compatibility: ["Workstations", "Pro Laptops"],
    color: "Matte Black",
    price: 68000,
    originalPrice: 75000,
    badge: "100% sRGB",
    specs: ["4K UHD (3840×2160)", "IPS 400 nits", "USB-C 90W Hub", "Hardware Calibrated"],
    image: "/icons/monitor.png",
  },
  {
    id: "portable-oled-monitor-15",
    name: "15.6\" Portable OLED Display",
    categorySlug: "monitors",
    categoryName: "Monitors & Displays",
    compatibility: ["All Laptops", "Smartphones"],
    color: "Anodized Aluminum",
    price: 34000,
    badge: "OLED",
    specs: ["1080p OLED Touch", "100% DCI-P3", "Ultralight 680g", "Single Cable USB-C"],
    image: "/icons/monitor.png",
  },
  {
    id: "ultrawide-curved-34",
    name: "34\" Curved Ultrawide Productivity Display",
    categorySlug: "monitors",
    categoryName: "Monitors & Displays",
    compatibility: ["Workstations", "Pro Laptops"],
    color: "Dark Chrome",
    price: 89000,
    specs: ["WQHD (3440×1440)", "1800R Curvature", "Built-in KVM Switch", "HDR 400"],
    image: "/icons/monitor.png",
  },

  // ── Bags & Sleeves ──
  {
    id: "leather-sleeve-14",
    name: "14\" Full-Grain Leather Executive Sleeve",
    categorySlug: "bags-sleeves",
    categoryName: "Bags & Sleeves",
    compatibility: ["13\"-14\" Ultrabooks", "XPS 13", "ThinkPad X1", "Surface Laptop"],
    color: "Classic Brown",
    price: 14000,
    badge: "Handcrafted",
    specs: ["Tuscan Full-Grain Leather", "Wool Felt Lining", "Magnetic Quiet Clasp"],
    image: "/icons/accessories.png",
  },
  {
    id: "tech-briefcase-pro",
    name: "Weatherproof Tech Briefcase Pro",
    categorySlug: "bags-sleeves",
    categoryName: "Bags & Sleeves",
    compatibility: ["Up to 16\" Laptops & Workstations"],
    color: "Matte Black",
    price: 22000,
    originalPrice: 25000,
    badge: "Armor-Shield",
    specs: ["Cordura® Ballistic Nylon", "YKK AquaGuard® Zips", "Dedicated Tablet Sleeve"],
    image: "/icons/accessories.png",
  },
  {
    id: "commuter-backpack-slim",
    name: "Urban Commuter Minimalist Backpack",
    categorySlug: "bags-sleeves",
    categoryName: "Bags & Sleeves",
    compatibility: ["13\" to 15.6\" Laptops"],
    color: "Heather Charcoal",
    price: 16500,
    specs: ["Ergonomic Air-Mesh", "Hidden Passport Pocket", "Luggage Pass-Through"],
    image: "/icons/accessories.png",
  },
];
