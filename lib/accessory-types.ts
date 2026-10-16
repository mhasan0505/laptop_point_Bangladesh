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
  /** Public YouTube link shown on the accessory page. */
  youtubeUrl?: string;
  /** Free-text fields kept verbatim so the admin form round-trips. */
  connectivity?: string;
  keySpecs?: string;
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

// ── Mapping from the admin product form's free-text category ────────────────

/** Admin-form category / sub-category names (see lib/navigation ACCESSORY_CATEGORIES) → accessory slug. */
const CATEGORY_ALIASES: Record<string, string> = {
  "laptop bag": "bags-sleeves",
  "laptop bags & sleeves": "bags-sleeves",
  "bags & sleeves": "bags-sleeves",
  "charger & adapter": "chargers-adapters",
  "chargers & adapters": "chargers-adapters",
  keyboard: "keyboards-mice",
  mouse: "keyboards-mice",
  "mouse & keyboards": "keyboards-mice",
  "keyboards & mice": "keyboards-mice",
  networking: "routers-networking",
  routers: "routers-networking",
  "routers & networking": "routers-networking",
  battery: "batteries",
  batteries: "batteries",
  storage: "storage",
  ssd: "storage",
  hdd: "storage",
  monitor: "other",
  webcam: "other",
  audio: "other",
  "headphones & audio": "other",
  "cooling pad": "other",
  "laptop stand": "other",
  "stands & cooling pads": "other",
  "laptop skin": "other",
  "cables & docks": "other",
  accessories: "other",
  accessory: "other",
};

const norm = (v: string | undefined | null) => (v ?? "").trim().toLowerCase();

/** Resolve an accessory category slug from free-text category and/or sub-category; null if neither names one. */
export function resolveAccessoryCategorySlug(category?: string, subCategory?: string): string | null {
  for (const candidate of [subCategory, category]) {
    const k = norm(candidate);
    if (!k) continue;
    const direct = ACCESSORY_CATEGORIES.find((c) => c.slug === k || norm(c.name) === k);
    if (direct) return direct.slug;
    if (CATEGORY_ALIASES[k]) return CATEGORY_ALIASES[k];
  }
  return null;
}

/** True when the admin-selected category means "this is an accessory, not a laptop". */
export function isAccessoryCategoryName(category?: string): boolean {
  const k = norm(category);
  if (!k) return false;
  if (k.includes("accessor") || k.includes("component") || k.includes("peripheral")) return true;
  return resolveAccessoryCategorySlug(category) !== null;
}
