import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "../_utils/auth";
import { emitCatalogEvent, logCatalogError } from "../_utils/events";
import { triggerCatalogBackgroundJobs } from "../_utils/jobs";
import {
  buildProductApiResponse,
  parseProductPayload,
  type ProductPayload,
} from "./helpers";

// GET /api/admin/products
export async function GET(request: NextRequest) {
  const auth = requireAdminRole(request, ["owner", "manager", "editor"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const products = await prisma.product.findMany({
      where: {
        ...(status && status !== "All" ? { status } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
                { brand: { contains: search, mode: "insensitive" } },
                { model: { contains: search, mode: "insensitive" } },
                { slug: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        images: true,
        features: true,
        inventory: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products.map(buildProductApiResponse));
  } catch (error) {
    logCatalogError("products.list", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// POST /api/admin/products
export async function POST(request: NextRequest) {
  const auth = requireAdminRole(request, ["owner", "manager"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const payload = (await request.json()) as ProductPayload;
    const parsed = parseProductPayload(payload, "create");

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { productData, inventoryQuantity, features, images } = parsed.value;

    const duplicate = await prisma.product.findFirst({
      where: {
        OR: [{ sku: productData.sku }, { slug: productData.slug }],
      },
      select: { id: true, sku: true, slug: true },
    });

    if (duplicate) {
      const field = duplicate.sku === productData.sku ? "sku" : "slug";
      return NextResponse.json(
        { error: `Product ${field} already exists` },
        { status: 409 },
      );
    }

    const created = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: productData,
      });

      if (features.length > 0) {
        await tx.productFeature.createMany({
          data: features.map((label, index) => ({
            productId: product.id,
            label,
            position: index,
          })),
        });
      }

      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((url, index) => ({
            productId: product.id,
            url,
            position: index,
          })),
        });
      }

      await tx.inventory.create({
        data: {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          quantity: inventoryQuantity,
          reserved: 0,
        },
      });

      await tx.productAuditLog.create({
        data: {
          productId: product.id,
          action: "create",
          changedFields: {
            role: auth.role,
            after: payload,
          },
        },
      });

      return tx.product.findUniqueOrThrow({
        where: { id: product.id },
        include: {
          images: true,
          features: true,
          inventory: true,
        },
      });
    });

    await emitCatalogEvent({
      type: "product.created",
      productId: created.id,
      role: auth.role,
      payload: { sku: created.sku, status: created.status },
    });
    await triggerCatalogBackgroundJobs(created.id);

    return NextResponse.json(buildProductApiResponse(created), { status: 201 });
  } catch (error) {
    logCatalogError("products.create", error);
    const message =
      process.env.NODE_ENV !== "production" && error instanceof Error
        ? error.message
        : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
