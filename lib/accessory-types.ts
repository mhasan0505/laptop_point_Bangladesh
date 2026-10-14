// Client-safe accessory types and constants (no fs / prisma imports).

export interface AccessoryCategory {
  slug: string;
  name: string;
  description: string;
}

export const ACCESSORY_CATEGORIES: AccessoryCategory[] = [
  {
    slug: "chargers-adapters",
    name: "Chargers & Adapters",
    description: "Original and compatible chargers for popular laptop brands.",
  },
  {
    slug: "batteries",
    name: "Batteries",
    description: "Replacement batteries for everyday use.",
  },
  {
    slug: "bags-sleeves",
    name: "Bags & Sleeves",
    description: "Protective bags for work, travel, and daily carry.",
  },
  {
    slug: "keyboards-mice",
    name: "Keyboards & Mice",
    description: "Comfortable peripherals for productivity.",
  },
  {
    slug: "storage",
    name: "Storage",
    description: "SSDs, HDDs, and external storage options.",
  },
  {
    slug: "routers-networking",
    name: "Routers & Networking",
    description: "Reliable wireless connectivity for home and office.",
  },
  {
    slug: "other",
    name: "Other Accessories",
    description: "Everything else for your laptop setup.",
  },
];

export const ACCESSORY_CONDITIONS = ["New", "Refurbished", "Used"] as const;
export type AccessoryCondition = (typeof ACCESSORY_CONDITIONS)[number];

export interface AccessoryRecord {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: string; // ACCESSORY_CATEGORIES slug
  compatibility: string[];
  condition: AccessoryCondition;
  warranty: string;
  color: string;
  price: number;
  originalPrice?: number;
  stock: number;
  specs: string[];
  description: string;
  images: string[];
  badge?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** What the storefront receives. */
export interface PublicAccessory extends Omit<AccessoryRecord, "active"> {
  inStock: boolean;
}

export function categoryName(slug: string): string {
  return ACCESSORY_CATEGORIES.find((c) => c.slug === slug)?.name ?? "Accessories";
}

export const ACCESSORY_PLACEHOLDER = "/accessory-placeholder.svg";
