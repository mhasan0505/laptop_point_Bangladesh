// ─── Brand Metadata ────────────────────────────────────────────────────────────
// Each brand maps to products in lib/products.ts via the `brand` field.
// Accent colors are raw hex values used only in inline styles (not Tailwind classes)
// so they don't interfere with CSS-variable-based dark mode.
// ──────────────────────────────────────────────────────────────────────────────

export interface BrandMeta {
  /** Matches Product["brand"] exactly for filtering */
  slug: "Dell" | "HP" | "Lenovo" | "Microsoft";
  /** Display name shown on the card */
  name: string;
  /** Short tagline below the brand name */
  tagline: string;
  /** Path relative to /public — small square logo */
  logo: string;
  /** Path relative to /public — wider category banner image */
  banner: string;
  /** Raw hex accent color for brand-specific highlights (inline style only) */
  accent: string;
  /** Softer version for backgrounds (inline style only) */
  accentSoft: string;
}

export const BRAND_META: BrandMeta[] = [
  {
    slug: "Dell",
    name: "Dell",
    tagline: "Latitude & XPS Series",
    logo: "/icons/dell.png",
    banner: "/icons/dell-laptops.png",
    accent: "#007DB8",
    accentSoft: "rgba(0,125,184,0.08)",
  },
  {
    slug: "HP",
    name: "HP",
    tagline: "EliteBook & ProBook",
    logo: "/icons/hp.png",
    banner: "/icons/hp-laptops.png",
    accent: "#0096D6",
    accentSoft: "rgba(0,150,214,0.08)",
  },
  {
    slug: "Lenovo",
    name: "Lenovo",
    tagline: "ThinkPad & IdeaPad",
    logo: "/icons/lenovo.png",
    banner: "/icons/lenovo-laptops.png",
    accent: "#E2231A",
    accentSoft: "rgba(226,35,26,0.07)",
  },
  {
    slug: "Microsoft",
    name: "Microsoft",
    tagline: "Surface Laptop Series",
    logo: "/icons/windows.png",
    banner: "/icons/microsoft-laptops.png",
    accent: "#7FBA00",
    accentSoft: "rgba(127,186,0,0.08)",
  },
];
