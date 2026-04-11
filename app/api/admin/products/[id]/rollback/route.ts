import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "../../../_utils/auth";
import { emitCatalogEvent, logCatalogError } from "../../../_utils/events";
import { triggerCatalogBackgroundJobs } from "../../../_utils/jobs";
import { parseProductPayload, type ProductPayload } from "../../helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireAdminRole(request, ["owner", "manager"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as { auditLogId: string };

    if (!body.auditLogId) {
      return NextResponse.json(
        { error: "auditLogId is required" },
        { status: 400 },
      );
    }

    const log = await prisma.productAuditLog.findFirst({
      where: {
        id: body.auditLogId,
        productId: id,
      },
      select: { changedFields: true },
    });

    if (!log || !log.changedFields) {
      return NextResponse.json(
        { error: "Rollback source log not found" },
        { status: 404 },
      );
    }

    const changed = log.changedFields as { before?: ProductPayload };
    if (!changed.before) {
      return NextResponse.json(
        { error: "Selected audit log does not contain rollback snapshot" },
        { status: 400 },
      );
    }

    const parsed = parseProductPayload(changed.before, "update");
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { productData, inventoryQuantity, features, images } = parsed.value;

    const updated = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: { ...productData },
      });

      await tx.productFeature.deleteMany({ where: { productId: id } });
      if (features.length > 0) {
        await tx.productFeature.createMany({
          data: features.map((label, index) => ({
            productId: id,
            label,
            position: index,
          })),
        });
      }

      await tx.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((url, index) => ({
            productId: id,
            url,
            position: index,
          })),
        });
      }

      await tx.inventory.upsert({
        where: { productId: id },
        update: {
          sku: product.sku,
          name: product.name,
          quantity: inventoryQuantity,
        },
        create: {
          productId: id,
          sku: product.sku,
          name: product.name,
          quantity: inventoryQuantity,
          reserved: 0,
        },
      });

      await tx.productAuditLog.create({
        data: {
          productId: id,
          action: "rollback",
          changedFields: {
            role: auth.role,
            sourceAuditLogId: body.auditLogId,
            restoredTo: changed.before,
          },
        },
      });

      return product;
    });

    await emitCatalogEvent({
      type: "product.rolled_back",
      productId: id,
      role: auth.role,
      payload: { sourceAuditLogId: body.auditLogId, status: updated.status },
    });
    await triggerCatalogBackgroundJobs(id);

    return NextResponse.json(updated);
  } catch (error) {
    logCatalogError("products.rollback", error);
    return NextResponse.json(
      { error: "Failed to rollback product" },
      { status: 500 },
    );
  }
}
