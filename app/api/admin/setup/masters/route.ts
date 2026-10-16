import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { loadMergedRawProducts } from "@/lib/products-storage";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

interface MasterBrand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  website?: string | null;
  sortOrder: number;
  active: boolean;
  _count?: { products: number };
}

interface MasterCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  image?: string | null;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
  sortOrder: number;
  active: boolean;
  _count?: { products: number; children: number };
}

interface MastersDataFile {
  brands: MasterBrand[];
  categories: MasterCategory[];
}

import { TtlCache } from "@/lib/cache/ttl-cache";

const mastersFilePath = path.join(process.cwd(), "app", "data", "catalog-masters.json");
const mastersCache = new TtlCache<MastersDataFile>();

const DEFAULT_BRANDS: MasterBrand[] = [
  { id: "brand-hp", name: "HP", slug: "hp", logo: "/Hero/HP.png", website: "https://hp.com", sortOrder: 0, active: true },
  { id: "brand-dell", name: "Dell", slug: "dell", logo: "/Hero/dell.png", website: "https://dell.com", sortOrder: 1, active: true },
  { id: "brand-lenovo", name: "Lenovo", slug: "lenovo", logo: "/Hero/lenovo.png", website: "https://lenovo.com", sortOrder: 2, active: true },
  { id: "brand-microsoft", name: "Microsoft", slug: "microsoft", logo: "/Hero/Microsoft.png", website: "https://microsoft.com", sortOrder: 3, active: true },
  { id: "brand-apple", name: "Apple", slug: "apple", logo: null, website: "https://apple.com", sortOrder: 4, active: true },
  { id: "brand-asus", name: "Asus", slug: "asus", logo: null, website: "https://asus.com", sortOrder: 5, active: true },
  { id: "brand-acer", name: "Acer", slug: "acer", logo: null, website: "https://acer.com", sortOrder: 6, active: true },
  { id: "brand-msi", name: "MSI", slug: "msi", logo: null, website: "https://msi.com", sortOrder: 7, active: true },
];

const DEFAULT_CATEGORIES: MasterCategory[] = [
  { id: "cat-laptops", name: "All Laptops", slug: "laptops", icon: "Laptop", sortOrder: 0, active: true },
  { id: "cat-business", name: "Business Ultrabooks", slug: "business-ultrabooks", icon: "Briefcase", sortOrder: 1, active: true },
  { id: "cat-workstations", name: "Mobile Workstations", slug: "workstations", icon: "Cpu", sortOrder: 2, active: true },
  { id: "cat-gaming", name: "Gaming Laptops", slug: "gaming-laptops", icon: "Gamepad2", sortOrder: 3, active: true },
  { id: "cat-touch", name: "2-in-1 Touch Laptops", slug: "touch-laptops", icon: "Tablet", sortOrder: 4, active: true },
  { id: "cat-accessories", name: "Accessories", slug: "accessories", icon: "Cable", sortOrder: 5, active: true },
];

export function resetMastersCache(): void {
  mastersCache.invalidate();
}

async function readMasters(): Promise<MastersDataFile> {
  const cached = mastersCache.get();
  if (cached) return cached;

  // 1. Try DB ProductOverride FIRST (authoritative in production/serverless)
  try {
    const rec = await prisma.productOverride.findUnique({
      where: { sku: "system:catalog_masters" },
    });
    if (rec && rec.data) {
      const parsed = rec.data as unknown as MastersDataFile;
      if (parsed && Array.isArray(parsed.brands) && Array.isArray(parsed.categories)) {
        mastersCache.set(parsed);
        return parsed;
      }
    }
  } catch (dbErr) {
    console.warn("[readMasters] DB fetch warning:", dbErr);
  }

  // 2. Try local file fallback
  try {
    const raw = await fs.readFile(mastersFilePath, "utf-8");
    const parsed = JSON.parse(raw) as MastersDataFile;
    if (parsed && Array.isArray(parsed.brands) && Array.isArray(parsed.categories)) {
      mastersCache.set(parsed);
      return parsed;
    }
  } catch {
    // File not created yet
  }

  // 3. Fallback to default seeded
  const fallback: MastersDataFile = {
    brands: [...DEFAULT_BRANDS],
    categories: [...DEFAULT_CATEGORIES],
  };
  mastersCache.set(fallback);
  await writeMasters(fallback).catch(() => {});
  return fallback;
}

async function writeMasters(data: MastersDataFile): Promise<void> {
  mastersCache.set(data);


  // 1. Persist to PostgreSQL (source of truth for serverless instances)
  try {
    await prisma.productOverride.upsert({
      where: { sku: "system:catalog_masters" },
      create: {
        id: "system:catalog_masters",
        sku: "system:catalog_masters",
        data: data as any,
      },
      update: {
        data: data as any,
        isDeleted: false,
      },
    });
  } catch (dbErr) {
    console.error("[writeMasters] DB persist failed:", dbErr);
  }

  // 2. Best-effort write to local file (safely catches EROFS)
  try {
    await fs.mkdir(path.dirname(mastersFilePath), { recursive: true });
    await fs.writeFile(mastersFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Read-only filesystem in serverless
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const masters = await readMasters();
    const products = await loadMergedRawProducts();

    // Compute live product counts per brand
    const brandCounts: Record<string, number> = {};
    for (const p of products) {
      const bKey = (p.brand || "").toLowerCase().trim();
      brandCounts[bKey] = (brandCounts[bKey] || 0) + 1;
    }

    const brandsWithCounts = masters.brands.map((b) => {
      const bName = (b.name || "").toLowerCase().trim();
      const bSlug = (b.slug || "").toLowerCase().trim();
      return {
        ...b,
        _count: {
          products: brandCounts[bName] || brandCounts[bSlug] || 0,
        },
      };
    });

    const categoriesWithCounts = masters.categories.map((c) => {
      const cName = (c.name || "").toLowerCase().trim();
      return {
        ...c,
        _count: {
          products: products.filter((p) => (p.category || "").toLowerCase().trim() === cName).length,
          children: 0,
        },
      };
    });

    return NextResponse.json({
      brands: brandsWithCounts,
      categories: categoriesWithCounts,
    });
  } catch (err) {
    console.error("[api/admin/setup/masters GET] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load catalog masters" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager"] });
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { entity, action, data } = body;

    const masters = await readMasters();

    if (entity === "brand") {
      if (action === "create") {
        const newBrand: MasterBrand = {
          id: `brand-${Date.now()}`,
          name: data.name,
          slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
          logo: data.logo || null,
          website: data.website || null,
          sortOrder: data.sortOrder ?? masters.brands.length,
          active: data.active !== false,
        };
        masters.brands.push(newBrand);
      } else if (action === "update") {
        const idx = masters.brands.findIndex((b) => b.id === data.id);
        if (idx >= 0) {
          masters.brands[idx] = { ...masters.brands[idx], ...data };
        }
      } else if (action === "delete") {
        masters.brands = masters.brands.filter((b) => b.id !== data.id);
      }
    } else if (entity === "category") {
      if (action === "create") {
        const newCat: MasterCategory = {
          id: `cat-${Date.now()}`,
          name: data.name,
          slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
          icon: data.icon || null,
          image: data.image || null,
          parentId: data.parentId || null,
          sortOrder: data.sortOrder ?? masters.categories.length,
          active: data.active !== false,
        };
        masters.categories.push(newCat);
      } else if (action === "update") {
        const idx = masters.categories.findIndex((c) => c.id === data.id);
        if (idx >= 0) {
          masters.categories[idx] = { ...masters.categories[idx], ...data };
        }
      } else if (action === "delete") {
        masters.categories = masters.categories.filter((c) => c.id !== data.id);
      }
    }

    await writeMasters(masters);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[api/admin/setup/masters POST] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update masters" },
      { status: 500 }
    );
  }
}
