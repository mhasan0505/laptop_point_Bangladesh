"use client";

import Link from "next/link";
import Image from "next/image";
import { Package, Award, BarChart2 } from "lucide-react";
import type { TopProductItem, BrandRevenueItem } from "@/lib/admin-dashboard";

interface PerformanceColumnsProps {
  topProducts: TopProductItem[];
  brandRevenue: BrandRevenueItem[];
}

export function PerformanceColumns({
  topProducts,
  brandRevenue,
}: PerformanceColumnsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Column 1: Best Sellers This Month */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  Best Sellers This Month
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Top performing catalog hardware by volume
                </p>
              </div>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-primary hover:underline"
            >
              All products →
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <Package className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
              <p className="font-semibold text-foreground">No sales recorded this month yet</p>
              <p className="text-[11px] mt-0.5">Top performing items will automatically display here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, idx) => (
                <div
                  key={product.id || idx}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="44px"
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                          <Package className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate" title={product.name}>
                        {product.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground font-mono">
                          {product.units} {product.units === 1 ? "unit" : "units"} sold
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-foreground font-mono">
                      ৳{product.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Column 2: Revenue by Brand This Month */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <BarChart2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  Revenue by Brand This Month
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Gross volume distribution across brands
                </p>
              </div>
            </div>
            <Link
              href="/admin/setup/catalog"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Manage brands →
            </Link>
          </div>

          {brandRevenue.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <BarChart2 className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
              <p className="font-semibold text-foreground">No brand revenue recorded this month</p>
              <p className="text-[11px] mt-0.5">Brand metrics update automatically with verified customer orders.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {brandRevenue.map((item) => (
                <div key={item.brand} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{item.brand}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-muted-foreground font-medium">{item.percentage}%</span>
                      <span className="font-bold text-foreground">৳{item.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${Math.min(Math.max(item.percentage, 2), 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
