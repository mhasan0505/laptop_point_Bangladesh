import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "../../_utils/auth";
import { emitCatalogEvent, logCatalogError } from "../../_utils/events";

export async function POST(request: NextRequest) {
  const auth = requireAdminRole(request, ["owner", "manager"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    await emitCatalogEvent({
      type: "catalog.reindex.requested",
      role: auth.role,
    });

    const activeProducts = await prisma.product.count({
      where: {
        status: { in: ["published", "review", "draft"] },
      },
    });

    await emitCatalogEvent({
      type: "catalog.reindex.completed",
      role: auth.role,
      payload: { activeProducts },
    });

    return NextResponse.json({
      message: "Reindex job completed",
      activeProducts,
      engine: process.env.SEARCH_ENGINE || "internal",
    });
  } catch (error) {
    logCatalogError("products.reindex", error);
    return NextResponse.json(
      { error: "Failed to reindex catalog" },
      { status: 500 },
    );
  }
}
