import { deleteProduct, updateProduct } from "@/lib/sanity-admin";
import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

function isAdminRequest(request: NextRequest): boolean {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  const cookie = request.cookies.get("admin_session")?.value;
  if (!sessionSecret || !cookie) return false;
  try {
    const ha = createHash("sha256").update(cookie).digest();
    const hb = createHash("sha256").update(sessionSecret).digest();
    return timingSafeEqual(ha, hb);
  } catch {
    return false;
  }
}

function normalizeSpecs(specs: unknown) {
  if (!specs || typeof specs !== "object") {
    return undefined;
  }

  const input = specs as {
    processor?: unknown;
    ram?: unknown;
    storage?: unknown;
    display?: unknown;
    displayDetails?: {
      size?: unknown;
      resolution?: unknown;
      type?: unknown;
      touchscreen?: unknown;
    };
    graphics?: unknown;
    battery?: unknown;
    weight?: unknown;
    dimensions?: unknown;
    os?: unknown;
    ports?: unknown;
    portsList?: unknown;
  };

  return {
    processor: input.processor ? String(input.processor) : undefined,
    ram: input.ram ? String(input.ram) : undefined,
    storage: input.storage ? String(input.storage) : undefined,
    display: input.display ? String(input.display) : undefined,
    displayDetails:
      input.displayDetails && typeof input.displayDetails === "object"
        ? {
            size: input.displayDetails.size
              ? String(input.displayDetails.size)
              : undefined,
            resolution: input.displayDetails.resolution
              ? String(input.displayDetails.resolution)
              : undefined,
            type: input.displayDetails.type
              ? String(input.displayDetails.type)
              : undefined,
            touchscreen:
              typeof input.displayDetails.touchscreen === "boolean"
                ? input.displayDetails.touchscreen
                : undefined,
          }
        : undefined,
    graphics: input.graphics ? String(input.graphics) : undefined,
    battery: input.battery ? String(input.battery) : undefined,
    weight: input.weight ? String(input.weight) : undefined,
    dimensions: input.dimensions ? String(input.dimensions) : undefined,
    os: input.os ? String(input.os) : undefined,
    ports: input.ports ? String(input.ports) : undefined,
    portsList: Array.isArray(input.portsList)
      ? input.portsList.map((entry) => String(entry)).filter(Boolean)
      : undefined,
  };
}

function extractErrorStatusAndMessage(error: unknown) {
  const statusCode =
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof (error as { statusCode?: unknown }).statusCode === "number"
      ? (error as { statusCode: number }).statusCode
      : 500;

  const description =
    typeof error === "object" &&
    error !== null &&
    "details" in error &&
    typeof (error as { details?: unknown }).details === "object" &&
    (error as { details?: { error?: { description?: unknown } } }).details
      ?.error?.description &&
    typeof (error as { details?: { error?: { description?: unknown } } })
      .details?.error?.description === "string"
      ? (error as { details: { error: { description: string } } }).details.error
          .description
      : error instanceof Error
        ? error.message
        : "Request failed";

  return { statusCode, description };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const updates: Partial<{
      name: string;
      sku: string;
      brand: string;
      model: string;
      category: string;
      condition: string;
      grade: string;
      price: number;
      salePrice: number;
      currency: string;
      taxIncluded: boolean;
      stock: number;
      stockStatus: string;
      lowStockThreshold: number;
      status: string;
      description: string;
      fullDescription: string;
      featured: boolean;
      tags: string[];
      features: string[];
      specs: {
        processor?: string;
        ram?: string;
        storage?: string;
        display?: string;
        displayDetails?: {
          size?: string;
          resolution?: string;
          type?: string;
          touchscreen?: boolean;
        };
        graphics?: string;
        ports?: string;
        portsList?: string[];
        battery?: string;
        weight?: string;
        dimensions?: string;
        os?: string;
      };
      warranty: {
        period?: string;
        type?: string;
        details?: string;
      };
      images: string[];
      variants: {
        name: string;
        price: number;
        originalPrice?: number;
        sku?: string;
      }[];
    }> = {};

    if (typeof body?.name === "string") updates.name = body.name.trim();
    if (typeof body?.sku === "string") updates.sku = body.sku.trim();
    if (typeof body?.brand === "string") updates.brand = body.brand.trim();
    if (typeof body?.model === "string") updates.model = body.model.trim();
    if (typeof body?.category === "string") updates.category = body.category;
    if (typeof body?.condition === "string") {
      updates.condition = body.condition.trim();
    }
    if (typeof body?.grade === "string") updates.grade = body.grade.trim();
    if (typeof body?.status === "string") updates.status = body.status;
    if (typeof body?.description === "string") {
      updates.description = body.description;
    }
    if (typeof body?.fullDescription === "string") {
      updates.fullDescription = body.fullDescription;
    }
    if (body?.price !== undefined) updates.price = Number(body.price);
    if (body?.salePrice !== undefined)
      updates.salePrice = Number(body.salePrice);
    if (typeof body?.currency === "string") updates.currency = body.currency;
    if (typeof body?.taxIncluded === "boolean") {
      updates.taxIncluded = body.taxIncluded;
    }
    if (body?.stock !== undefined) updates.stock = Number(body.stock);
    if (typeof body?.stockStatus === "string") {
      updates.stockStatus = body.stockStatus.trim();
    }
    if (body?.lowStockThreshold !== undefined) {
      updates.lowStockThreshold = Number(body.lowStockThreshold);
    }
    if (typeof body?.featured === "boolean") updates.featured = body.featured;
    if (Array.isArray(body?.tags)) {
      updates.tags = body.tags.map((t: unknown) => String(t)).filter(Boolean);
    }
    if (Array.isArray(body?.features)) {
      updates.features = body.features
        .map((feature: unknown) => String(feature))
        .filter(Boolean);
    }
    if (Array.isArray(body?.images)) {
      updates.images = body.images
        .map((u: unknown) => String(u).trim())
        .filter(Boolean);
    }
    if (Array.isArray(body?.variants)) {
      updates.variants = body.variants.map((v: any) => ({
        name: String(v.name || "").trim(),
        price: Number(v.price),
        originalPrice:
          v.originalPrice === undefined || v.originalPrice === ""
            ? undefined
            : Number(v.originalPrice),
        sku: v.sku ? String(v.sku).trim() : undefined,
      }));
    }
    if (body?.specs && typeof body.specs === "object") {
      updates.specs = normalizeSpecs(body.specs);
    }
    if (body?.warranty && typeof body.warranty === "object") {
      updates.warranty = {
        period: body.warranty.period ? String(body.warranty.period) : undefined,
        type: body.warranty.type ? String(body.warranty.type) : undefined,
        details: body.warranty.details
          ? String(body.warranty.details)
          : undefined,
      };
    }

    if (
      (updates.price !== undefined &&
        (Number.isNaN(updates.price) || updates.price < 0)) ||
      (updates.salePrice !== undefined &&
        (Number.isNaN(updates.salePrice) || updates.salePrice < 0)) ||
      (updates.stock !== undefined &&
        (Number.isNaN(updates.stock) || updates.stock < 0)) ||
      (updates.lowStockThreshold !== undefined &&
        (Number.isNaN(updates.lowStockThreshold) ||
          updates.lowStockThreshold < 0))
    ) {
      return NextResponse.json(
        {
          error:
            "price, sale price, stock and low stock threshold must be valid non-negative numbers",
        },
        { status: 400 },
      );
    }

    if (
      updates.price !== undefined &&
      updates.salePrice !== undefined &&
      updates.salePrice < updates.price
    ) {
      return NextResponse.json(
        { error: "market price cannot be lower than current price" },
        { status: 400 },
      );
    }

    const ok = await updateProduct(id, updates);
    if (!ok) {
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/admin/products/[id]]", error);

    const { statusCode, description } = extractErrorStatusAndMessage(error);

    if (/already exists|unique sku|unique constraint|slug/i.test(description)) {
      return NextResponse.json({ error: description }, { status: 409 });
    }

    if (statusCode === 403) {
      return NextResponse.json(
        {
          error:
            "Sanity token lacks write permission. Update your SANITY_API_TOKEN with write access.",
          details: description,
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: description },
      { status: statusCode >= 400 ? statusCode : 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const ok = await deleteProduct(id);

    if (!ok) {
      return NextResponse.json(
        { error: "Failed to delete product" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/products/[id]]", error);

    const { statusCode, description } = extractErrorStatusAndMessage(error);
    if (statusCode === 403) {
      return NextResponse.json(
        {
          error:
            "Sanity token lacks write permission. Update your SANITY_API_TOKEN with write access.",
          details: description,
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: description },
      { status: statusCode >= 400 ? statusCode : 500 },
    );
  }
}
