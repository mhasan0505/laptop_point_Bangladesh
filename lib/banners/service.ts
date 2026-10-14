import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";

export interface BannerAssetInfo {
  id?: string;
  storageKey?: string;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
  variants?: unknown;
  [key: string]: unknown;
}

export interface BannerThemeInfo {
  discount?: string;
  badgeText?: string;
  badgeColor?: string;
  bgGradient?: string;
  [key: string]: unknown;
}

export interface LiveBannerItem {
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
  theme: BannerThemeInfo | null;
  startsAt: Date | null;
  endsAt: Date | null;
  sortOrder: number;
  desktopAsset?: BannerAssetInfo | null;
  mobileAsset?: BannerAssetInfo | null;
  targetBrand?: { id: string; name: string; slug: string } | null;
  targetCategory?: { id: string; name: string; slug: string } | null;
}

import { getBanners } from "./storage";

async function queryLiveBannersDirect(
  placement: string,
  brand?: string,
  category?: string
): Promise<LiveBannerItem[]> {
  try {
    const banners = await getBanners(placement);
    const now = new Date();

    const live = banners.filter((b) => {
      if (!b.active) return false;
      if (b.startsAt && new Date(b.startsAt) > now) return false;
      if (b.endsAt && new Date(b.endsAt) < now) return false;
      if (brand && b.targetBrandId && b.targetBrandId.toLowerCase() !== brand.toLowerCase()) {
        return false;
      }
      if (category && b.targetCategoryId && b.targetCategoryId.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
      return true;
    });

    return live.map((b) => ({
      id: b.id,
      placement: b.placement,
      title: b.title,
      desktopAssetId: b.desktopAssetId,
      desktopImageUrl: b.desktopImageUrl,
      mobileAssetId: b.mobileAssetId,
      mobileImageUrl: b.mobileImageUrl,
      alt: b.alt,
      headline: b.headline,
      subtext: b.subtext,
      ctaLabel: b.ctaLabel,
      linkHref: b.linkHref,
      theme: b.theme as BannerThemeInfo | null,
      startsAt: b.startsAt ? new Date(b.startsAt) : null,
      endsAt: b.endsAt ? new Date(b.endsAt) : null,
      sortOrder: b.sortOrder,
    }));
  } catch (err) {
    console.error(`Error querying banners for placement "${placement}":`, err);
    return [];
  }
}

export const getLiveBannersCached = unstable_cache(
  async (placement: string, brand?: string, category?: string) => {
    return queryLiveBannersDirect(placement, brand, category);
  },
  ["live-banners-cache"],
  {
    tags: ["banners"],
    revalidate: 60,
  }
);

export async function getLiveBanners(
  placement: string,
  brand?: string,
  category?: string
): Promise<LiveBannerItem[]> {
  try {
    return await getLiveBannersCached(placement, brand, category);
  } catch {
    // Fallback directly to DB if outside next.js request cache lifecycle
    return queryLiveBannersDirect(placement, brand, category);
  }
}
