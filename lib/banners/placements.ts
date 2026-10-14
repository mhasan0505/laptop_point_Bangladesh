export type PlacementDisplayMode = "single" | "multiple";

export interface BannerPlacement {
  id: string;
  label: string;
  whereItShows: string;
  mode: PlacementDisplayMode;
  preset: string; // e.g. "hero", "wide-banner", "mobile-banner", "card", "icon"
  recommendedWidth: number;
  recommendedHeight: number;
  recommendedSize: string; // e.g. "1920×600"
  aspectRatio: string; // e.g. "16:5"
  ratioValue: number; // numeric width / height for tolerance checking
}

export const BANNER_PLACEMENTS: BannerPlacement[] = [
  {
    id: "home.hero",
    label: "Homepage Hero Carousel",
    whereItShows: "Homepage top edge-to-edge carousel",
    mode: "multiple",
    preset: "hero",
    recommendedWidth: 1920,
    recommendedHeight: 600,
    recommendedSize: "1920×600",
    aspectRatio: "16:5",
    ratioValue: 1920 / 600,
  },
  {
    id: "home.power-deal",
    label: "Power Deal Feature Banner",
    whereItShows: "Homepage Power Deal section header",
    mode: "single",
    preset: "wide-banner",
    recommendedWidth: 1920,
    recommendedHeight: 450,
    recommendedSize: "1920×450",
    aspectRatio: "16:3.75",
    ratioValue: 1920 / 450,
  },
  {
    id: "home.surface",
    label: "Microsoft Surface Banner",
    whereItShows: "Homepage Microsoft Surface section",
    mode: "single",
    preset: "wide-banner",
    recommendedWidth: 1920,
    recommendedHeight: 450,
    recommendedSize: "1920×450",
    aspectRatio: "16:3.75",
    ratioValue: 1920 / 450,
  },
  {
    id: "home.apple",
    label: "Apple Ecosystem Banner",
    whereItShows: "Homepage Apple Showcase section",
    mode: "single",
    preset: "wide-banner",
    recommendedWidth: 1920,
    recommendedHeight: 450,
    recommendedSize: "1920×450",
    aspectRatio: "16:3.75",
    ratioValue: 1920 / 450,
  },
  {
    id: "home.accessories",
    label: "Accessories Cyan Banner",
    whereItShows: "Homepage Accessories promo section",
    mode: "single",
    preset: "wide-banner",
    recommendedWidth: 1920,
    recommendedHeight: 450,
    recommendedSize: "1920×450",
    aspectRatio: "16:3.75",
    ratioValue: 1920 / 450,
  },
  {
    id: "home.bottom-cta",
    label: "Bottom Hotline & CTA Strip",
    whereItShows: "Homepage bottom conversion strip",
    mode: "single",
    preset: "wide-banner",
    recommendedWidth: 1920,
    recommendedHeight: 300,
    recommendedSize: "1920×300",
    aspectRatio: "16:2.5",
    ratioValue: 1920 / 300,
  },
  {
    id: "home.flash-deal",
    label: "Homepage Flash Deal Card",
    whereItShows: "Homepage deal badge / sidebar deal",
    mode: "single",
    preset: "card",
    recommendedWidth: 1200,
    recommendedHeight: 600,
    recommendedSize: "1200×600",
    aspectRatio: "2:1",
    ratioValue: 1200 / 600,
  },
  {
    id: "home.special-offers",
    label: "Homepage Special Offers Strip",
    whereItShows: "Homepage special promotional offer cards",
    mode: "multiple",
    preset: "card",
    recommendedWidth: 800,
    recommendedHeight: 450,
    recommendedSize: "800×450",
    aspectRatio: "16:9",
    ratioValue: 800 / 450,
  },
  {
    id: "shop.top",
    label: "Shop Page Header Banner",
    whereItShows: "Catalog /shop page top banner",
    mode: "single",
    preset: "wide-banner",
    recommendedWidth: 1920,
    recommendedHeight: 350,
    recommendedSize: "1920×350",
    aspectRatio: "16:3",
    ratioValue: 1920 / 350,
  },
  {
    id: "category.top",
    label: "Category Page Header Banner",
    whereItShows: "Top of category listing pages",
    mode: "single",
    preset: "wide-banner",
    recommendedWidth: 1920,
    recommendedHeight: 350,
    recommendedSize: "1920×350",
    aspectRatio: "16:3",
    ratioValue: 1920 / 350,
  },
  {
    id: "brand.top",
    label: "Brand Showcase Header Banner",
    whereItShows: "Top of brand showcase pages",
    mode: "single",
    preset: "wide-banner",
    recommendedWidth: 1920,
    recommendedHeight: 350,
    recommendedSize: "1920×350",
    aspectRatio: "16:3",
    ratioValue: 1920 / 350,
  },
  {
    id: "product.sidebar",
    label: "Product Detail Sidebar Promo",
    whereItShows: "Product detail view sidebar sticky promo",
    mode: "single",
    preset: "card",
    recommendedWidth: 600,
    recommendedHeight: 800,
    recommendedSize: "600×800",
    aspectRatio: "3:4",
    ratioValue: 600 / 800,
  },
  {
    id: "cart.promo",
    label: "Cart Page Promo Banner",
    whereItShows: "Shopping cart checkout incentive banner",
    mode: "single",
    preset: "card",
    recommendedWidth: 800,
    recommendedHeight: 300,
    recommendedSize: "800×300",
    aspectRatio: "8:3",
    ratioValue: 800 / 300,
  },
  {
    id: "checkout.trust",
    label: "Checkout Trust Badges Strip",
    whereItShows: "Checkout page trust and payment reassurance strip",
    mode: "single",
    preset: "card",
    recommendedWidth: 800,
    recommendedHeight: 200,
    recommendedSize: "800×200",
    aspectRatio: "4:1",
    ratioValue: 800 / 200,
  },
  {
    id: "global.announcement",
    label: "Global Top Announcement Bar",
    whereItShows: "Sticky announcement bar above site header",
    mode: "single",
    preset: "icon",
    recommendedWidth: 1200,
    recommendedHeight: 80,
    recommendedSize: "1200×80",
    aspectRatio: "15:1",
    ratioValue: 1200 / 80,
  },
  {
    id: "global.popup",
    label: "Global Promotional Modal Popup",
    whereItShows: "First-visit lightbox / modal offer",
    mode: "single",
    preset: "card",
    recommendedWidth: 800,
    recommendedHeight: 600,
    recommendedSize: "800×600",
    aspectRatio: "4:3",
    ratioValue: 800 / 600,
  },
];

export const PLACEMENT_MAP: Map<string, BannerPlacement> = new Map(
  BANNER_PLACEMENTS.map((p) => [p.id, p])
);

export function getPlacement(id: string): BannerPlacement | undefined {
  return PLACEMENT_MAP.get(id);
}

export function getAllPlacements(): BannerPlacement[] {
  return BANNER_PLACEMENTS;
}
