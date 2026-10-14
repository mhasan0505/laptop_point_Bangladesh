export interface PowerDealItem {
  id: string;
  slug?: string;
  name: string;
  brand: string;
  screen: string;
  cpu: string;
  ram: string;
  storage: string;
  graphics?: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  savings?: number;
  discountPercentage?: number;
  badge?: string;
  techBadge?: string;
  condition?: string;
  stockStatus?: string;
  stockQty?: number;
  featured?: boolean;
  active?: boolean;
  sortOrder?: number;
}

export const CURATED_POWER_DEALS: PowerDealItem[] = [
  {
    id: "power-deal-1",
    slug: "hp-elitebook-840-g8-power-deal",
    name: "HP EliteBook 840 G8 · Intel Core i7 11th Gen · 16GB RAM · 512GB NVMe SSD",
    brand: "HP",
    screen: "14.0\" FHD IPS Anti-Glare",
    cpu: "Intel Core i7-1165G7 (Up to 4.7GHz)",
    ram: "16GB DDR4 RAM",
    storage: "512GB PCIe NVMe SSD",
    graphics: "Intel Iris Xe Graphics",
    image: "/Hero/HP.png",
    originalPrice: 65000,
    salePrice: 52500,
    savings: 12500,
    discountPercentage: 19,
    badge: "Hot Drop",
    techBadge: "Intel Evo",
    condition: "Grade A+ Official Refurbished",
    stockStatus: "In Stock",
    stockQty: 8,
    featured: true,
    active: true,
    sortOrder: 0,
  },
  {
    id: "power-deal-2",
    slug: "dell-latitude-7420-power-deal",
    name: "Dell Latitude 7420 · Intel Core i5 11th Gen · 16GB RAM · 256GB SSD",
    brand: "Dell",
    screen: "14.0\" FHD ComfortView Plus",
    cpu: "Intel Core i5-1145G7 vPro",
    ram: "16GB LPDDR4x RAM",
    storage: "256GB M.2 NVMe SSD",
    graphics: "Intel Iris Xe Graphics",
    image: "/Hero/dell.png",
    originalPrice: 55000,
    salePrice: 44000,
    savings: 11000,
    discountPercentage: 20,
    badge: "Sale",
    techBadge: "Mil-Spec Tested",
    condition: "Pre-Owned / Like New",
    stockStatus: "In Stock",
    stockQty: 5,
    featured: false,
    active: true,
    sortOrder: 1,
  },
  {
    id: "power-deal-3",
    slug: "lenovo-thinkpad-t14-gen-2-power-deal",
    name: "Lenovo ThinkPad T14 Gen 2 · AMD Ryzen 5 Pro · 16GB RAM · 512GB SSD",
    brand: "Lenovo",
    screen: "14.0\" FHD IPS 300 nits",
    cpu: "AMD Ryzen 5 PRO 5650U (6-Core, 12-Thread)",
    ram: "16GB DDR4 RAM",
    storage: "512GB PCIe NVMe SSD",
    graphics: "AMD Radeon Graphics",
    image: "/Hero/lenovo.png",
    originalPrice: 62000,
    salePrice: 49500,
    savings: 12500,
    discountPercentage: 20,
    badge: "Top Seller",
    techBadge: "Legendary Durability",
    condition: "Grade A+ Refurbished",
    stockStatus: "In Stock",
    stockQty: 6,
    featured: false,
    active: true,
    sortOrder: 2,
  },
  {
    id: "power-deal-4",
    slug: "microsoft-surface-laptop-4-power-deal",
    name: "Microsoft Surface Laptop 4 · 13.5\" PixelSense Touch · Core i5 · 8GB · 256GB",
    brand: "Microsoft",
    screen: "13.5\" 2256×1504 PixelSense Touchscreen",
    cpu: "Intel Core i5-1135G7",
    ram: "8GB LPDDR4x RAM",
    storage: "256GB Removable SSD",
    graphics: "Intel Iris Xe Graphics",
    image: "/Hero/Microsoft.png",
    originalPrice: 68000,
    salePrice: 56000,
    savings: 12000,
    discountPercentage: 18,
    badge: "2-in-1 Touch",
    techBadge: "1.09kg Ultralight",
    condition: "Grade A+ Refurbished",
    stockStatus: "In Stock",
    stockQty: 4,
    featured: false,
    active: true,
    sortOrder: 3,
  },
];
