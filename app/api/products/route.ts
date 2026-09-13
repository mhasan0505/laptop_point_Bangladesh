import { mapRawToProduct } from "@/app/data/data";
import { loadMergedRawProducts } from "@/lib/products-storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rawList = await loadMergedRawProducts();
    const products = rawList.map(mapRawToProduct);
    return NextResponse.json(products);
  } catch (error) {
    console.error("[GET /api/products] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
