import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export interface BannerRecord {
  id: string;
  placement: string;
  title: string;
  desktopAssetId: string | null;
  desktopImageUrl: string | null;
  mobileAssetId: string | null;
  mobileImageUrl: string | null;
  alt: string;
  headline: string | null;
  subtext: string | null;
  ctaLabel: string | null;
  linkHref: string | null;
  theme: Record<string, unknown> | null;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  sortOrder: number;
  targetBrandId: string | null;
  targetCategoryId: string | null;
  status?: "live" | "scheduled" | "expired" | "off";
  metrics?: {
    impressions: number;
    clicks: number;
    ctr: string;
  };
}

const DEFAULT_BANNERS: BannerRecord[] = [
  {
    id: "hero-hp-slide",
    placement: "home.hero",
    title: "HP EliteBook & ProBook Series",
    desktopAssetId: null,
    desktopImageUrl: "/Hero/HP.png",
    mobileAssetId: null,
    mobileImageUrl: "/Hero/HP.png",
    alt: "HP EliteBook Clearance Deals",
    headline: "Premium Corporate HP Laptops",
    subtext: "Tested by certified engineers with replacement guarantee.",
    ctaLabel: "Explore HP Deals",
    linkHref: "/shop?brand=HP",
    theme: { badgeText: "Best Seller", badgeColor: "blue", discount: "Up to 25% OFF" },
    startsAt: null,
    endsAt: null,
    active: true,
    sortOrder: 0,
    targetBrandId: "hp",
    targetCategoryId: null,
    status: "live",
  },
  {
    id: "hero-dell-slide",
    placement: "home.hero",
    title: "Dell Latitude & XPS Ultrabooks",
    desktopAssetId: null,
    desktopImageUrl: "/Hero/dell.png",
    mobileAssetId: null,
    mobileImageUrl: "/Hero/dell.png",
    alt: "Dell Latitude Corporate Ultrabooks",
    headline: "Engineered for Enterprise Endurance",
    subtext: "Magnesium-alloy chassis with FHD touch displays.",
    ctaLabel: "Shop Dell",
    linkHref: "/shop?brand=Dell",
    theme: { badgeText: "Business Choice", badgeColor: "slate", discount: "Save ৳12,000" },
    startsAt: null,
    endsAt: null,
    active: true,
    sortOrder: 1,
    targetBrandId: "dell",
    targetCategoryId: null,
    status: "live",
  },
  {
    id: "hero-lenovo-slide",
    placement: "home.hero",
    title: "Lenovo ThinkPad Workstations",
    desktopAssetId: null,
    desktopImageUrl: "/Hero/lenovo.png",
    mobileAssetId: null,
    mobileImageUrl: "/Hero/lenovo.png",
    alt: "Lenovo ThinkPad Series",
    headline: "Legendary Keyboards & Durability",
    subtext: "Mil-Spec tested business laptops ready for heavy workflows.",
    ctaLabel: "View ThinkPads",
    linkHref: "/shop?brand=Lenovo",
    theme: { badgeText: "Workstation", badgeColor: "red", discount: "Flash Drop" },
    startsAt: null,
    endsAt: null,
    active: true,
    sortOrder: 2,
    targetBrandId: "lenovo",
    targetCategoryId: null,
    status: "live",
  },
  {
    id: "hero-microsoft-slide",
    placement: "home.hero",
    title: "Microsoft Surface Studio & Laptop",
    desktopAssetId: null,
    desktopImageUrl: "/Hero/Microsoft.png",
    mobileAssetId: null,
    mobileImageUrl: "/Hero/Microsoft.png",
    alt: "Microsoft Surface Touchscreen Laptops",
    headline: "PixelSense Touch & Ultra-Portable Design",
    subtext: "Vibrant high-res displays in featherlight form factors.",
    ctaLabel: "Discover Surface",
    linkHref: "/shop?brand=Microsoft",
    theme: { badgeText: "Ultra Light", badgeColor: "cyan", discount: "Special Offer" },
    startsAt: null,
    endsAt: null,
    active: true,
    sortOrder: 3,
    targetBrandId: "microsoft",
    targetCategoryId: null,
    status: "live",
  },
  {
    id: "flash-deal-1",
    placement: "home.flash-deal",
    title: "Flash Deal Weekend Clearance",
    desktopAssetId: null,
    desktopImageUrl: "/Hero_Image.png",
    mobileAssetId: null,
    mobileImageUrl: "/Hero_Image.png",
    alt: "Flash Deal Clearance",
    headline: "Limited Stock Flash Drop",
    subtext: "Grade A+ laptops at verified clearance pricing.",
    ctaLabel: "Grab Now",
    linkHref: "/deals",
    theme: { badgeText: "Flash Deal", badgeColor: "rose" },
    startsAt: null,
    endsAt: null,
    active: true,
    sortOrder: 0,
    targetBrandId: null,
    targetCategoryId: null,
    status: "live",
  },
];

const bannersFilePath = path.join(process.cwd(), "app", "data", "banners.json");
let inMemoryBanners: BannerRecord[] | null = null;

function computeBannerStatus(b: BannerRecord): "live" | "scheduled" | "expired" | "off" {
  if (!b.active) return "off";
  const now = new Date();
  if (b.startsAt && new Date(b.startsAt) > now) return "scheduled";
  if (b.endsAt && new Date(b.endsAt) < now) return "expired";
  return "live";
}

export async function readBanners(): Promise<BannerRecord[]> {
  if (inMemoryBanners) {
    return inMemoryBanners.map((b) => ({ ...b, status: computeBannerStatus(b) }));
  }

  // 1. Try local JSON file
  try {
    const raw = await fs.readFile(bannersFilePath, "utf-8");
    const parsed = JSON.parse(raw) as BannerRecord[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      inMemoryBanners = parsed;
      return parsed.map((b) => ({ ...b, status: computeBannerStatus(b) }));
    }
  } catch {
    // file not created yet
  }

  // 2. Try DB ProductOverride
  try {
    const record = await prisma.productOverride.findUnique({
      where: { sku: "system:banners" },
    });
    if (record && record.data && Array.isArray(record.data)) {
      inMemoryBanners = record.data as unknown as BannerRecord[];
      return inMemoryBanners.map((b) => ({ ...b, status: computeBannerStatus(b) }));
    }
  } catch {
    // db fallback
  }

  // 3. Fallback to default seeded banners
  inMemoryBanners = [...DEFAULT_BANNERS];
  await writeBanners(inMemoryBanners).catch(() => {});
  return inMemoryBanners.map((b) => ({ ...b, status: computeBannerStatus(b) }));
}

export async function writeBanners(banners: BannerRecord[]): Promise<void> {
  inMemoryBanners = banners;

  try {
    await fs.mkdir(path.dirname(bannersFilePath), { recursive: true });
    await fs.writeFile(bannersFilePath, JSON.stringify(banners, null, 2), "utf-8");
  } catch {
    // Serverless filesystem read-only safe
  }

  try {
    await prisma.productOverride.upsert({
      where: { sku: "system:banners" },
      create: {
        id: "system:banners",
        sku: "system:banners",
        data: banners as any,
      },
      update: {
        data: banners as any,
      },
    });
  } catch {
    // db fallback ignore
  }
}

export async function getBanners(placement?: string): Promise<BannerRecord[]> {
  const all = await readBanners();
  if (!placement) return all;
  return all
    .filter((b) => b.placement === placement)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveBanner(banner: Partial<BannerRecord> & { id?: string }): Promise<BannerRecord> {
  const all = await readBanners();
  const id = banner.id || `banner-${Date.now()}`;
  const existingIdx = all.findIndex((b) => b.id === id);

  const full: BannerRecord = {
    id,
    placement: banner.placement || "home.hero",
    title: banner.title || "Banner",
    desktopAssetId: banner.desktopAssetId ?? null,
    desktopImageUrl: banner.desktopImageUrl ?? null,
    mobileAssetId: banner.mobileAssetId ?? null,
    mobileImageUrl: banner.mobileImageUrl ?? null,
    alt: banner.alt || banner.title || "",
    headline: banner.headline ?? null,
    subtext: banner.subtext ?? null,
    ctaLabel: banner.ctaLabel ?? "Shop Now",
    linkHref: banner.linkHref ?? "/shop",
    theme: (banner.theme as Record<string, unknown>) || null,
    startsAt: banner.startsAt ?? null,
    endsAt: banner.endsAt ?? null,
    active: banner.active !== false,
    sortOrder: banner.sortOrder ?? (existingIdx >= 0 ? all[existingIdx].sortOrder : all.length),
    targetBrandId: banner.targetBrandId ?? null,
    targetCategoryId: banner.targetCategoryId ?? null,
  };

  full.status = computeBannerStatus(full);

  if (existingIdx >= 0) {
    all[existingIdx] = full;
  } else {
    all.push(full);
  }

  await writeBanners(all);
  return full;
}

export async function deleteBanner(id: string): Promise<boolean> {
  const all = await readBanners();
  const initialLen = all.length;
  const filtered = all.filter((b) => b.id !== id);
  if (filtered.length !== initialLen) {
    await writeBanners(filtered);
    return true;
  }
  return false;
}

export async function reorderBanners(orders: Array<{ id: string; sortOrder: number }>): Promise<void> {
  const all = await readBanners();
  const orderMap = new Map(orders.map((o) => [o.id, o.sortOrder]));
  all.forEach((b) => {
    if (orderMap.has(b.id)) {
      b.sortOrder = orderMap.get(b.id)!;
    }
  });
  all.sort((a, b) => a.sortOrder - b.sortOrder);
  await writeBanners(all);
}
