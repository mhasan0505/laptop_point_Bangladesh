import { AdminProduct } from "@/lib/admin-data";
import {
  deleteRawProduct,
  findRawProductByIdOrSku,
  loadMergedRawProducts,
  saveRawProduct,
} from "@/lib/products-storage";
import { NextRequest, NextResponse } from "next/server";
import { adminToRawProduct, rawToAdminProduct } from "../route";

// ─── GET /api/admin/products/[id] ─────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const product = await findRawProductByIdOrSku(id);

    if (!product) {
      return NextResponse.json(
        { error: `Product with ID ${id} not found` },
        { status: 404 },
      );
    }

    return NextResponse.json(rawToAdminProduct(product, product.stock?.quantity));
  } catch (error) {
    console.error("[GET /api/admin/products/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

// ─── PUT /api/admin/products/[id] ─────────────────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<AdminProduct>;

    const rawProducts = await loadMergedRawProducts();
    const index = rawProducts.findIndex(
      (p) => String(p.id) === id || p.sku.toLowerCase() === id.toLowerCase(),
    );

    if (index === -1) {
      return NextResponse.json(
        { error: `Product with ID ${id} not found` },
        { status: 404 },
      );
    }

    const existing = rawProducts[index];

    // If SKU is being updated, check that it doesn't conflict with another product
    if (body.sku && body.sku.trim().toLowerCase() !== existing.sku.toLowerCase()) {
      const conflict = rawProducts.find(
        (p, idx) =>
          idx !== index &&
          p.sku.toLowerCase() === body.sku!.trim().toLowerCase(),
      );
      if (conflict) {
        return NextResponse.json(
          { error: `A product with SKU "${body.sku.trim()}" already exists` },
          { status: 409 },
        );
      }
    }

    const numericId = typeof existing.id === "number" ? existing.id : Number(existing.id) || 1;

    // Merge existing with updates
    const existingAdmin = rawToAdminProduct(existing);
    const mergedAdmin: AdminProduct = {
      ...existingAdmin,
      ...body,
      id: String(numericId),
      specs: {
        ...existingAdmin.specs,
        ...(body.specs || {}),
        displayDetails: {
          ...(existingAdmin.specs?.displayDetails || {}),
          ...(body.specs?.displayDetails || {}),
        },
      },
    };

    const updatedRaw = adminToRawProduct(mergedAdmin, numericId);

    // Save to PostgreSQL (ProductOverride and Inventory) + safe local sync
    await saveRawProduct(updatedRaw);

    return NextResponse.json(rawToAdminProduct(updatedRaw));
  } catch (error) {
    console.error("[PUT /api/admin/products/[id]]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product" },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/admin/products/[id] ──────────────────────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deleted = await deleteRawProduct(id);

    if (!deleted) {
      return NextResponse.json(
        { error: `Product with ID ${id} not found` },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("[DELETE /api/admin/products/[id]]", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
