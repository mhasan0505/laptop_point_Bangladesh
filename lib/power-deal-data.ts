import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { type PowerDealItem, CURATED_POWER_DEALS } from "@/components/power-deal/PowerDealTypes";

export interface PowerDealConfigData {
  id?: string;
  title: string;
  subtitle: string;
  savingsHighlight: string;
  targetDate: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerDiscount: string;
  active: boolean;
}

export const DEFAULT_POWER_DEAL_CONFIG: PowerDealConfigData = {
  id: "default",
  title: "THE POWER DEAL",
  subtitle:
    "Authentic commercial laptops, featherlight ultrabooks, and high-performance workstations at verified clearance prices. Tested by engineers with official replacement warranty.",
  savingsHighlight: "Up to ৳30,400 Instant Savings",
  targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 14 * 60 * 1000).toISOString(),
  bannerTitle: "THE POWER DEAL",
  bannerSubtitle:
    "Incredible deals on ASUS, LENOVO, MSI, Acer and HP Devices. Upgrade your tech today!",
  bannerDiscount: "UPTO 25000TK OFF",
  active: true,
};

interface PowerDealStoreFile {
  config: PowerDealConfigData;
  deals: PowerDealItem[];
}

const storeFilePath = path.join(process.cwd(), "app", "data", "power-deals.json");
let inMemoryStore: PowerDealStoreFile | null = null;

export function resetPowerDealsCache(): void {
  inMemoryStore = null;
}

async function readStore(): Promise<PowerDealStoreFile> {
  if (inMemoryStore) return inMemoryStore;

  // 1. Try Prisma ProductOverride store FIRST (authoritative in production/serverless)
  try {
    const record = await prisma.productOverride.findUnique({
      where: { sku: "system:power_deals" },
    });
    if (record && record.data) {
      const parsed = record.data as unknown as PowerDealStoreFile;
      if (parsed && Array.isArray(parsed.deals)) {
        inMemoryStore = parsed;
        return parsed;
      }
    }
  } catch (dbErr) {
    console.warn("[power-deal-data] DB fetch warning:", dbErr);
  }

  // 2. Try file read fallback
  try {
    const raw = await fs.readFile(storeFilePath, "utf-8");
    const parsed = JSON.parse(raw) as PowerDealStoreFile;
    if (parsed && Array.isArray(parsed.deals)) {
      inMemoryStore = parsed;
      return parsed;
    }
  } catch {
    // file does not exist yet or unreadable
  }

  // 3. Default seed
  const seeded: PowerDealStoreFile = {
    config: { ...DEFAULT_POWER_DEAL_CONFIG },
    deals: [...CURATED_POWER_DEALS],
  };

  inMemoryStore = seeded;
  await writeStore(seeded).catch(() => {});
  return seeded;
}

async function writeStore(data: PowerDealStoreFile): Promise<void> {
  inMemoryStore = data;

  // 1. Persist to PostgreSQL (source of truth for serverless instances)
  try {
    await prisma.productOverride.upsert({
      where: { sku: "system:power_deals" },
      create: {
        id: "system:power_deals",
        sku: "system:power_deals",
        data: data as any,
      },
      update: {
        data: data as any,
        isDeleted: false,
      },
    });
  } catch (dbErr) {
    console.error("[power-deal-data] DB persist error:", dbErr);
  }

  // 2. Best-effort write to local file for dev (catches EROFS)
  try {
    await fs.mkdir(path.dirname(storeFilePath), { recursive: true });
    await fs.writeFile(storeFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Read-only filesystem in serverless environments
  }
}

export async function seedPowerDealsIfEmpty() {
  await readStore();
}

export async function getPowerDealConfig(): Promise<PowerDealConfigData> {
  const store = await readStore();
  return store.config || DEFAULT_POWER_DEAL_CONFIG;
}

export async function savePowerDealConfig(config: Partial<PowerDealConfigData>): Promise<PowerDealConfigData> {
  const store = await readStore();
  store.config = {
    ...store.config,
    ...config,
  };
  await writeStore(store);
  return store.config;
}

export async function getPowerDeals(): Promise<PowerDealItem[]> {
  const store = await readStore();
  return store.deals.map((d) => {
    const originalPrice = d.originalPrice || 0;
    const salePrice = d.salePrice || 0;
    const savings = Math.max(0, originalPrice - salePrice);
    const discountPercentage =
      originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;
    return {
      ...d,
      savings,
      discountPercentage,
    };
  });
}

export async function savePowerDeal(deal: Partial<PowerDealItem> & { id?: string }): Promise<PowerDealItem> {
  const store = await readStore();
  const id = deal.id || `power-deal-${Date.now()}`;
  const existingIdx = store.deals.findIndex((d) => d.id === id);

  const fullDeal: PowerDealItem = {
    id,
    name: deal.name || "Power Deal Laptop",
    slug: deal.slug || id,
    brand: deal.brand || "General",
    screen: deal.screen || '14.0" FHD',
    cpu: deal.cpu || "Intel Core i5",
    ram: deal.ram || "16GB RAM",
    storage: deal.storage || "512GB SSD",
    graphics: deal.graphics || null as any,
    image: deal.image || "/placeholder.png",
    originalPrice: Number(deal.originalPrice) || 0,
    salePrice: Number(deal.salePrice) || 0,
    badge: deal.badge || "Sale",
    techBadge: deal.techBadge || null as any,
    condition: deal.condition || "Grade A+ Refurbished",
    stockStatus: deal.stockStatus || "In Stock",
    stockQty: deal.stockQty ?? 5,
    featured: Boolean(deal.featured),
    active: deal.active !== false,
    sortOrder: deal.sortOrder ?? (existingIdx >= 0 ? store.deals[existingIdx].sortOrder : store.deals.length),
  };

  if (existingIdx >= 0) {
    store.deals[existingIdx] = { ...store.deals[existingIdx], ...fullDeal };
  } else {
    store.deals.push(fullDeal);
  }

  await writeStore(store);
  return fullDeal;
}

export async function deletePowerDeal(id: string): Promise<boolean> {
  const store = await readStore();
  const initialLen = store.deals.length;
  store.deals = store.deals.filter((d) => d.id !== id);
  if (store.deals.length !== initialLen) {
    await writeStore(store);
    return true;
  }
  return false;
}

export async function reorderPowerDeals(deals: PowerDealItem[]): Promise<PowerDealItem[]> {
  const store = await readStore();
  store.deals = deals.map((d, idx) => ({ ...d, sortOrder: idx }));
  await writeStore(store);
  return store.deals;
}
