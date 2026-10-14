export interface SectionDefinition {
  id: string;
  label: string;
  description: string;
  defaultVisible: boolean;
  defaultOrder: number;
  bannerPlacement?: string;
}

export const HOMEPAGE_SECTION_REGISTRY: SectionDefinition[] = [
  {
    id: "hero",
    label: "Hero Carousel",
    description: "Main full-width banner carousel showcasing primary offers",
    defaultVisible: true,
    defaultOrder: 1,
    bannerPlacement: "home.hero",
  },
  {
    id: "prime-showcase",
    label: "Prime Showcase",
    description: "14-item interactive category and brand icon grid",
    defaultVisible: true,
    defaultOrder: 2,
  },
  {
    id: "power-deal",
    label: "The Power Deal Section",
    description: "Promotional banner & featured flash deal laptop grid",
    defaultVisible: true,
    defaultOrder: 3,
    bannerPlacement: "home.power-deal",
  },
  {
    id: "surface-banner",
    label: "Microsoft Surface Banner",
    description: "Surface feature showcase promotion banner",
    defaultVisible: true,
    defaultOrder: 4,
    bannerPlacement: "home.surface",
  },
  {
    id: "surface-showcase",
    label: "Microsoft Surface Showcase",
    description: "Horizontal grid of Microsoft Surface laptop products",
    defaultVisible: true,
    defaultOrder: 5,
  },
  {
    id: "apple-showcase",
    label: "Apple Ecosystem Showcase",
    description: "Dual-row matrix displaying MacBook, iMac, and Apple products",
    defaultVisible: true,
    defaultOrder: 6,
    bannerPlacement: "home.apple",
  },
  {
    id: "accessories-banner",
    label: "Accessories Cyan Banner",
    description: "Graphic promotion banner for laptop accessories & monitors",
    defaultVisible: true,
    defaultOrder: 7,
    bannerPlacement: "home.accessories",
  },
  {
    id: "bottom-cta",
    label: "Bottom Call-to-Action Strip",
    description: "Hotline, consultation assistance, and store visit banner",
    defaultVisible: true,
    defaultOrder: 8,
    bannerPlacement: "home.bottom-cta",
  },
];

export interface ConfiguredHomepageSection {
  id: string;
  label: string;
  visible: boolean;
  sortOrder: number;
  heading?: string;
  subheading?: string;
  bannerPlacement?: string;
}

export function getDefaultHomepageSections(): ConfiguredHomepageSection[] {
  return HOMEPAGE_SECTION_REGISTRY.map((def) => ({
    id: def.id,
    label: def.label,
    visible: def.defaultVisible,
    sortOrder: def.defaultOrder,
    bannerPlacement: def.bannerPlacement,
  }));
}
