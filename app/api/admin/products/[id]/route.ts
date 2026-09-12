import { AdminProduct } from "@/lib/admin-data";
import { prisma } from "@/lib/prisma";
import { RawProduct } from "@/types/raw-product";
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { adminToRawProduct, rawToAdminProduct, syncSkuToManifest } from "../route";

const productsFilePath = path.join(process.cwd(), "app", "data", "products.json");

async function loadProductsJson(): Promise<RawProduct[]> {
  try {
    const raw = await fs.readFile(productsFilePath, "utf-8");
    return JSON.parse(raw) as RawProduct[];
  } catch (error) {
    console.error("[loadProductsJson error]", error);
    return [];
  }
}

async function saveProductsJson(products: RawProduct[]): Promise<void> {
  const json = JSON.stringify(products, null, 2);
  await fs.writeFile(productsFilePath, json, "utf-8");
}

// ─── GET /api/admin/products/[id] ─────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const rawProducts = await loadProductsJson();

    const product = rawProducts.find(
      (p) => String(p.id) === id || p.sku.toLowerCase() === id.toLowerCase(),
    );

    if (!product) {
      return NextResponse.json(
        { error: `Product with ID ${id} not found` },
        { status: 404 },
      );
    }

    // Check if Postgres inventory has current stock
    let currentStock = product.stock?.quantity;
    try {
      const inv = await prisma.inventory.findFirst({
        where: { OR: [{ productId: String(product.id) }, { sku: product.sku }] },
      });
      if (inv) {
        currentStock = inv.quantity;
      }
    } catch {
      // Ignore DB error
    }

    return NextResponse.json(rawToAdminProduct(product, currentStock));
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

    const rawProducts = await loadProductsJson();
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
    rawProducts[index] = updatedRaw;

    await saveProductsJson(rawProducts);
    await syncSkuToManifest(updatedRaw.sku, updatedRaw.images);

    // Sync into Postgres inventory table
    try {
      await prisma.inventory.upsert({
        where: { sku: updatedRaw.sku },
        update: {
          name: updatedRaw.name,
          quantity: updatedRaw.stock.quantity,
        },
        create: {
          productId: String(numericId),
          sku: updatedRaw.sku,
          name: updatedRaw.name,
          quantity: updatedRaw.stock.quantity,
        },
      });
    } catch (dbErr) {
      console.warn("[Prisma inventory update warning]", dbErr);
    }

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
    const rawProducts = await loadProductsJson();

    const index = rawProducts.findIndex(
      (p) => String(p.id) === id || p.sku.toLowerCase() === id.toLowerCase(),
    );

    if (index === -1) {
      return NextResponse.json(
        { error: `Product with ID ${id} not found` },
        { status: 404 },
      );
    }

    const deleted = rawProducts.splice(index, 1)[0];
    await saveProductsJson(rawProducts);

    // Clean up inventory if desired
    try {
      await prisma.inventory.deleteMany({
        where: { OR: [{ productId: String(deleted.id) }, { sku: deleted.sku }] },
      });
    } catch {
      // Ignore if not present
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
