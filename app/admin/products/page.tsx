"use client";

import { Button } from "@/components/ui/button";
import { AdminProduct } from "@/lib/admin-data";
import {
  deleteAdminProduct,
  fetchAdminProducts,
} from "@/lib/admin-products-api";
import {
  Edit,
  Laptop,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
  Search,
  CheckCircle2,
  Boxes,
  XCircle,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, Suspense } from "react";
import { useToast } from "@/contexts/ToastContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function ProductTableThumb({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src || "/images/placeholder-laptop.png");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || "/images/placeholder-laptop.png");
    setHasError(false);
  }, [src]);

  return (
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xs border border-border bg-zinc-50 dark:bg-zinc-900 p-0.5 flex items-center justify-center">
      {hasError ? (
        <Laptop className="w-5 h-5 text-muted-foreground opacity-60" />
      ) : (
        <Image
          src={imgSrc}
          alt={alt}
          fill
          className="object-contain p-0.5"
          sizes="40px"
          onError={() => {
            if (imgSrc !== "/images/placeholder-laptop.png") {
              setImgSrc("/images/placeholder-laptop.png");
            } else {
              setHasError(true);
            }
          }}
        />
      )}
    </div>
  );
}

function getProductEffectiveStock(product: AdminProduct): number {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce(
      (sum, v) => sum + (v.stockQty ?? v.stock ?? 0),
      0
    );
  }
  return product.stock ?? 0;
}

function renderProductPrice(product: AdminProduct) {
  if (product.variants && product.variants.length > 0) {
    const validPrices = product.variants
      .map((v) => v.price)
      .filter((p): p is number => p !== null && p !== undefined);

    if (validPrices.length === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
          Call For Price
        </span>
      );
    }

    const min = Math.min(...validPrices);
    const max = Math.max(...validPrices);

    return (
      <div>
        <span className="font-bold text-foreground">
          {min === max
            ? `৳${min.toLocaleString()}`
            : `৳${min.toLocaleString()} – ৳${max.toLocaleString()}`}
        </span>
        <span className="block text-[10px] font-normal text-muted-foreground">
          {product.variants.length} variant{product.variants.length > 1 ? "s" : ""}
        </span>
      </div>
    );
  }

  if (product.price !== null && product.price !== undefined) {
    return (
      <span className="font-bold text-foreground">
        ৳{product.price.toLocaleString()}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
      Call For Price
    </span>
  );
}

const AdminProductsContent = () => {
  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get("q") || searchParams?.get("search") || "";

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStock, setFilterStock] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
  }, [urlSearch]);

  useEffect(() => {
    fetchAdminProducts()
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const categoryOptions = useMemo(() => {
    return [
      ...new Set(
        products
          .map((product) => product.category?.trim())
          .filter((category): category is string => Boolean(category))
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          (product.name?.toLowerCase() || "").includes(searchLower) ||
          (product.sku?.toLowerCase() || "").includes(searchLower) ||
          (product.brand?.toLowerCase() || "").includes(searchLower);

        const matchesCategory =
          filterCategory === "All" || product.category === filterCategory;

        const effectiveStock = getProductEffectiveStock(product);
        const matchesStock =
          filterStock === "All"
            ? true
            : filterStock === "in-stock"
              ? effectiveStock > 10
              : filterStock === "low-stock"
                ? effectiveStock > 0 && effectiveStock <= 10
                : effectiveStock === 0;

        return matchesSearch && matchesCategory && matchesStock;
      })
      .filter((product, index, arr) => arr.findIndex((p) => p.id === product.id) === index);
  }, [products, searchTerm, filterCategory, filterStock]);

  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => getProductEffectiveStock(p) > 10).length;
    const lowStock = products.filter((p) => {
      const s = getProductEffectiveStock(p);
      return s > 0 && s <= 10;
    }).length;
    const outOfStock = products.filter((p) => getProductEffectiveStock(p) === 0).length;
    return { total, inStock, lowStock, outOfStock };
  }, [products]);

  const getStatusBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-xs bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400 border border-red-500/20">
          <XCircle size={11} /> Out of Stock
        </span>
      );
    }
    if (stock <= 10) {
      return (
        <span className="inline-flex items-center gap-1 rounded-xs bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <AlertTriangle size={11} /> Low Stock ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-xs bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 size={11} /> In Stock ({stock})
      </span>
    );
  };

  const handleDeleteProduct = (product: AdminProduct) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    deleteAdminProduct(productToDelete.id)
      .then(() => {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        showSuccessToast("Product deleted successfully!");
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      })
      .catch((err) => {
        showErrorToast(err instanceof Error ? err.message : "Failed to delete product.");
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary" />
          <p className="text-xs font-semibold text-muted-foreground">Loading products catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Inventory & Catalog
            </p>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Product Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your hardware inventory, pricing models, specifications, and live store status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/products/bulk-prices">
            <Button variant="outline" className="h-9 text-xs font-semibold rounded-sm gap-1.5 border-border">
              <Boxes size={14} />
              Bulk Prices
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button className="h-9 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-sm gap-1.5 shadow-xs">
              <Plus size={14} />
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Mini KPI summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Listings</p>
          <p className="text-lg font-bold text-foreground mt-1">{stats.total}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">In Stock</p>
          <p className="text-lg font-bold text-foreground mt-1">{stats.inStock}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Low Stock</p>
          <p className="text-lg font-bold text-foreground mt-1">{stats.lowStock}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3.5 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Out of Stock</p>
          <p className="text-lg font-bold text-foreground mt-1">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-md border border-border bg-card p-3 shadow-2xs">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products by model, brand, or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-sm border border-border bg-background pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-9 rounded-sm border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            className="h-9 rounded-sm border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Stock Levels</option>
            <option value="in-stock">In Stock (&gt;10)</option>
            <option value="low-stock">Low Stock (1-10)</option>
            <option value="out-of-stock">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* High-density Products Table */}
      <div className="rounded-md border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No products found matching your search or filters.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Brand / Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => {
                  const image = product.images?.[0] || "/images/placeholder-laptop.png";
                  const salePrice = product.price || product.salePrice || 0;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-zinc-100 dark:hover:bg-zinc-850/60 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <ProductTableThumb src={image} alt={product.name} />
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/edit/${product.id}`}
                              className="font-semibold text-foreground hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1"
                            >
                              {product.name}
                            </Link>
                            <p className="font-mono text-[10px] text-muted-foreground">
                              SKU: {product.sku || product.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-foreground block">
                          {product.brand || "—"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {product.category || "General"}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {renderProductPrice(product)}
                      </td>

                      <td className="py-3 px-4">
                        {getStatusBadge(getProductEffectiveStock(product))}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/products/edit/${product.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 rounded-xs border-border text-muted-foreground hover:text-foreground"
                              title="Edit product"
                            >
                              <Edit size={12} />
                            </Button>
                          </Link>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
                            className="h-7 w-7 p-0 rounded-xs border-border text-muted-foreground hover:text-red-500 hover:border-red-500/30"
                            title="Delete product"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Confirm Product Deletion
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">{productToDelete?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="text-xs h-8 rounded-sm"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold h-8 rounded-sm gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function AdminProducts() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading products catalog...</div>}>
      <AdminProductsContent />
    </Suspense>
  );
}
