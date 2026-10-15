import { NextRequest, NextResponse } from "next/server";
import { loadMergedRawProducts, saveRawProduct } from "@/lib/products-storage";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

interface PreviewItem {
  type: "product" | "variant";
  productId: string;
  variantId?: string;
  sku: string;
  name: string;
  options: string;
  oldPrice: number | null;
  newPrice: number | null;
  oldRegularPrice: number | null;
  newRegularPrice: number | null;
  oldStock: number;
  newStock: number;
  status: "changed" | "unchanged" | "error";
  errors: string[];
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager"] });
  if (auth.error) return auth.error;

  try {
    const products = await loadMergedRawProducts();

    const headers = ["Product ID", "Variant ID", "SKU", "Name", "Price", "Regular Price", "Stock"];
    const rows = products.map((p) => {
      const salePrice = p.pricing?.sale_price ?? (p as any).price ?? 0;
      const regularPrice = p.pricing?.market_price ?? (p as any).salePrice ?? salePrice;
      const stock = typeof p.stock === "number" ? p.stock : (p.stock?.quantity ?? 0);
      const safeName = `"${(p.name || "").replace(/"/g, '""')}"`;
      return [p.id, "", p.sku, safeName, salePrice, regularPrice, stock].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="product-prices.csv"',
      },
    });
  } catch (err) {
    console.error("[api/admin/products/bulk-prices GET] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to export catalog" },
      { status: 500 }
    );
  }
}

function parseCsv(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return lines.map((line) => {
    const row: string[] = [];
    let insideQuotes = false;
    let entry = "";
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          entry += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        row.push(entry.trim());
        entry = "";
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());
    return row;
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager"] });
  if (auth.error) return auth.error;
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "preview";

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No spreadsheet file uploaded" }, { status: 400 });
    }

    // The parser reads plain-text CSV only. Binary spreadsheets (.xlsx/.xls)
    // would otherwise be decoded as garbage and fail with a misleading error.
    const MAX_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File is too large (max 2MB). Split it into smaller CSV files." },
        { status: 413 }
      );
    }
    const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const isZip = head[0] === 0x50 && head[1] === 0x4b; // .xlsx container
    const isOle = head[0] === 0xd0 && head[1] === 0xcf; // legacy .xls
    if (isZip || isOle || /\.xlsx?$/i.test(file.name)) {
      return NextResponse.json(
        {
          error:
            "Excel files aren't supported. In Excel choose File → Save As → CSV (UTF-8), then upload the .csv file.",
        },
        { status: 415 }
      );
    }

    // Strip a UTF-8 BOM (Excel's "CSV UTF-8" export adds one).
    const text = (await file.text()).replace(/^﻿/, "");
    const table = parseCsv(text);

    if (table.length < 2) {
      return NextResponse.json(
        { error: "Uploaded file is empty or missing data rows" },
        { status: 400 }
      );
    }

    const products = await loadMergedRawProducts();
    const productMapBySku = new Map(
      products.filter((p) => Boolean(p.sku)).map((p) => [p.sku.toLowerCase(), p])
    );
    const productMapById = new Map(products.map((p) => [String(p.id), p]));

    const header = table[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
    const idIdx = header.findIndex((h) => h.includes("productid") || h === "id");
    const skuIdx = header.findIndex((h) => h === "sku");
    const priceIdx = header.findIndex((h) => h === "price" || h === "saleprice");
    const regPriceIdx = header.findIndex((h) => h.includes("regularprice") || h.includes("marketprice"));
    const stockIdx = header.findIndex((h) => h.includes("stock") || h.includes("qty"));

    const items: PreviewItem[] = [];
    let changedCount = 0;
    let unchangedCount = 0;
    let errorCount = 0;

    for (let r = 1; r < table.length; r++) {
      const row = table[r];
      const prodId = idIdx >= 0 ? row[idIdx] : "";
      const sku = skuIdx >= 0 ? row[skuIdx] : "";

      const existing = (prodId && productMapById.get(prodId)) || (sku && productMapBySku.get(sku.toLowerCase()));
      if (!existing) {
        errorCount++;
        items.push({
          type: "product",
          productId: prodId || "unknown",
          sku: sku || "unknown",
          name: "Unknown Product",
          options: "Standard",
          oldPrice: null,
          newPrice: null,
          oldRegularPrice: null,
          newRegularPrice: null,
          oldStock: 0,
          newStock: 0,
          status: "error",
          errors: [`No product matching ID "${prodId}" or SKU "${sku}"`],
        });
        continue;
      }

      const curPrice = existing.pricing?.sale_price ?? (existing as any).price ?? 0;
      const curRegPrice = existing.pricing?.market_price ?? (existing as any).salePrice ?? curPrice;
      const curStock = typeof existing.stock === "number" ? existing.stock : (existing.stock?.quantity ?? 0);

      const parsedNewPrice = priceIdx >= 0 && row[priceIdx] ? Number(row[priceIdx]) : curPrice;
      const parsedNewRegPrice = regPriceIdx >= 0 && row[regPriceIdx] ? Number(row[regPriceIdx]) : curRegPrice;
      const parsedNewStock = stockIdx >= 0 && row[stockIdx] ? Number(row[stockIdx]) : curStock;

      const hasPriceChange = !isNaN(parsedNewPrice) && parsedNewPrice !== curPrice;
      const hasRegChange = !isNaN(parsedNewRegPrice) && parsedNewRegPrice !== curRegPrice;
      const hasStockChange = !isNaN(parsedNewStock) && parsedNewStock !== curStock;

      const isChanged = hasPriceChange || hasRegChange || hasStockChange;
      if (isChanged) {
        changedCount++;
      } else {
        unchangedCount++;
      }

      const item: PreviewItem = {
        type: "product",
        productId: String(existing.id),
        sku: existing.sku,
        name: existing.name,
        options: "Standard",
        oldPrice: curPrice,
        newPrice: !isNaN(parsedNewPrice) ? parsedNewPrice : curPrice,
        oldRegularPrice: curRegPrice,
        newRegularPrice: !isNaN(parsedNewRegPrice) ? parsedNewRegPrice : curRegPrice,
        oldStock: curStock,
        newStock: !isNaN(parsedNewStock) ? parsedNewStock : curStock,
        status: isChanged ? "changed" : "unchanged",
        errors: [],
      };

      items.push(item);

      // If action is apply, commit changes
      if (action === "apply" && isChanged) {
        existing.pricing = {
          ...existing.pricing,
          sale_price: item.newPrice ?? curPrice,
          market_price: item.newRegularPrice ?? curRegPrice,
        };
        existing.stock = {
          quantity: item.newStock,
          status: item.newStock > 0 ? "In Stock" : "Out of Stock",
        };

        await saveRawProduct(existing).catch(() => {});

        // Also update prisma.inventory
        try {
          await prisma.inventory.upsert({
            where: { sku: existing.sku },
            create: {
              productId: String(existing.id),
              sku: existing.sku,
              name: existing.name,
              quantity: item.newStock,
              reserved: 0,
            },
            update: {
              quantity: item.newStock,
            },
          });
        } catch {
          // ignore
        }
      }
    }

    const summary = {
      total: items.length,
      changed: changedCount,
      unchanged: unchangedCount,
      errors: errorCount,
    };

    if (action === "apply") {
      return NextResponse.json({
        ok: true,
        message: `Updated ${changedCount} product(s) successfully!`,
        summary,
        items,
      });
    }

    return NextResponse.json({
      summary,
      items,
    });
  } catch (err) {
    console.error("[api/admin/products/bulk-prices POST] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process bulk prices" },
      { status: 500 }
    );
  }
}
