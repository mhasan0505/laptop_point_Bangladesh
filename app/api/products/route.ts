import { NextResponse } from "next/server";
import { getLiveProducts } from "@/lib/products";

export async function GET(request: Request) {
  try {
    const products = await getLiveProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error loading products:", error);
    return NextResponse.json([], { status: 500 });
  }
}
