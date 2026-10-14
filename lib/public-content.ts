import {
  HOMEPAGE_SECTION_REGISTRY,
  type ConfiguredHomepageSection,
} from "@/lib/homepage-sections";
import { getPowerDealConfig, getPowerDeals } from "@/lib/power-deal-data";
import type { PowerDealConfigData } from "@/lib/power-deal-data";
import type { PowerDealItem } from "@/components/power-deal/PowerDealTypes";
import { getSettings, hasSavedSettings } from "@/lib/settings";

/**
 * Storefront-facing readers for content that is managed in the admin panel.
 * Every reader degrades to safe defaults so a storage failure can never take
 * the public site down.
 */

export interface StorefrontContact {
  name: string;
  hotline: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  social: { facebook: string; instagram: string; tiktok: string; youtube: string };
}

// What the storefront shipped with before Store Profile was wired in. Used
// until an admin saves the profile, so going live never swaps contact details.
const STOREFRONT_FALLBACK: StorefrontContact = {
  name: "Laptop Point BD",
  hotline: "+880 1612-182408",
  whatsapp: "+880 1612-182408",
  email: "info@laptoppointbd.com",
  address: "Madbar Mansion, Shop-08, Mirpur-10, Dhaka-1216",
  hours: "Mon - Sat, 10:30 AM - 9:00 PM",
  social: {
    facebook: "https://www.facebook.com/laptoppointbd",
    instagram: "https://www.instagram.com/laptop_point.bd/",
    tiktok: "https://www.tiktok.com/@laptop.point.bd",
    youtube: "https://www.youtube.com/@LaptopPointBD",
  },
};

export async function getStorefrontContact(): Promise<StorefrontContact> {
  try {
    if (!(await hasSavedSettings("store_profile"))) return STOREFRONT_FALLBACK;
    const p = await getSettings("store_profile");
    const branch = p.showroomBranches?.[0];
    return {
      name: p.name || STOREFRONT_FALLBACK.name,
      hotline: p.hotline || STOREFRONT_FALLBACK.hotline,
      whatsapp: p.whatsapp || p.hotline || STOREFRONT_FALLBACK.whatsapp,
      email: p.email || STOREFRONT_FALLBACK.email,
      address: branch?.address || STOREFRONT_FALLBACK.address,
      hours: branch?.hours || STOREFRONT_FALLBACK.hours,
      social: {
        facebook: p.socialLinks?.facebook || STOREFRONT_FALLBACK.social.facebook,
        instagram: p.socialLinks?.instagram || STOREFRONT_FALLBACK.social.instagram,
        tiktok: p.socialLinks?.tiktok || STOREFRONT_FALLBACK.social.tiktok,
        youtube: p.socialLinks?.youtube || STOREFRONT_FALLBACK.social.youtube,
      },
    };
  } catch {
    return STOREFRONT_FALLBACK;
  }
}

/**
 * Admin-configured homepage sections merged with the code registry, so a
 * section added in code appears even if the saved layout predates it, and
 * a section removed from code is ignored.
 */
export async function getHomepageSections(): Promise<ConfiguredHomepageSection[]> {
  let saved: Array<Partial<ConfiguredHomepageSection> & { id: string }> = [];
  try {
    const layout = await getSettings("homepage_layout");
    saved = layout.sections ?? [];
  } catch {
    saved = [];
  }
  const byId = new Map(saved.map((s) => [s.id, s]));

  return HOMEPAGE_SECTION_REGISTRY.map((def) => {
    const s = byId.get(def.id);
    return {
      id: def.id,
      label: s?.label || def.label,
      visible: s?.visible ?? def.defaultVisible,
      sortOrder: s?.sortOrder ?? def.defaultOrder,
      heading: s?.heading || undefined,
      subheading: s?.subheading || undefined,
      bannerPlacement: def.bannerPlacement,
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder);
}

export interface PublicPowerDeals {
  config: PowerDealConfigData;
  deals: PowerDealItem[];
}

export async function getPublicPowerDeals(): Promise<PublicPowerDeals | null> {
  try {
    const [config, all] = await Promise.all([getPowerDealConfig(), getPowerDeals()]);
    if (!config.active) return null;
    const deals = all
      .filter((d) => d.active !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return { config, deals };
  } catch (err) {
    console.error("[public-content] power deals unavailable:", err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────────────────────────────────────

export interface StorefrontNavigation {
  shopCategories: Array<{
    id: string;
    label: string;
    href: string;
    icon?: string;
    hasChevron?: boolean;
    subitems?: Array<{ name: string; href: string; icon?: string }>;
  }>;
  topNavMenus: Array<{
    id: string;
    label: string;
    href?: string;
    badge?: string;
    badgeColor?: string;
    dropdownItems?: Array<{ name: string; href: string }>;
  }>;
  categoryChips: Array<{
    id: string;
    label: string;
    href: string;
    icon?: string;
  }>;
  footerLinks: Array<{
    columnTitle: string;
    links: Array<{ label: string; href: string }>;
  }>;
}

const STOREFRONT_FOOTER_FALLBACK: StorefrontNavigation["footerLinks"] = [
  {
    columnTitle: "Quick Links",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Laptops", href: "/shop?category=laptop" },
      { label: "Accessories", href: "/shop?category=accessories" },
      { label: "Hot Deals", href: "/deals" },
    ],
  },
  {
    columnTitle: "Support",
    links: [
      { label: "My Account", href: "/contact" },
      { label: "Order Tracking", href: "/cart" },
      { label: "FAQs", href: "/contact" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    columnTitle: "Policies",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Shipping Info", href: "/shipping" },
      { label: "Returns & Refund", href: "/returns" },
    ],
  },
];

const STOREFRONT_CHIPS_FALLBACK: StorefrontNavigation["categoryChips"] = [
  { id: "deals", label: "🔥 Deals", href: "/deals" },
  { id: "new", label: "🆕 New", href: "/shop?sort=new" },
  { id: "budget", label: "💰 Budget", href: "/shop?category=budget" },
  { id: "gaming", label: "🎮 Gaming", href: "/shop?category=gaming" },
  { id: "business", label: "💼 Business", href: "/shop?category=business" },
];

export async function getStorefrontNavigation(): Promise<StorefrontNavigation> {
  try {
    if (!(await hasSavedSettings("navigation"))) {
      const { navigationLinks, departmentMenuItems } = await import(
        "@/app/data/menu-config"
      );
      return {
        topNavMenus: navigationLinks.map((item) => ({
          id: item.name.toLowerCase().replace(/\s+/g, "-"),
          label: item.name,
          href: item.href,
          badge: item.badge,
          dropdownItems: item.submenu?.map((s) => ({
            name: s.name,
            href: s.href,
          })),
        })),
        shopCategories: departmentMenuItems.map((item) => ({
          id: item.name.toLowerCase().replace(/\s+/g, "-"),
          label: item.name,
          href: item.href,
          subitems: item.sub?.flatMap((s) => s.items) ?? [],
        })),
        categoryChips: STOREFRONT_CHIPS_FALLBACK,
        footerLinks: STOREFRONT_FOOTER_FALLBACK,
      };
    }
    const nav = await getSettings("navigation");
    return {
      shopCategories: nav.shopCategories || [],
      topNavMenus: nav.topNavMenus || [],
      categoryChips: nav.categoryChips && nav.categoryChips.length > 0
        ? nav.categoryChips
        : STOREFRONT_CHIPS_FALLBACK,
      footerLinks: nav.footerLinks && nav.footerLinks.length > 0
        ? nav.footerLinks
        : STOREFRONT_FOOTER_FALLBACK,
    };
  } catch (err) {
    console.error("[public-content] navigation unavailable:", err);
    const { navigationLinks, departmentMenuItems } = await import(
      "@/app/data/menu-config"
    );
    return {
      topNavMenus: navigationLinks.map((item) => ({
        id: item.name.toLowerCase().replace(/\s+/g, "-"),
        label: item.name,
        href: item.href,
        badge: item.badge,
        dropdownItems: item.submenu?.map((s) => ({
          name: s.name,
          href: s.href,
        })),
      })),
      shopCategories: departmentMenuItems.map((item) => ({
        id: item.name.toLowerCase().replace(/\s+/g, "-"),
        label: item.name,
        href: item.href,
        subitems: item.sub?.flatMap((s) => s.items) ?? [],
      })),
      categoryChips: STOREFRONT_CHIPS_FALLBACK,
      footerLinks: STOREFRONT_FOOTER_FALLBACK,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Commerce
// ─────────────────────────────────────────────────────────────────────────────

export interface StorefrontCommerce {
  currency: string;
  currencySymbol: string;
  taxRule: "inclusive" | "exclusive" | "exempt";
  deliveryInsideDhakaFee: number;
  deliveryOutsideDhakaFee: number;
  vipDeliveryFee: number;
  deliveryZones: Array<{
    id: string;
    name: string;
    fee: number;
    timeline: string;
    description?: string;
    active: boolean;
  }>;
  paymentMethods: Array<{
    id: string;
    name: string;
    enabled: boolean;
    description: string;
  }>;
  emiTerms: string;
  warrantyTerms: string;
  privacyPolicy?: string;
  termsOfService?: string;
  returnsPolicy?: string;
  shippingPolicy?: string;
}

const COMMERCE_FALLBACK: StorefrontCommerce = {
  currency: "BDT",
  currencySymbol: "৳",
  taxRule: "inclusive",
  deliveryInsideDhakaFee: 0,
  deliveryOutsideDhakaFee: 0,
  vipDeliveryFee: 500,
  deliveryZones: [
    {
      id: "dhaka",
      name: "Inside Dhaka City",
      fee: 0,
      timeline: "Same Day / 24h",
      description: "Delivered via dedicated in-house couriers.",
      active: true,
    },
    {
      id: "outside",
      name: "Outside Dhaka (All 64 Districts)",
      fee: 0,
      timeline: "24 to 48 Hours",
      description: "Shipped via courier with tracking ID.",
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
  ],
  paymentMethods: [
    { id: "cod", name: "Cash on Delivery", enabled: true, description: "Pay when you receive" },
    { id: "bkash", name: "bKash", enabled: true, description: "Mobile payment" },
    { id: "nagad", name: "Nagad", enabled: true, description: "Mobile payment" },
    { id: "card", name: "Credit/Debit Card", enabled: true, description: "Visa, Mastercard" },
  ],
  emiTerms:
    "Buy your desired laptop or workstation today with convenient monthly installment plans up to 36 months.",
  warrantyTerms:
    "Every device sold by Laptop Point Bangladesh is rigorously inspected by certified engineers.",
};

export async function getStorefrontCommerce(): Promise<StorefrontCommerce> {
  try {
    if (!(await hasSavedSettings("commerce"))) return COMMERCE_FALLBACK;
    const c = await getSettings("commerce");
    return {
      currency: c.currency || COMMERCE_FALLBACK.currency,
      currencySymbol: c.currencySymbol || COMMERCE_FALLBACK.currencySymbol,
      taxRule: c.taxRule || COMMERCE_FALLBACK.taxRule,
      deliveryInsideDhakaFee: c.deliveryInsideDhakaFee ?? COMMERCE_FALLBACK.deliveryInsideDhakaFee,
      deliveryOutsideDhakaFee: c.deliveryOutsideDhakaFee ?? COMMERCE_FALLBACK.deliveryOutsideDhakaFee,
      vipDeliveryFee: c.vipDeliveryFee ?? COMMERCE_FALLBACK.vipDeliveryFee,
      deliveryZones: c.deliveryZones && c.deliveryZones.length > 0
        ? c.deliveryZones
        : COMMERCE_FALLBACK.deliveryZones,
      paymentMethods: c.paymentMethods && c.paymentMethods.length > 0
        ? c.paymentMethods
        : COMMERCE_FALLBACK.paymentMethods,
      emiTerms: c.emiTerms || COMMERCE_FALLBACK.emiTerms,
      warrantyTerms: c.warrantyTerms || COMMERCE_FALLBACK.warrantyTerms,
      privacyPolicy: c.privacyPolicy,
      termsOfService: c.termsOfService,
      returnsPolicy: c.returnsPolicy,
      shippingPolicy: c.shippingPolicy,
    };
  } catch (err) {
    console.error("[public-content] commerce settings unavailable:", err);
    return COMMERCE_FALLBACK;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO & Tracking
// ─────────────────────────────────────────────────────────────────────────────

export interface StorefrontSeo {
  titleTemplate: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultShareImage: string;
  googleVerification: string;
  bingVerification: string;
  robotsRules: {
    allow: string[];
    disallow: string[];
  };
}

const SEO_FALLBACK: StorefrontSeo = {
  titleTemplate: "%s | Laptop Point Bangladesh",
  defaultTitle: "Laptop Point Bangladesh - Premium Brand New And Used Laptops",
  defaultDescription: "Find the best laptops in Bangladesh with detailed reviews and comparisons.",
  defaultShareImage: "/Hero_Image.png",
  googleVerification: "ljFisqvr68Zmoi6h41Y5BSMWuktGPPdHTkRCpYaeFOQ",
  bingVerification: "",
  robotsRules: {
    allow: ["/"],
    disallow: ["/admin/", "/api/", "/checkout"],
  },
};

export async function getStorefrontSeo(): Promise<StorefrontSeo> {
  try {
    if (!(await hasSavedSettings("seo"))) return SEO_FALLBACK;
    const s = await getSettings("seo");
    return {
      titleTemplate: s.titleTemplate || SEO_FALLBACK.titleTemplate,
      defaultTitle: s.defaultTitle || SEO_FALLBACK.defaultTitle,
      defaultDescription: s.defaultDescription || SEO_FALLBACK.defaultDescription,
      defaultShareImage: s.defaultShareImage || SEO_FALLBACK.defaultShareImage,
      googleVerification: s.googleVerification || SEO_FALLBACK.googleVerification,
      bingVerification: s.bingVerification || SEO_FALLBACK.bingVerification,
      robotsRules: s.robotsRules || SEO_FALLBACK.robotsRules,
    };
  } catch (err) {
    console.error("[public-content] seo settings unavailable:", err);
    return SEO_FALLBACK;
  }
}

export interface StorefrontTracking {
  ga4MeasurementId: string;
  metaPixelId: string;
  gtmId: string;
}

const TRACKING_FALLBACK: StorefrontTracking = {
  ga4MeasurementId: process.env.NEXT_PUBLIC_GA_ID || "G-NSPLFEW71H",
  metaPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || "1676617903511293",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "GTM-KXKXGWF6",
};

export async function getStorefrontTracking(): Promise<StorefrontTracking> {
  try {
    if (!(await hasSavedSettings("tracking"))) return TRACKING_FALLBACK;
    const t = await getSettings("tracking");
    return {
      ga4MeasurementId: t.ga4MeasurementId || TRACKING_FALLBACK.ga4MeasurementId,
      metaPixelId: t.metaPixelId || TRACKING_FALLBACK.metaPixelId,
      gtmId: t.gtmId || TRACKING_FALLBACK.gtmId,
    };
  } catch (err) {
    console.error("[public-content] tracking settings unavailable:", err);
    return TRACKING_FALLBACK;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MegaMenu Featured Products (SSR lightweight payload)
// ─────────────────────────────────────────────────────────────────────────────

export interface MegaMenuFeaturedProduct {
  id: string | number;
  slug: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
}

export async function getMegaMenuFeaturedProducts(): Promise<Record<string, MegaMenuFeaturedProduct[]>> {
  try {
    const { getLiveLaptops } = await import("@/app/data/data");
    const laptops = await getLiveLaptops();

    const categoryMap: Record<string, string[]> = {
      Business: ["HP", "Dell", "Lenovo"],
      Professional: ["HP", "Dell", "Lenovo"],
      Gaming: ["ASUS", "MSI", "Acer"],
      Budget: ["Dell", "Lenovo"],
    };

    const result: Record<string, MegaMenuFeaturedProduct[]> = {};

    for (const [category, brands] of Object.entries(categoryMap)) {
      result[category] = laptops
        .filter((laptop) =>
          brands.some(
            (brand) =>
              laptop.name.toUpperCase().includes(brand.toUpperCase()) ||
              (laptop.brand && laptop.brand.toUpperCase() === brand.toUpperCase()),
          ),
        )
        .slice(0, 3)
        .map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          image: typeof p.image === "string" ? p.image : (p.image as any)?.src || "/Hero_Image.png",
          price: p.price,
          originalPrice: p.originalPrice,
          discount: p.discount,
        }));
    }

    return result;
  } catch (err) {
    console.error("[public-content] mega menu products unavailable:", err);
    return {
      Business: [],
      Professional: [],
      Gaming: [],
      Budget: [],
    };
  }
}

