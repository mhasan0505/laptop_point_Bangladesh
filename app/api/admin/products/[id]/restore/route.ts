import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "../../../_utils/auth";
import { emitCatalogEvent, logCatalogError } from "../../../_utils/events";
import { triggerCatalogBackgroundJobs } from "../../../_utils/jobs";

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
    const body = (await request.json().catch(() => ({}))) as {
      status?: "draft" | "review" | "published";
    };

    const targetStatus = body.status ?? "published";

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.product.update({
        where: { id },
        data: { status: targetStatus },
      });

      await tx.productAuditLog.create({
        data: {
          productId: id,
          action: "restore",
          changedFields: {
            role: auth.role,
            beforeStatus: product.status,
            afterStatus: targetStatus,
          },
        },
      });

      return row;
    });

    await emitCatalogEvent({
      type: "product.restored",
      productId: id,
      role: auth.role,
      payload: { status: targetStatus },
    });
    await triggerCatalogBackgroundJobs(id);

    return NextResponse.json(updated);
  } catch (error) {
    logCatalogError("products.restore", error);
    return NextResponse.json(
      { error: "Failed to restore product" },
      { status: 500 },
    );
  }
}
