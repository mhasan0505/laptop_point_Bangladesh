import { addProduct, fetchProducts } from "@/lib/sanity-admin";
import type { ApiVariantInput } from "@/types/product";
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

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await fetchProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("[GET /api/admin/products]", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const payload = {
      name: String(body?.name || "").trim(),
      brand: String(body?.brand || "").trim(),
      model:
        body?.model === undefined ? undefined : String(body.model || "").trim(),
      category: String(body?.category || "").trim(),
      condition:
        body?.condition === undefined
          ? undefined
          : String(body.condition || "").trim(),
      grade:
        body?.grade === undefined ? undefined : String(body.grade || "").trim(),
      sku: String(body?.sku || "").trim(),
      description:
        body?.description === undefined
          ? undefined
          : String(body.description || "").trim(),
      fullDescription:
        body?.fullDescription === undefined
          ? undefined
          : String(body.fullDescription || "").trim(),
      price: Number(body?.price),
      salePrice:
        body?.salePrice === undefined || body?.salePrice === ""
          ? undefined
          : Number(body.salePrice),
      currency:
        body?.currency === undefined
          ? "BDT"
          : String(body.currency || "BDT").trim(),
      taxIncluded:
        body?.taxIncluded === undefined ? true : Boolean(body.taxIncluded),
      stock: Number(body?.stock),
      stockStatus:
        body?.stockStatus === undefined
          ? undefined
          : String(body.stockStatus || "").trim(),
      lowStockThreshold:
        body?.lowStockThreshold === undefined || body?.lowStockThreshold === ""
          ? 10
          : Number(body.lowStockThreshold),
      status: String(body?.status || "Active"),
      featured: Boolean(body?.featured),
      tags: Array.isArray(body?.tags)
        ? body.tags.map((t: unknown) => String(t)).filter(Boolean)
        : [],
      features: Array.isArray(body?.features)
        ? body.features
            .map((feature: unknown) => String(feature))
            .filter(Boolean)
        : [],
      specs: normalizeSpecs(body?.specs),
      warranty:
        body?.warranty && typeof body.warranty === "object"
          ? {
              period: body.warranty.period
                ? String(body.warranty.period)
                : undefined,
              type: body.warranty.type ? String(body.warranty.type) : undefined,
              details: body.warranty.details
                ? String(body.warranty.details)
                : undefined,
            }
          : undefined,
      images: Array.isArray(body?.images) ? body.images : [],
      variants: Array.isArray(body?.variants)
        ? body.variants.map((v: ApiVariantInput) => ({
            name: String(v.name || "").trim(),
            price: Number(v.price),
            originalPrice:
              v.originalPrice === undefined || v.originalPrice === ""
                ? undefined
                : Number(v.originalPrice),
            sku: v.sku ? String(v.sku).trim() : undefined,
          }))
        : undefined,
    };

    if (!payload.name || !payload.brand || !payload.category || !payload.sku) {
      return NextResponse.json(
        { error: "name, brand, category, and sku are required" },
        { status: 400 },
      );
    }

    if (
      Number.isNaN(payload.price) ||
      (payload.salePrice !== undefined && Number.isNaN(payload.salePrice)) ||
      Number.isNaN(payload.stock) ||
      Number.isNaN(payload.lowStockThreshold) ||
      payload.price < 0 ||
      (payload.salePrice !== undefined && payload.salePrice < 0) ||
      payload.stock < 0 ||
      payload.lowStockThreshold < 0
    ) {
      return NextResponse.json(
        {
          error:
            "price, sale price, stock and low stock threshold must be valid non-negative numbers",
        },
        { status: 400 },
      );
    }

    if (payload.salePrice !== undefined && payload.salePrice < payload.price) {
      return NextResponse.json(
        { error: "market price cannot be lower than current price" },
        { status: 400 },
      );
    }

    const id = await addProduct(payload);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/products]", error);

    const { statusCode, description } = extractErrorStatusAndMessage(error);

    if (/already exists|unique sku|unique constraint/i.test(description)) {
      return NextResponse.json({ error: description }, { status: 409 });
    }

    if (statusCode === 403) {
      return NextResponse.json(
        {
          error:
            "Sanity token lacks write permission. Create/use a token with create/update/delete access and set it in SANITY_API_TOKEN (or SANITY_WRITE_TOKEN if you add one).",
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
