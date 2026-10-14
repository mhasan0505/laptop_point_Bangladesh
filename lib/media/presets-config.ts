export interface MediaPresetVariantConfig {
  width: number;
  height?: number;
  fit?: "inside" | "cover" | "contain";
}

export interface MediaPresetDefinition {
  name: string;
  label: string;
  description: string;
  widths: number[];
  formats: ("webp" | "avif")[];
}

export const MEDIA_PRESETS: Record<string, MediaPresetDefinition> = {
  hero: {
    name: "hero",
    label: "Hero Carousel",
    description: "Ultra-wide hero slides (2560px & 1920px wide)",
    widths: [2560, 1920],
    formats: ["webp", "avif"],
  },
  "wide-banner": {
    name: "wide-banner",
    label: "Wide Section Banner",
    description: "Wide desktop banners (1920px & 1280px wide)",
    widths: [1920, 1280],
    formats: ["webp", "avif"],
  },
  "mobile-banner": {
    name: "mobile-banner",
    label: "Mobile Banner",
    description: "Mobile viewport optimized banner (828px wide)",
    widths: [828],
    formats: ["webp", "avif"],
  },
  card: {
    name: "card",
    label: "Card / Deal Promo",
    description: "Card or side promotion banner (800px wide)",
    widths: [800],
    formats: ["webp", "avif"],
  },
  product: {
    name: "product",
    label: "Product Image",
    description: "High-resolution product showcase (1600px wide)",
    widths: [1600],
    formats: ["webp", "avif"],
  },
  icon: {
    name: "icon",
    label: "Icon / Badge",
    description: "Compact icon or badge (256px wide)",
    widths: [256],
    formats: ["webp", "avif"],
  },
};
