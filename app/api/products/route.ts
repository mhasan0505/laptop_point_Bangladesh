import { mapRawToProduct } from "@/app/data/data";
import { loadMergedRawProducts } from "@/lib/products-storage";
import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  try {
    const rawList = await loadMergedRawProducts();
    const products = rawList.map(mapRawToProduct);
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[GET /api/products] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
