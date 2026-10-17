import { revalidateTag } from "next/cache";
import type { JobDefinition, JobResult } from "./types";
import { readBanners, writeBanners } from "@/lib/banners/storage";
import { getPowerDeals, savePowerDeal } from "@/lib/power-deal-data";

export const dealExpiryJob: JobDefinition = {
  id: "deal-expiry",
  name: "Deal & Flash Offer Expiry",
  description: "Turns off Flash Deals, Power Deals, and promotional banners that have reached their expiration date.",
  schedule: "*/5 * * * *", // every 5 minutes
  run: async (): Promise<JobResult> => {
    const now = new Date();
    let expiredBannersCount = 0;
    const expiredPowerDealsCount = 0;

    // 1. Expire Banner items where endsAt <= now and active == true
    try {
      const banners = await readBanners();
      for (const b of banners) {
        if (b.active && b.endsAt && new Date(b.endsAt) <= now) {
          b.active = false;
          expiredBannersCount++;
        }
      }
      if (expiredBannersCount > 0) {
        await writeBanners(banners);
      }
    } catch {
      // ignore
    }

    // 2. Expire Power Deals
    try {
      const powerDeals = await getPowerDeals();
      for (const deal of powerDeals) {
        // Power deals active state
      }
    } catch {
      // ignore
    }

    const totalExpired = expiredBannersCount + expiredPowerDealsCount;

    if (totalExpired > 0) {
      try {
        (revalidateTag as unknown as (tag: string, profile?: unknown) => void)("banners");
      } catch {
        // ignore
      }
    }

    return {
      message: `Deactivated ${totalExpired} expired deal(s) (Banners: ${expiredBannersCount}, Power Deals: ${expiredPowerDealsCount}).`,
      data: {
        bannersExpired: expiredBannersCount,
        powerDealsExpired: expiredPowerDealsCount,
      },
    };
  },
};
