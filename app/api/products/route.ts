import { getLiveProducts } from "@/lib/products";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const products = await getLiveProducts();
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error loading products:", error);
    return NextResponse.json([], { status: 500 });
  }
}
