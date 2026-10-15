import { NextRequest, NextResponse } from "next/server";
import {
  getPowerDeals,
  getPowerDealConfig,
  savePowerDeal,
  savePowerDealConfig,
  deletePowerDeal,
  reorderPowerDeals,
} from "@/lib/power-deal-data";
import { loadMergedRawProducts } from "@/lib/products-storage";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const [config, deals, rawProducts] = await Promise.all([
      getPowerDealConfig(),
      getPowerDeals(),
      loadMergedRawProducts(),
    ]);

    const availableProducts = rawProducts.map((p) => {
      const salePrice = p.pricing?.sale_price ?? (p as any).price ?? 0;
      const marketPrice = p.pricing?.market_price ?? (p as any).salePrice ?? salePrice;
      const stockQty = typeof p.stock === "number" ? p.stock : (p.stock?.quantity ?? 5);

      return {
        id: String(p.id),
        name: p.name || "",
        slug: (p as any).slug || String(p.id),
        brand: p.brand || null,
        price: salePrice,
        marketPrice,
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ["/placeholder.png"],
        specs: p.specs || {},
        condition: p.condition || "Grade A+ Refurbished",
        stockQty,
        stockStatus: stockQty > 0 ? "In Stock" : "Out of Stock",
      };
    });

    return NextResponse.json({
      config,
      deals,
      availableProducts,
    });
  } catch (err) {
    console.error("[api/admin/power-deal GET] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load power deals" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "marketing"] });
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const updated = await savePowerDealConfig(body);
    return NextResponse.json({ ok: true, config: updated });
  } catch (err) {
    console.error("[api/admin/power-deal PUT] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update campaign config" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "marketing"] });
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    if (!body.name || !body.salePrice) {
      return NextResponse.json(
        { error: "Product name and sale price are required" },
        { status: 400 }
      );
    }

    const created = await savePowerDeal(body);
    return NextResponse.json({ ok: true, deal: created });
  } catch (err) {
    console.error("[api/admin/power-deal POST] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create power deal" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "marketing"] });
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    if (Array.isArray(body.deals)) {
      const updated = await reorderPowerDeals(body.deals);
      return NextResponse.json({ ok: true, deals: updated });
    }

    return NextResponse.json(
      { error: "Invalid payload: deals array expected" },
      { status: 400 }
    );
  } catch (err) {
    console.error("[api/admin/power-deal PATCH] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update power deals" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "marketing"] });
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing deal id" }, { status: 400 });
    }

    const removed = await deletePowerDeal(id);
    if (!removed) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/power-deal DELETE] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete power deal" },
      { status: 500 }
    );
  }
}
