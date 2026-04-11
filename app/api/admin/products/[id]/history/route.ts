import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "../../../_utils/auth";
import { logCatalogError } from "../../../_utils/events";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireAdminRole(request, ["owner", "manager", "editor"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { id } = await params;

    const logs = await prisma.productAuditLog.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(logs);
  } catch (error) {
    logCatalogError("products.history", error);
    return NextResponse.json(
      { error: "Failed to fetch product history" },
      { status: 500 },
    );
  }
}
