import { createAccessory, listAccessories, parseAccessoryInput } from "@/lib/accessories-storage";
import { rawToAccessoryInput } from "@/lib/accessory-bridge";
import { isAccessoryCategoryName } from "@/lib/accessory-types";
import { requireAdmin } from "@/lib/auth-guard";
import { deleteRawProduct, loadMergedRawProducts } from "@/lib/products-storage";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Accessories that were created before the product form routed them correctly
 * live in the laptop catalogue. GET lists them; POST moves them to the
 * accessories catalogue (create first, then remove the old record).
 */
async function findMisfiled() {
  const products = await loadMergedRawProducts();
  return products.filter((p) => isAccessoryCategoryName(p.category));
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  const items = await findMisfiled();
  return NextResponse.json({
    count: items.length,
    items: items.map((p) => ({ id: p.id, sku: p.sku, name: p.name, category: p.category })),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager"] });
  if (auth.error) return auth.error;

  const items = await findMisfiled();
  const existing = new Set((await listAccessories()).map((a) => a.sku.toLowerCase()));
  const moved: string[] = [];
  const skipped: Array<{ sku: string; reason: string }> = [];

  for (const raw of items) {
    if (existing.has(raw.sku.toLowerCase())) {
      skipped.push({ sku: raw.sku, reason: "An accessory with this SKU already exists" });
      continue;
    }
    const parsed = parseAccessoryInput(rawToAccessoryInput(raw), "create");
    if ("error" in parsed) {
      skipped.push({ sku: raw.sku, reason: parsed.error });
      continue;
    }
    try {
      await createAccessory(parsed.data);
      await deleteRawProduct(String(raw.id));
      moved.push(raw.sku);
    } catch (err) {
      skipped.push({ sku: raw.sku, reason: err instanceof Error ? err.message : "Failed" });
    }
  }

  return NextResponse.json({ moved, skipped });
}
