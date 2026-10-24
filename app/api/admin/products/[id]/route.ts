import { AdminProduct } from "@/lib/admin-data";
import {
  AccessoryConflictError,
  createAccessory,
  deleteAccessory,
  getAccessoryByIdOrSlug,
  listAccessories,
  parseAccessoryInput,
  updateAccessory,
} from "@/lib/accessories-storage";
import { accessoryToAdminProduct, adminToAccessoryInput, isAccessoryId } from "@/lib/accessory-bridge";
import { isAccessoryCategoryName } from "@/lib/accessory-types";
import { requireAdmin } from "@/lib/auth-guard";
import {
  allocateProductId,
  deleteRawProduct,
  findRawProductByIdOrSku,
  loadMergedRawProducts,
  saveRawProduct,
} from "@/lib/products-storage";
import { NextRequest, NextResponse } from "next/server";
import {
  adminToRawProduct,
  rawToAdminProduct,
  validateAdminProductPayload,
} from "../route";
import { logger } from "@/lib/logger";

type Ctx = { params: Promise<{ id: string }> };

// ─── GET /api/admin/products/[id] ─────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;

    if (isAccessoryId(id)) {
      const acc = await getAccessoryByIdOrSlug(id);
      if (!acc) return NextResponse.json({ error: `Product with ID ${id} not found` }, { status: 404 });
      return NextResponse.json(accessoryToAdminProduct(acc));
    }

    const product = await findRawProductByIdOrSku(id);
    if (!product) {
      return NextResponse.json({ error: `Product with ID ${id} not found` }, { status: 404 });
    }
    return NextResponse.json(rawToAdminProduct(product, product.stock?.quantity));
  } catch (error) {
    console.error("[GET /api/admin/products/[id]]", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// ─── PUT /api/admin/products/[id] ─────────────────────────────────────────────
export async function PUT(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "marketing"] });
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = (await request.json().catch(() => null)) as Partial<AdminProduct> | null;
    if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

    const existingAcc = isAccessoryId(id) ? await getAccessoryByIdOrSlug(id) : null;
    const wantsAccessory = body.category !== undefined ? isAccessoryCategoryName(body.category) : undefined;

    // Stock-only or partial updates (e.g. the stock dialog) skip the full-payload checks.
    const isFullPayload = body.name !== undefined && body.price !== undefined;
    if (isFullPayload) {
      const invalid = validateAdminProductPayload(body);
      if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
    }

    // ── Existing item is an accessory ────────────────────────────────────────
    if (existingAcc) {
      // Category changed to a laptop category: move it to the laptop catalogue.
      if (wantsAccessory === false) {
        const merged = { ...accessoryToAdminProduct(existingAcc), ...body } as AdminProduct;
        const numericId = await allocateProductId();
        const raw = adminToRawProduct(merged, numericId);
        // Write the new record first so a failure can never lose the item.
        await saveRawProduct(raw);
        await deleteAccessory(existingAcc.id);
        logger.logAdminAudit({
          actorEmail: auth.user.email,
          actorRole: auth.user.role,
          action: "product_converted_to_laptop",
          targetId: String(numericId),
          targetType: "product",
          details: { previousAccessoryId: existingAcc.id, sku: raw.sku },
        });
        return NextResponse.json(rawToAdminProduct(raw));
      }

      const merged = { ...accessoryToAdminProduct(existingAcc), ...body } as AdminProduct;
      const parsed = parseAccessoryInput(
        isFullPayload ? adminToAccessoryInput(merged) : partialAccessoryInput(body),
        "update",
      );
      if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
      try {
        const updated = await updateAccessory(existingAcc.id, parsed.data);
        if (!updated) return NextResponse.json({ error: `Product with ID ${id} not found` }, { status: 404 });
        logger.logAdminAudit({
          actorEmail: auth.user.email,
          actorRole: auth.user.role,
          action: "product_updated",
          targetId: existingAcc.id,
          targetType: "product",
          details: { category: updated.category, price: updated.price, stock: updated.stock },
        });
        return NextResponse.json(accessoryToAdminProduct(updated));
      } catch (err) {
        if (err instanceof AccessoryConflictError) {
          return NextResponse.json({ error: err.message }, { status: 409 });
        }
        throw err;
      }
    }

    // ── Existing item is a laptop ────────────────────────────────────────────
    const rawProducts = await loadMergedRawProducts();
    const index = rawProducts.findIndex(
      (p) => String(p.id) === id || p.sku.toLowerCase() === id.toLowerCase(),
    );

    if (index === -1) {
      return NextResponse.json({ error: `Product with ID ${id} not found` }, { status: 404 });
    }

    const existing = rawProducts[index];

    // If SKU is being updated, check that it doesn't conflict with another product
    if (body.sku && body.sku.trim().toLowerCase() !== existing.sku.toLowerCase()) {
      const accessories = await listAccessories().catch(() => []);
      const conflict =
        rawProducts.some(
          (p, idx) => idx !== index && p.sku.toLowerCase() === body.sku!.trim().toLowerCase(),
        ) || accessories.some((a) => a.sku.toLowerCase() === body.sku!.trim().toLowerCase());
      if (conflict) {
        return NextResponse.json(
          { error: `A product with SKU "${body.sku.trim()}" already exists` },
          { status: 409 },
        );
      }
    }

    const numericId = typeof existing.id === "number" ? existing.id : Number(existing.id) || 1;
    const existingAdmin = rawToAdminProduct(existing);

    // Category changed to an accessory category: move it to the accessories catalogue.
    if (wantsAccessory === true) {
      const merged = { ...existingAdmin, ...body } as AdminProduct;
      const parsed = parseAccessoryInput(adminToAccessoryInput(merged), "create");
      if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
      const created = await createAccessory(parsed.data);
      await deleteRawProduct(String(numericId));
      logger.logAdminAudit({
        actorEmail: auth.user.email,
        actorRole: auth.user.role,
        action: "product_converted_to_accessory",
        targetId: created.id,
        targetType: "product",
        details: { previousLaptopId: numericId, sku: created.sku },
      });
      return NextResponse.json(accessoryToAdminProduct(created));
    }

    // Grouped specs from the form replace the stored ones wholesale; the old
    // merge kept stale flat values and ignored the edit.
    const mergedAdmin: AdminProduct = {
      ...existingAdmin,
      ...body,
      id: String(numericId),
      specs: body.specs
        ? body.specs
        : existingAdmin.specs,
    };

    const updatedRaw = adminToRawProduct(mergedAdmin, numericId);
    // A partial update (stock/price dialog) must not round-trip specs through the
    // grouped form shape: keep the stored specs exactly as they were.
    if (!body.specs) {
      updatedRaw.specs = existing.specs;
      updatedRaw.specGroups = existing.specGroups;
    }

    // If the SKU was changed, delete the OLD ProductOverride row so it no longer
    // appears in loadMergedRawProducts. saveRawProduct will create a fresh row
    // under the new SKU via upsert.
    if (updatedRaw.sku.toLowerCase() !== existing.sku.toLowerCase()) {
      try {
        const { prisma } = await import("@/lib/prisma");
        await prisma.productOverride.updateMany({
          where: { sku: existing.sku },
          data: { isDeleted: true },
        });
      } catch (dbErr) {
        console.warn("[PUT /api/admin/products/[id]] Old SKU override cleanup warning:", dbErr);
      }
    }

    // Save to PostgreSQL (ProductOverride and Inventory) + safe local sync
    await saveRawProduct(updatedRaw);

    logger.logAdminAudit({
      actorEmail: auth.user.email,
      actorRole: auth.user.role,
      action: "product_updated",
      targetId: String(numericId),
      targetType: "product",
      details: {
        sku: updatedRaw.sku,
        name: updatedRaw.name,
        price: updatedRaw.pricing?.sale_price,
        stock: body.stock ?? updatedRaw.stock?.quantity,
      },
    });

    return NextResponse.json(rawToAdminProduct(updatedRaw));
  } catch (error) {
    console.error("[PUT /api/admin/products/[id]]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product" },
      { status: 500 },
    );
  }
}

/** Fields a partial update (stock dialog, price tweak) may carry for an accessory. */
function partialAccessoryInput(body: Partial<AdminProduct>) {
  return {
    ...(body.price !== undefined ? { price: body.price } : {}),
    ...(body.stock !== undefined ? { stock: body.stock } : {}),
    ...(body.statusValue !== undefined || body.status !== undefined
      ? { active: String(body.status ?? body.statusValue).toLowerCase() === "active" }
      : {}),
  };
}

// ─── DELETE /api/admin/products/[id] ──────────────────────────────────────────
export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager"] });
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const deleted = isAccessoryId(id) ? await deleteAccessory(id) : await deleteRawProduct(id);

    if (!deleted) {
      return NextResponse.json({ error: `Product with ID ${id} not found` }, { status: 404 });
    }

    logger.logAdminAudit({
      actorEmail: auth.user.email,
      actorRole: auth.user.role,
      action: "product_deleted",
      targetId: id,
      targetType: "product",
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("[DELETE /api/admin/products/[id]]", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

export { PUT as PATCH };
