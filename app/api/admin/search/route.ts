import { NextRequest, NextResponse } from "next/server";
import { loadMergedRawProducts } from "@/lib/products-storage";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export interface AdminProductSearchResult {
  id: string;
  name: string;
  sku: string;
  brand: string;
  price: number | null;
  image: string;
  stockQty: number;
}

export interface AdminOrderSearchResult {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  total?: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface AdminSearchResponse {
  products: AdminProductSearchResult[];
  orders: AdminOrderSearchResult[];
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();
    const scope = searchParams.get("scope") || "all";
    const limit = Math.min(parseInt(searchParams.get("limit") || "8", 10), 20);

    let productResults: AdminProductSearchResult[] = [];
    let orderResults: AdminOrderSearchResult[] = [];

    // Search Products
    if (scope === "all" || scope === "products") {
      try {
        const rawProducts = await loadMergedRawProducts();
        let matched = rawProducts;
        if (query) {
          matched = rawProducts.filter((p) => {
            const name = (p.name || "").toLowerCase();
            const brand = (p.brand || "").toLowerCase();
            const model = (p.model || "").toLowerCase();
            const sku = (p.sku || String(p.id)).toLowerCase();
            const id = String(p.id).toLowerCase();
            return (
              name.includes(query) ||
              brand.includes(query) ||
              model.includes(query) ||
              sku.includes(query) ||
              id === query
            );
          });
        }
        productResults = matched.slice(0, limit).map((p) => {
          const image =
            (p.images && p.images[0]) ||
            ((p as any).image) ||
            "/placeholder.png";
          return {
            id: String(p.id),
            name: p.name || "",
            sku: p.sku || String(p.id),
            brand: p.brand || "",
            price: p.pricing?.sale_price ?? (p as any).price ?? null,
            image,
            stockQty: p.stock?.quantity ?? 0,
          };
        });
      } catch (err) {
        console.error("[GET /api/admin/search] Product search error:", err);
      }
    }

    // Search Orders
    if (scope === "all" || scope === "orders") {
      try {
        const whereClause = query
          ? {
              OR: [
                { orderNumber: { contains: query, mode: "insensitive" as const } },
                { customerName: { contains: query, mode: "insensitive" as const } },
                { customerPhone: { contains: query } },
              ],
            }
          : {};

        const orders = await prisma.order.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          take: limit,
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            customerPhone: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        });

        orderResults = orders.map((o) => {
          const numTotal = Number(o.totalAmount);
          return {
            id: o.id,
            orderNumber: o.orderNumber,
            customerName: o.customerName,
            customerPhone: o.customerPhone || undefined,
            total: numTotal,
            totalAmount: numTotal,
            status: o.status,
            createdAt: o.createdAt.toISOString(),
          };
        });
      } catch (err) {
        console.error("[GET /api/admin/search] Order search error:", err);
      }
    }

    const response: AdminSearchResponse = {
      products: productResults,
      orders: orderResults,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[GET /api/admin/search]", error);
    return NextResponse.json(
      { products: [], orders: [] },
      { status: 500 }
    );
  }
}
