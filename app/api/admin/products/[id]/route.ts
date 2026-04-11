import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "../../_utils/auth";
import { emitCatalogEvent, logCatalogError } from "../../_utils/events";
import { triggerCatalogBackgroundJobs } from "../../_utils/jobs";
import {
  buildProductApiResponse,
  parseProductPayload,
  type ProductPayload,
} from "../helpers";

type RouteContext = { params: Promise<{ id: string }> };

function toPayloadFromDb(product: {
  sku: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  condition: string;
  grade: string | null;
  salePrice: number;
  marketPrice: number;
  discountPercentage: number;
  taxIncluded: boolean;
  processor: string | null;
  ram: string | null;
  storage: string | null;
  displaySize: string | null;
  displayResolution: string | null;
  displayType: string | null;
  touchscreen: boolean;
  graphics: string | null;
  ports: string[];
  weight: string | null;
  os: string | null;
  descriptionShort: string | null;
  descriptionFull: string | null;
  status: string;
  images: Array<{ url: string; position: number }>;
  features: Array<{ label: string; position: number }>;
  inventory: { quantity: number } | null;
}): ProductPayload {
  return {
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    model: product.model,
    category: product.category,
    condition: product.condition,
    grade: product.grade ?? undefined,
    pricing: {
      sale_price: product.salePrice,
      market_price: product.marketPrice,
      discount_percentage: product.discountPercentage,
      tax_included: product.taxIncluded,
    },
    stock: {
      quantity: product.inventory?.quantity ?? 0,
    },
    specs: {
      processor: product.processor ?? undefined,
      ram: product.ram ?? undefined,
      storage: product.storage ?? undefined,
      display: {
        size: product.displaySize ?? undefined,
        resolution: product.displayResolution ?? undefined,
        type: product.displayType ?? undefined,
        touchscreen: product.touchscreen,
      },
      graphics: product.graphics ?? undefined,
      ports: product.ports,
      weight: product.weight ?? undefined,
      os: product.os ?? undefined,
    },
    description: {
      short: product.descriptionShort ?? undefined,
      full: product.descriptionFull ?? undefined,
    },
    features: product.features
      .sort((a, b) => a.position - b.position)
      .map((feature) => feature.label),
    images: product.images
      .sort((a, b) => a.position - b.position)
      .map((img) => img.url),
    status:
      (product.status as "draft" | "review" | "published" | "archived") ??
      "published",
  };
}

function mergePayload(
  base: ProductPayload,
  patch: ProductPayload,
): ProductPayload {
  return {
    ...base,
    ...patch,
    pricing: { ...base.pricing, ...patch.pricing },
    stock: { ...base.stock, ...patch.stock },
    specs: {
      ...base.specs,
      ...patch.specs,
      display: { ...base.specs?.display, ...patch.specs?.display },
    },
    description: { ...base.description, ...patch.description },
    features: patch.features ?? base.features,
    images: patch.images ?? base.images,
  };
}

// GET /api/admin/products/[id]
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const auth = requireAdminRole(_request, ["owner", "manager", "editor"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        features: true,
        inventory: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(buildProductApiResponse(product));
  } catch (error) {
    logCatalogError("products.get", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/products/[id]
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = requireAdminRole(request, ["owner", "manager", "editor"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const patchPayload = (await request.json()) as ProductPayload;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        features: true,
        inventory: {
          select: { quantity: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const mergedPayload = mergePayload(toPayloadFromDb(existing), patchPayload);
    const parsed = parseProductPayload(mergedPayload, "update");

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { productData, inventoryQuantity, features, images } = parsed.value;

    const duplicate = await prisma.product.findFirst({
      where: {
        id: { not: id },
        OR: [{ sku: productData.sku }, { slug: productData.slug }],
      },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Another product already uses the same sku or slug" },
        { status: 409 },
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          ...productData,
        },
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
          action: "update",
          changedFields: {
            role: auth.role,
            patch: patchPayload,
            before: toPayloadFromDb(existing),
            after: mergedPayload,
          },
        },
      });

      return tx.product.findUniqueOrThrow({
        where: { id },
        include: {
          images: true,
          features: true,
          inventory: true,
        },
      });
    });

    await emitCatalogEvent({
      type: "product.updated",
      productId: updated.id,
      role: auth.role,
      payload: { status: updated.status, sku: updated.sku },
    });
    await triggerCatalogBackgroundJobs(updated.id);

    return NextResponse.json(buildProductApiResponse(updated));
  } catch (error) {
    logCatalogError("products.update", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/products/[id] (soft delete as archived)
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const auth = requireAdminRole(_request, ["owner", "manager"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { id } = await params;

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const archived = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: { status: "archived" },
      });

      await tx.productAuditLog.create({
        data: {
          productId: id,
          action: "delete",
          changedFields: {
            role: auth.role,
            beforeStatus: "published",
            afterStatus: "archived",
          },
          note: "Soft deleted via admin API (status=archived)",
        },
      });

      return tx.product.findUniqueOrThrow({
        where: { id },
        include: {
          images: true,
          features: true,
          inventory: true,
        },
      });
    });

    await emitCatalogEvent({
      type: "product.deleted",
      productId: archived.id,
      role: auth.role,
      payload: { status: archived.status },
    });
    await triggerCatalogBackgroundJobs(archived.id);

    return NextResponse.json(buildProductApiResponse(archived));
  } catch (error) {
    logCatalogError("products.delete", error);
    return NextResponse.json(
      { error: "Failed to archive product" },
      { status: 500 },
    );
  }
}
