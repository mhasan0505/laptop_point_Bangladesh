export type AccessoryCategory =
  | "Power & Docks"
  | "Keyboards"
  | "Mice"
  | "Bags & Sleeves"
  | "Monitors";

export type Accessory = {
  id: string;
  name: string;
  category: AccessoryCategory;
  compatibility: string[];
  color: string;
  price: number;
  badge?: string;
  specs: string; // A short line of technical specs (e.g., "40Gbps · Dual 4K Display Support")
  image: string; // Placeholder for now
};

export const accessories: Accessory[] = [
  // Power & Docks
  {
    id: "tb4-dock-pro",
    name: "Thunderbolt 4 Pro Dock",
    category: "Power & Docks",
    compatibility: ["Pro Laptops", "Workstations"],
    color: "Space Gray",
    price: 32000,
    badge: "Thunderbolt 4 Certified",
    specs: "40Gbps · Dual 4K Display Support · 100W PD",
    image: "/placeholder-accessory.png",
  },
  {
    id: "compact-gan-100w",
    name: "100W GaN Travel Charger",
    category: "Power & Docks",
    compatibility: ["Air Laptops", "Pro Laptops"],
    color: "Matte Black",
    price: 8500,
    badge: "Bestseller",
    specs: "100W Power Delivery · Ultra-compact · 3 Ports",
    image: "/placeholder-accessory.png",
  },

  // Keyboards
  {
    id: "mech-keyboard-pro",
    name: "Pro Mechanical Keyboard",
    category: "Keyboards",
    compatibility: ["Pro Laptops", "Workstations"],
    color: "Space Gray",
    price: 18500,
    badge: "New Release",
    specs: "Hot-swappable · Bluetooth 5.2 · PBT Keycaps",
    image: "/placeholder-accessory.png",
  },
  {
    id: "slim-wireless-keyboard",
    name: "Slim Wireless Keyboard",
    category: "Keyboards",
    compatibility: ["Air Laptops", "Pro Laptops"],
    color: "Silver",
    price: 9000,
    specs: "Low-profile · Multi-device Sync · 1 Month Battery",
    image: "/placeholder-accessory.png",
  },

  // Mice
  {
    id: "ergo-mouse-pro",
    name: "Ergonomic Precision Mouse",
    category: "Mice",
    compatibility: ["Pro Laptops", "Workstations"],
    color: "Matte Black",
    price: 12500,
    badge: "Staff Pick",
    specs: "4000 DPI MagSpeed · Silent Scroll · Type-C",
    image: "/placeholder-accessory.png",
  },
  {
    id: "travel-mouse-mini",
    name: "Travel Mouse Mini",
    category: "Mice",
    compatibility: ["Air Laptops", "Pro Laptops"],
    color: "Space Gray",
    price: 5500,
    specs: "Ambidextrous · Bluetooth 5.0 · 12-Month Battery",
    image: "/placeholder-accessory.png",
  },

  // Monitors
  {
    id: "pro-reference-monitor-27",
    name: "27\" Pro Reference Monitor",
    category: "Monitors",
    compatibility: ["Pro Laptops", "Workstations"],
    color: "Matte Black",
    price: 115000,
    badge: "Color Calibrated",
    specs: "5K Resolution · Nano-IPS · 99% DCI-P3",
    image: "/placeholder-accessory.png",
  },

  // Bags & Sleeves
  {
    id: "leather-sleeve-14",
    name: "14\" Full-Grain Leather Sleeve",
    category: "Bags & Sleeves",
    compatibility: ["Air Laptops", "Pro Laptops"],
    color: "Classic Brown",
    price: 14000,
    badge: "Handcrafted",
    specs: "Tuscan Leather · Wool Felt Lining · Magnetic Clasp",
    image: "/placeholder-accessory.png",
  },
  {
    id: "tech-briefcase-pro",
    name: "Tech Briefcase Pro",
    category: "Bags & Sleeves",
    compatibility: ["Workstations", "Pro Laptops"],
    color: "Matte Black",
    price: 22000,
    specs: "Water-resistant · Shock-absorbing · Luggage Pass-through",
    image: "/placeholder-accessory.png",
  },
];
