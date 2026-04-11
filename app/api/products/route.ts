import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const brand = searchParams.get("brand");
    const category = searchParams.get("category");

    const products = await prisma.product.findMany({
      where: {
        status: "published",
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { brand: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
                { category: { contains: search, mode: "insensitive" } },
                { processor: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(brand ? { brand: { equals: brand, mode: "insensitive" } } : {}),
        ...(category
          ? { category: { equals: category, mode: "insensitive" } }
          : {}),
      },
      include: {
        images: { orderBy: { position: "asc" } },
        features: { orderBy: { position: "asc" } },
        inventory: { select: { quantity: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = products.map((p) => {
      const sortedImages = p.images.map((img) => img.url);
      const displayParts = [p.displaySize, p.displayResolution, p.displayType]
        .filter(Boolean)
        .join(" ");

      return {
        id: p.id,
        sku: p.sku,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: p.salePrice,
        originalPrice: p.marketPrice,
        discount: p.discountPercentage || undefined,
        image: sortedImages[0] ?? "",
        images: sortedImages,
        inStock: (p.inventory?.quantity ?? 0) > 0,
        condition: p.condition ? [p.condition] : undefined,
        features: p.features.map((f) => f.label),
        specs: {
          processor: p.processor ?? undefined,
          ram: p.ram ?? undefined,
          storage: p.storage ?? undefined,
          display: displayParts || undefined,
          graphics: p.graphics ?? undefined,
          weight: p.weight ?? undefined,
        },
        description: p.descriptionShort
          ? {
              short: p.descriptionShort,
              full: p.descriptionFull ?? p.descriptionShort,
            }
          : undefined,
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("[public products]", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
