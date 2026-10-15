"use client";

import { StockUpdateDialog } from "@/components/admin/StockUpdateDialog";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Edit2,
  Layers,
  Minus,
  Package,
  Plus,
  RefreshCw,
  Search,
  Warehouse,
  XCircle,
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { useToast } from "@/contexts/ToastContext";

interface InventoryVariant {
  id: string;
  sku: string;
  options: Record<string, string>;
  label: string;
  stock: number;
  stockStatus: string;
}

interface InventoryProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  stock: number;
  status: string;
  sku: string;
  variants: InventoryVariant[];
  isAccessory?: boolean;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    variantId?: string;
    name: string;
    variantLabel?: string;
    currentStock: number;
  } | null>(null);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const toggleExpand = (productId: string) => {
    setExpandedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const loadInventory = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/products", { cache: "no-store" })
        .then((res) => res.json())
        .catch(() => []),
      fetch("/api/admin/accessories", { cache: "no-store" })
        .then((res) => res.json())
        .catch(() => []),
    ])
      .then(([productData, accessoryData]) => {
        const mappedProducts: InventoryProduct[] = Array.isArray(productData)
          ? productData.map((item: any) => {
              const rawVariants = Array.isArray(item.variants) ? item.variants : [];
              const variants: InventoryVariant[] = rawVariants.map((v: any) => {
                const opts = typeof v.options === "object" && v.options !== null ? v.options : {};
                const label = Object.entries(opts).map(([k, val]) => `${k}: ${val}`).join(", ") || v.sku || "Variant";
                return {
                  id: String(v.id),
                  sku: v.sku || "",
                  options: opts,
                  label,
                  stock: Number(v.stockQty ?? v.stock ?? 0),
                  stockStatus: v.stockStatus || "In Stock",
                };
              });

              const totalStock = variants.length > 0
                ? variants.reduce((sum, v) => sum + v.stock, 0)
                : Number(item.stock ?? item.quantity ?? 0);

              let status = "In Stock";
              if (totalStock === 0) status = "Out of Stock";
              else if (totalStock <= 10) status = "Low Stock";

              const skuParts = (item.sku || "").split("-");
              const brandRaw = skuParts[0] || "Hardware";
              const brand =
                item.brand || (brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1).toLowerCase());

              return {
                id: String(item.id || item.productId),
                name: item.name || "Hardware Listing",
                brand,
                category: item.category || "Laptop",
                stock: totalStock,
                status,
                sku: item.sku || `SKU-${item.id}`,
                variants,
                isAccessory: false,
              };
            })
          : [];

        const mappedAccessories: InventoryProduct[] = Array.isArray(accessoryData)
          ? accessoryData.map((acc: any) => {
              const stock = Number(acc.stock ?? 0);
              let status = "In Stock";
              if (stock === 0) status = "Out of Stock";
              else if (stock <= 10) status = "Low Stock";

              return {
                id: String(acc.id),
                name: acc.name || "Accessory",
                brand: acc.brand || "Accessory",
                category: acc.category || "Accessories",
                stock,
                status,
                sku: acc.sku || `SKU-${acc.id}`,
                variants: [],
                isAccessory: true,
              };
            })
          : [];

        setProducts([...mappedProducts, ...mappedAccessories]);
      })
      .catch((err) => {
        console.error("Failed to load inventory:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.variants.some(
          (v) =>
            v.sku.toLowerCase().includes(query) ||
            v.label.toLowerCase().includes(query)
        );

      const matchesFilter =
        stockFilter === "all"
          ? true
          : stockFilter === "low"
            ? p.stock > 0 && p.stock <= 10
            : stockFilter === "out"
              ? p.stock === 0
              : p.stock > 10;

      return matchesSearch && matchesFilter;
    });
  }, [products, searchTerm, stockFilter]);

  const stats = useMemo(() => {
    const totalItems = products.length;
    const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    return { totalItems, totalUnits, lowStock, outOfStock };
  }, [products]);

  const handleQuickAdjust = async (product: InventoryProduct, delta: number) => {
    const newQty = Math.max(0, product.stock + delta);
    setUpdatingId(product.id);
    try {
      const isAcc = product.isAccessory || product.id.startsWith("acc-");
      const endpoint = isAcc
        ? `/api/admin/accessories/${product.id}`
        : `/api/admin/products/${product.id}`;
      const payload = isAcc
        ? { stock: newQty }
        : {
            stock: newQty,
            stockStatus: newQty === 0 ? "Out of Stock" : newQty <= 10 ? "Low Stock" : "In Stock",
          };

      const res = await fetch(endpoint, {
        method: isAcc ? "PUT" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to adjust quantity");
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                stock: newQty,
                status:
                  newQty === 0
                    ? "Out of Stock"
                    : newQty <= 10
                      ? "Low Stock"
                      : "In Stock",
              }
            : p
        )
      );
      showSuccessToast(`Adjusted ${product.name} to ${newQty} units`);
    } catch (err) {
      showErrorToast("Could not update stock count.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleQuickAdjustVariant = async (
    product: InventoryProduct,
    variant: InventoryVariant,
    delta: number
  ) => {
    const newQty = Math.max(0, variant.stock + delta);
    setUpdatingId(variant.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantStockUpdate: {
            variantId: variant.id,
            stock: newQty,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to adjust variant quantity");
      }

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== product.id) return p;
          const nextVariants = p.variants.map((v) =>
            v.id === variant.id ? { ...v, stock: newQty } : v
          );
          const totalStock = nextVariants.reduce((s, v) => s + v.stock, 0);
          return {
            ...p,
            variants: nextVariants,
            stock: totalStock,
            status: totalStock === 0 ? "Out of Stock" : totalStock <= 10 ? "Low Stock" : "In Stock",
          };
        })
      );
      showSuccessToast(`Adjusted ${variant.label} to ${newQty} units`);
    } catch (err) {
      showErrorToast("Could not update variant stock count.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenStockDialog = (product: InventoryProduct) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      currentStock: product.stock,
    });
    setStockDialogOpen(true);
  };

  const handleOpenVariantStockDialog = (
    product: InventoryProduct,
    variant: InventoryVariant
  ) => {
    setSelectedProduct({
      id: product.id,
      variantId: variant.id,
      name: product.name,
      variantLabel: variant.label,
      currentStock: variant.stock,
    });
    setStockDialogOpen(true);
  };

  const handleStockUpdateSuccess = async (newStock: number, variantId?: string) => {
    if (!selectedProduct) return;
    try {
      if (variantId) {
        const res = await fetch(`/api/admin/products/${selectedProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            variantStockUpdate: {
              variantId,
              stock: newStock,
            },
          }),
        });

        if (!res.ok) throw new Error("Failed to update variant stock");

        setProducts((prev) =>
          prev.map((p) => {
            if (p.id !== selectedProduct.id) return p;
            const nextVariants = p.variants.map((v) =>
              v.id === variantId ? { ...v, stock: newStock } : v
            );
            const totalStock = nextVariants.reduce((s, v) => s + v.stock, 0);
            return {
              ...p,
              variants: nextVariants,
              stock: totalStock,
              status: totalStock === 0 ? "Out of Stock" : totalStock <= 10 ? "Low Stock" : "In Stock",
            };
          })
        );
      } else {
        const isAcc = selectedProduct.id.startsWith("acc-");
        const endpoint = isAcc
          ? `/api/admin/accessories/${selectedProduct.id}`
          : `/api/admin/products/${selectedProduct.id}`;
        const payload = isAcc
          ? { stock: newStock }
          : {
              stock: newStock,
              stockStatus: newStock === 0 ? "Out of Stock" : newStock <= 10 ? "Low Stock" : "In Stock",
            };

        const res = await fetch(endpoint, {
          method: isAcc ? "PUT" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to update product stock");

        setProducts((prev) =>
          prev.map((p) =>
            p.id === selectedProduct.id
              ? {
                  ...p,
                  stock: newStock,
                  status:
                    newStock === 0
                      ? "Out of Stock"
                      : newStock <= 10
                        ? "Low Stock"
                        : "In Stock",
                }
              : p
          )
        );
      }
      showSuccessToast("Stock updated successfully");
    } catch (err) {
      showErrorToast("Failed to persist stock update");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Real-time Warehouse
            </p>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Inventory & Stock Center
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit inventory levels per product and variant, apply instant steppers, and monitor restock alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadInventory}
            className="h-9 text-xs font-semibold rounded-sm border-border gap-1.5"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh Stock
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Catalog Listings</p>
          <p className="text-lg font-bold text-foreground mt-1">{stats.totalItems}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Physical Units</p>
          <p className="text-lg font-bold text-foreground mt-1">{stats.totalUnits}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Low Stock SKUs</p>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.lowStock}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Out of Stock SKUs</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-md border border-border bg-card p-3 shadow-2xs">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stock by SKU, product name, or variant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-sm border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="h-9 rounded-sm border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">All Inventory</option>
          <option value="healthy">Healthy Stock (&gt;10)</option>
          <option value="low">Low Stock (1-10)</option>
          <option value="out">Out of Stock (0)</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="rounded-md border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No inventory entries found matching your query.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground">
                  <th className="py-3 px-4">Product / Variant</th>
                  <th className="py-3 px-4">SKU / Brand</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Quick Adjust</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((p) => {
                  const isUpdating = updatingId === p.id;
                  const hasVariants = p.variants.length > 0;
                  const isExpanded = expandedProductIds.has(p.id);

                  return (
                    <React.Fragment key={p.id}>
                      {/* Main Product Row */}
                      <tr className="hover:bg-zinc-100 dark:hover:bg-zinc-850/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-foreground max-w-xs">
                          <div className="flex items-center gap-2">
                            {hasVariants && (
                              <button
                                type="button"
                                onClick={() => toggleExpand(p.id)}
                                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                                title={isExpanded ? "Collapse variants" : "Expand variants"}
                              >
                                {isExpanded ? (
                                  <ChevronDown size={14} />
                                ) : (
                                  <ChevronRight size={14} />
                                )}
                              </button>
                            )}
                            <span className="truncate">{p.name}</span>
                            {p.isAccessory && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium shrink-0">
                                Accessory
                              </span>
                            )}
                            {hasVariants && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-medium shrink-0">
                                <Layers size={10} />
                                {p.variants.length}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-mono text-[10px] text-muted-foreground block">
                            {p.sku}
                          </span>
                          <span className="font-medium text-foreground text-[11px]">
                            {p.brand}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-sm text-foreground">
                            {p.stock}{" "}
                            <span className="text-[10px] text-muted-foreground font-normal">
                              {hasVariants ? "total units" : "units"}
                            </span>
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {p.stock === 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-xs bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400 border border-red-500/20">
                              <XCircle size={10} /> Out of Stock
                            </span>
                          ) : p.stock <= 10 ? (
                            <span className="inline-flex items-center gap-1 rounded-xs bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <AlertTriangle size={10} /> Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-xs bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 size={10} /> In Stock
                            </span>
                          )}
                        </td>

                        {/* Quick Adjust Steppers */}
                        <td className="py-3 px-4">
                          {!hasVariants ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleQuickAdjust(p, -1)}
                                disabled={p.stock <= 0 || isUpdating}
                                className="h-6 w-6 rounded-xs border border-border bg-background flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 cursor-pointer"
                                title="Decrease 1"
                              >
                                <Minus size={11} />
                              </button>
                              <button
                                onClick={() => handleQuickAdjust(p, +1)}
                                disabled={isUpdating}
                                className="h-6 w-6 rounded-xs border border-border bg-background flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 cursor-pointer"
                                title="Increase 1"
                              >
                                <Plus size={11} />
                              </button>
                              <button
                                onClick={() => handleQuickAdjust(p, +5)}
                                disabled={isUpdating}
                                className="h-6 px-1.5 rounded-xs border border-border bg-background flex items-center justify-center text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 cursor-pointer"
                                title="Add 5 units"
                              >
                                +5
                              </button>
                            </div>
                          ) : (
                            <div className="text-center text-[11px] text-muted-foreground italic">
                              Adjust via variants below
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          {!hasVariants && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenStockDialog(p)}
                              className="h-7 text-xs font-semibold px-2 rounded-xs border-border gap-1"
                            >
                              <Edit2 size={11} />
                              Set
                            </Button>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Variant Sub-Rows */}
                      {hasVariants &&
                        isExpanded &&
                        p.variants.map((v) => {
                          const isVarUpdating = updatingId === v.id;
                          return (
                            <tr
                              key={v.id}
                              className="bg-muted/30 border-l-4 border-l-primary/40 hover:bg-muted/50 transition-colors"
                            >
                              <td className="py-2.5 px-4 pl-10">
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground text-xs">↳</span>
                                  <span className="font-medium text-foreground text-xs">
                                    {v.label}
                                  </span>
                                </div>
                              </td>

                              <td className="py-2.5 px-4">
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  {v.sku}
                                </span>
                              </td>

                              <td className="py-2.5 px-4">
                                <span className="font-bold text-xs text-foreground">
                                  {v.stock}{" "}
                                  <span className="text-[10px] text-muted-foreground font-normal">
                                    units
                                  </span>
                                </span>
                              </td>

                              <td className="py-2.5 px-4">
                                {v.stock === 0 ? (
                                  <span className="inline-flex items-center gap-1 rounded-xs bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-600 dark:text-red-400 border border-red-500/20">
                                    <XCircle size={9} /> Out
                                  </span>
                                ) : v.stock <= 10 ? (
                                  <span className="inline-flex items-center gap-1 rounded-xs bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    <AlertTriangle size={9} /> Low
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-xs bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <CheckCircle2 size={9} /> In Stock
                                  </span>
                                )}
                              </td>

                              {/* Steppers for variant */}
                              <td className="py-2.5 px-4">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleQuickAdjustVariant(p, v, -1)}
                                    disabled={v.stock <= 0 || isVarUpdating}
                                    className="h-5 w-5 rounded-xs border border-border bg-background flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 cursor-pointer"
                                    title="Decrease 1"
                                  >
                                    <Minus size={9} />
                                  </button>
                                  <button
                                    onClick={() => handleQuickAdjustVariant(p, v, +1)}
                                    disabled={isVarUpdating}
                                    className="h-5 w-5 rounded-xs border border-border bg-background flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 cursor-pointer"
                                    title="Increase 1"
                                  >
                                    <Plus size={9} />
                                  </button>
                                  <button
                                    onClick={() => handleQuickAdjustVariant(p, v, +5)}
                                    disabled={isVarUpdating}
                                    className="h-5 px-1 rounded-xs border border-border bg-background flex items-center justify-center text-[9px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 cursor-pointer"
                                    title="Add 5 units"
                                  >
                                    +5
                                  </button>
                                </div>
                              </td>

                              <td className="py-2.5 px-4 text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenVariantStockDialog(p, v)}
                                  className="h-6 text-[11px] font-semibold px-2 rounded-xs border-border gap-1"
                                >
                                  <Edit2 size={10} />
                                  Set
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Stock Update Dialog */}
      {selectedProduct && (
        <StockUpdateDialog
          isOpen={stockDialogOpen}
          onClose={() => setStockDialogOpen(false)}
          product={selectedProduct}
          onSuccess={handleStockUpdateSuccess}
        />
      )}
    </div>
  );
}
