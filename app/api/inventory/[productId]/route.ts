import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// ─── GET /api/inventory/[productId] ──────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const { productId } = await params;
    const record = await prisma.inventory.findUnique({ where: { productId } });
    if (!record) {
      return NextResponse.json(
        { error: "Inventory record not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(record);
  } catch (error) {
    console.error("[GET /api/inventory/[productId]]", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 },
    );
  }
}

// ─── PATCH /api/inventory/[productId] ────────────────────────────────────────
// Body: { quantity?: number } — set absolute stock level
//    OR { delta?: number }   — relative adjust (positive = restock, negative = shrink)
// Optional: { reason?: string, note?: string }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    if (!(await requireAdminSession(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await params;
    const body = (await request.json()) as {
      quantity?: number;
      delta?: number;
      reason?: string;
      note?: string;
    };
    const { quantity, delta, reason = "adjustment", note } = body;

    if (quantity === undefined && delta === undefined) {
      return NextResponse.json(
        {
          error:
            "Provide either 'quantity' (absolute set) or 'delta' (relative adjustment)",
        },
        { status: 400 },
      );
    }

    const existing = await prisma.inventory.findUnique({
      where: { productId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Inventory record not found" },
        { status: 404 },
      );
    }

    const newQuantity =
      quantity !== undefined ? quantity : existing.quantity + delta!;

    if (newQuantity < 0) {
      return NextResponse.json(
        { error: "Stock cannot go below 0" },
        { status: 400 },
      );
    }

    const [updated] = await prisma.$transaction([
      prisma.inventory.update({
        where: { productId },
        data: { quantity: newQuantity },
      }),
      prisma.inventoryLog.create({
        data: {
          productId,
          sku: existing.sku,
          delta: newQuantity - existing.quantity,
          reason,
          note: note ?? `Stock adjusted: ${existing.quantity} → ${newQuantity}`,
        },
      }),
    ]);

    // Next.js 16+ requires a second profile argument for revalidateTag in route handlers.
    // Passing { expire: 0 } signals immediate cache eviction rather than SWR background refresh.
    // See official migration guide: https://nextjs.org/docs/messages/revalidate-tag-single-arg
    try {
      revalidateTag("products", { expire: 0 });
    } catch {
      // Tag revalidation may not be available in all contexts
    }

    try {
      const { findRawProductByIdOrSku } = await import("@/lib/products-storage");
      const { mapRawToProduct } = await import("@/app/data/data");
      const rawProd = await findRawProductByIdOrSku(productId);
      if (rawProd) {
        const mapped = mapRawToProduct(rawProd);
        if (mapped.slug) {
          revalidatePath(`/product/${mapped.slug}`);
        }
      }
    } catch {
      // Ignore if dynamic import fails
    }

    revalidatePath("/product/[slug]", "page");
    revalidatePath("/shop");
    revalidatePath("/");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/inventory/[productId]]", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 },
    );
  }
}
