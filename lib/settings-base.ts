import { z } from "zod";
import { getDefaultHomepageSections } from "./homepage-sections";
import {
  SHOP_CATEGORIES,
  APPLE_DROPDOWN_ITEMS,
  GAMING_LAPTOPS_DROPDOWN_ITEMS,
  MICROSOFT_DROPDOWN_ITEMS,
  ACCESSORIES_NAV_ITEMS,
  BUDGET_RANGE_ITEMS,
} from "./navigation";
import { navigationLinks } from "@/app/data/navigation";

// ─── 1. Sub-Schemas & Schemas ────────────────────────────────────────────────

export const StoreProfileSchema = z.object({
  name: z.string().min(1).default("Laptop Point BD"),
  tagline: z.string().default("Exclusive Laptop Shop in Bangladesh"),
  logo: z.string().default("/Logo.webp"),
  favicon: z.string().default("/favicon.ico"),
  hotline: z.string().default("+880 1612-182408"),
  salesPhone: z.string().default("+880 1612-182408"),
  supportPhone: z.string().default("+880 1830-515157"),
  email: z.string().default("info@laptoppointbd.com"),
  whatsapp: z.string().default("+880 1612-182408"),
  socialLinks: z
    .object({
      facebook: z.string().default("https://www.facebook.com/laptoppointbd"),
      instagram: z.string().default("https://www.instagram.com/laptop_point.bd/"),
      tiktok: z.string().default("https://www.tiktok.com/@laptop.point.bd"),
      youtube: z.string().default("https://www.youtube.com/@LaptopPointBD"),
    })
    .default({
      facebook: "https://www.facebook.com/laptoppointbd",
      instagram: "https://www.instagram.com/laptop_point.bd/",
      tiktok: "https://www.tiktok.com/@laptop.point.bd",
      youtube: "https://www.youtube.com/@LaptopPointBD",
    }),
  showroomBranches: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        address: z.string(),
        phone: z.string(),
        hours: z.string(),
        mapLink: z.string().optional().default(""),
      })
    )
    .default([
      {
        id: "mirpur-10",
        name: "Mirpur-10 Outlet",
        address:
          "Madbar Mansion, Shop-08, Mirpur-10, Dhaka-1216, Bangladesh",
        phone: "+880 1612-182408",
        hours: "Open Everyday: 10:00 AM - 9:00 PM",
        mapLink: "",
      },
    ]),
});
export type StoreProfileSettings = z.infer<typeof StoreProfileSchema>;

export const HomepageLayoutSchema = z.object({
  sections: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        visible: z.boolean(),
        sortOrder: z.number(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
      })
    )
    .default(getDefaultHomepageSections()),
});
export type HomepageLayoutSettings = z.infer<typeof HomepageLayoutSchema>;

export const CategorySubItemSchema = z.object({
  name: z.string(),
  href: z.string(),
  icon: z.string().optional(),
});

export const ShopCategoryItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string(),
  icon: z.string().optional(),
  hasChevron: z.boolean().optional(),
  subitems: z.array(CategorySubItemSchema).optional(),
});

export const DropdownSubItemSchema = z.object({
  name: z.string(),
  href: z.string(),
});

export const TopNavMenuSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string().optional(),
  badge: z.string().optional(),
  badgeColor: z.string().optional(),
  dropdownItems: z.array(DropdownSubItemSchema).optional(),
});

export const CategoryChipSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string(),
  icon: z.string().optional(),
});

export const FooterLinkItemSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export const FooterColumnSchema = z.object({
  columnTitle: z.string(),
  links: z.array(FooterLinkItemSchema),
});

// Real data-driven defaults generated from lib/navigation.ts & app/data/navigation.ts
const defaultTopNavMenus: z.infer<typeof TopNavMenuSchema>[] = [
  {
    id: "apple",
    label: "Apple",
    dropdownItems: APPLE_DROPDOWN_ITEMS,
  },
  {
    id: "gaming",
    label: "Gaming Laptops",
    badge: "Hot",
    dropdownItems: GAMING_LAPTOPS_DROPDOWN_ITEMS,
  },
  {
    id: "microsoft",
    label: "Microsoft",
    dropdownItems: MICROSOFT_DROPDOWN_ITEMS,
  },
  {
    id: "accessories",
    label: "Accessories",
    dropdownItems: ACCESSORIES_NAV_ITEMS,
  },
  {
    id: "budget",
    label: "Budget Range",
    dropdownItems: BUDGET_RANGE_ITEMS,
  },
  {
    id: "2026-laptops",
    label: "2026 Laptops",
    href: "/shop?tag=2026",
    badge: "New",
  },
];

const defaultCategoryChips: z.infer<typeof CategoryChipSchema>[] = [
  {
    id: "apple",
    label: "🍎 Apple Ecosystem",
    href: SHOP_CATEGORIES.find((c) => c.id === "apple")?.href || "/shop?brand=Apple",
  },
  {
    id: "gaming",
    label: "🎮 Gaming Laptops",
    href:
      SHOP_CATEGORIES.find((c) => c.id === "all-laptop")?.subitems?.find((s) =>
        s.name.includes("Gaming")
      )?.href || "/shop?category=Laptop",
  },
  {
    id: "dell",
    label: "💻 Dell Latitude / XPS",
    href: SHOP_CATEGORIES.find((c) => c.id === "dell")?.href || "/shop?brand=Dell",
  },
  {
    id: "accessories",
    label: "⚡ Pro Accessories",
    href: SHOP_CATEGORIES.find((c) => c.id === "accessories")?.href || "/accessories",
  },
];

const defaultFooterLinks: z.infer<typeof FooterColumnSchema>[] = [
  {
    columnTitle: "Policies & Help",
    links: [
      { label: "EMI Information", href: "/emi" },
      { label: "Warranty Policy", href: "/warranty" },
      { label: "Online Delivery", href: "/delivery" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Request A Quote", href: "/quote" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
  {
    columnTitle: "Quick Navigation",
    links: navigationLinks
      .filter((item) => !["/deals", "/compare", "/contact"].includes(item.href))
      .map((item) => ({
        label: item.name,
        href: item.href,
      })),
  },
];

export const NavigationSchema = z.object({
  shopCategories: z.array(ShopCategoryItemSchema).default(SHOP_CATEGORIES),
  topNavMenus: z.array(TopNavMenuSchema).default(defaultTopNavMenus),
  categoryChips: z.array(CategoryChipSchema).default(defaultCategoryChips),
  footerLinks: z.array(FooterColumnSchema).default(defaultFooterLinks),
});
export type NavigationSettings = z.infer<typeof NavigationSchema>;

export const CatalogMastersSchema = z.object({
  conditions: z.array(z.string()).default([
    "Brand New",
    "Open Box",
    "Official Refurbished",
    "Pre-Owned / Like New",
    "Pre-Owned / Excellent",
    "Pre-Owned / Good",
  ]),
  grades: z.array(z.string()).default(["A+", "A", "A-", "B+", "B"]),
  warrantyTypes: z.array(z.string()).default([
    "Official Brand Warranty",
    "Shop Replacement & Free Service Warranty",
    "Parts & Service Warranty",
    "International Warranty",
  ]),
});
export type CatalogMastersSettings = z.infer<typeof CatalogMastersSchema>;

export const CommerceSchema = z.object({
  currency: z.string().default("BDT"),
  currencySymbol: z.string().default("৳"),
  taxRule: z.enum(["inclusive", "exclusive", "exempt"]).default("inclusive"),
  deliveryInsideDhakaFee: z.number().default(0),
  deliveryOutsideDhakaFee: z.number().default(0),
  vipDeliveryFee: z.number().default(500),
  deliveryZones: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        fee: z.number(),
        timeline: z.string(),
        description: z.string().optional(),
        active: z.boolean(),
      })
    )
    .default([
      {
        id: "dhaka",
        name: "Inside Dhaka City",
        fee: 0,
        timeline: "Same Day / 24h",
        description:
          "Delivered via dedicated in-house couriers. You can inspect the laptop physically, verify specs, and pay cash on delivery.",
        active: true,
      },
      {
        id: "outside",
        name: "Outside Dhaka (All 64 Districts)",
        fee: 0,
        timeline: "24 to 48 Hours",
        description:
          "Shipped via Steadfast, Sundarban, SA Paribahan, or RedX with tracking ID provided immediately upon dispatch.",
        active: true,
      },
      {
        id: "express",
        name: "VIP Express Courier",
        fee: 500,
        timeline: "Within 4 to 6 Hours",
        description: "Same-Day VIP Courier with express door-to-door delivery.",
        active: true,
      },
    ]),
  paymentMethods: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        enabled: z.boolean(),
        description: z.string(),
      })
    )
    .default([
      { id: "cod", name: "Cash on Delivery", enabled: true, description: "Pay when product is delivered" },
      { id: "bkash", name: "bKash / Mobile Banking", enabled: false, description: "Merchant number verification" },
      { id: "card", name: "Credit / Debit Card", enabled: false, description: "Visa, Mastercard, Amex" },
      { id: "emi", name: "Card EMI (Up to 36 Months)", enabled: false, description: "0% interest on selected banks" },
    ]),
  emiTerms: z
    .string()
    .default(
      "Buy your desired laptop or workstation today with convenient monthly installment plans up to 36 months."
    ),
  warrantyTerms: z.string().default(
    "Every device sold by Laptop Point BD is rigorously inspected by certified engineers."
  ),
  privacyPolicy: z.string().optional(),
  termsOfService: z.string().optional(),
  returnsPolicy: z.string().optional(),
  shippingPolicy: z.string().optional(),
  defaultLowStockThreshold: z.number().default(10),
});
export type CommerceSettings = z.infer<typeof CommerceSchema>;

export { calculateDeliveryFee, type ShippingFeeInput, type DeliveryFeeRules } from "./delivery";

export const SeoSchema = z.object({
  titleTemplate: z.string().default("%s | Laptop Point BD"),
  defaultTitle: z.string().default("Laptop Point BD - Exclusive Laptop Shop in Bangladesh"),
  defaultDescription: z.string().default(
    "Find the best laptops in Bangladesh with detailed reviews and comparisons at Laptop Point BD."
  ),
  defaultShareImage: z.string().default("/Hero_Image.png"),
  robotsRules: z
    .object({
      allow: z.array(z.string()).default(["/"]),
      disallow: z.array(z.string()).default(["/admin/", "/api/", "/checkout"]),
    })
    .default({
      allow: ["/"],
      disallow: ["/admin/", "/api/", "/checkout"],
    }),
  googleVerification: z.string().default(""),
  bingVerification: z.string().default(""),
});
export type SeoSettings = z.infer<typeof SeoSchema>;

export const TrackingSchema = z.object({
  ga4MeasurementId: z.string().default(""),
  metaPixelId: z.string().default(""),
  gtmId: z.string().default(""),
});
export type TrackingSettings = z.infer<typeof TrackingSchema>;

// Group Registry
export const SETTINGS_GROUP_REGISTRY = {
  store_profile: {
    schema: StoreProfileSchema,
    default: StoreProfileSchema.parse({}),
  },
  homepage_layout: {
    schema: HomepageLayoutSchema,
    default: HomepageLayoutSchema.parse({}),
  },
  navigation: {
    schema: NavigationSchema,
    default: NavigationSchema.parse({}),
  },
  catalog_masters: {
    schema: CatalogMastersSchema,
    default: CatalogMastersSchema.parse({}),
  },
  commerce: {
    schema: CommerceSchema,
    default: CommerceSchema.parse({}),
  },
  seo: {
    schema: SeoSchema,
    default: SeoSchema.parse({}),
  },
  tracking: {
    schema: TrackingSchema,
    default: TrackingSchema.parse({}),
  },
} as const;

export type SettingsGroupKey = keyof typeof SETTINGS_GROUP_REGISTRY;

// ─── 2. Single Source of Truth: Role Permissions ───────────────────────────

export type AdminRole = "owner" | "manager" | "marketing" | "support";
export type SetupPermissionTarget =
  | "store_profile"
  | "homepage_layout"
  | "navigation"
  | "catalog_masters"
  | "commerce"
  | "seo"
  | "tracking"
  | "credentials"
  | "users";

export type PermissionAction = "read" | "write";

export const ROLE_PERMISSIONS: Record<
  AdminRole,
  {
    read: SetupPermissionTarget[];
    write: SetupPermissionTarget[];
  }
> = {
  owner: {
    read: [
      "store_profile",
      "homepage_layout",
      "navigation",
      "catalog_masters",
      "commerce",
      "seo",
      "tracking",
      "credentials",
      "users",
    ],
    write: [
      "store_profile",
      "homepage_layout",
      "navigation",
      "catalog_masters",
      "commerce",
      "seo",
      "tracking",
      "credentials",
      "users",
    ],
  },
  manager: {
    read: [
      "store_profile",
      "homepage_layout",
      "navigation",
      "catalog_masters",
      "commerce",
      "seo",
      "tracking",
      "users",
    ],
    write: [
      "store_profile",
      "homepage_layout",
      "navigation",
      "catalog_masters",
      "commerce",
      "seo",
      "tracking",
      "users",
    ],
  },
  marketing: {
    read: [
      "store_profile",
      "homepage_layout",
      "navigation",
      "seo",
    ],
    write: [
      "store_profile",
      "homepage_layout",
      "navigation",
      "seo",
    ],
  },
  support: {
    read: [
      "store_profile",
      "homepage_layout",
      "navigation",
      "catalog_masters",
      "commerce",
      "seo",
      "tracking",
    ],
    write: [],
  },
};

export function canAccessSetup(
  role: string | undefined | null,
  target: SetupPermissionTarget,
  action: PermissionAction = "read"
): boolean {
  const normalizedRole = (role?.toLowerCase() || "support") as AdminRole;
  const perms = ROLE_PERMISSIONS[normalizedRole];
  if (!perms) return false;
  return perms[action].includes(target);
}

// ─── 3. Field-Level Recovery & Warning Tracking ──────────────────────────────

export type FieldRecoveryWarning = {
  group: SettingsGroupKey;
  path: string;
  message: string;
};

// Global in-memory warning tracker for setup UI
export const latestRecoveryWarnings: Map<string, FieldRecoveryWarning[]> = new Map();

export function getGroupRecoveryWarnings(group?: SettingsGroupKey): FieldRecoveryWarning[] {
  if (group) {
    return latestRecoveryWarnings.get(group) || [];
  }
  const all: FieldRecoveryWarning[] = [];
  for (const list of latestRecoveryWarnings.values()) {
    all.push(...list);
  }
  return all;
}

/**
 * Recovers valid fields from raw input by reverting only the failing paths
 * back to their default values.
 */
export function recoverFields(defaultVal: unknown, rawVal: unknown, issues: z.ZodIssue[]): unknown {
  if (typeof defaultVal !== "object" || defaultVal === null || typeof rawVal !== "object" || rawVal === null) {
    return defaultVal;
  }

  // Create deep clone of raw merged over default
  const merged: Record<string, unknown> = Array.isArray(defaultVal)
    ? ((Array.isArray(rawVal) ? [...(rawVal as unknown[])] : [...(defaultVal as unknown[])]) as unknown as Record<string, unknown>)
    : { ...(defaultVal as Record<string, unknown>), ...(rawVal as Record<string, unknown>) };

  // Revert each invalid path to its corresponding default value
  for (const issue of issues) {
    if (issue.path.length === 0) continue;

    let curMerged: unknown = merged;
    let curDefault: unknown = defaultVal;

    for (let i = 0; i < issue.path.length - 1; i++) {
      const seg = String(issue.path[i]);
      if (curMerged && typeof curMerged === "object" && curDefault && typeof curDefault === "object") {
        curMerged = (curMerged as Record<string, unknown>)[seg];
        curDefault = (curDefault as Record<string, unknown>)[seg];
      }
    }

    const lastKey = String(issue.path[issue.path.length - 1]);
    if (curMerged && typeof curMerged === "object" && curDefault && typeof curDefault === "object") {
      (curMerged as Record<string, unknown>)[lastKey] = (curDefault as Record<string, unknown>)[lastKey];
    }
  }

  return merged;
}
