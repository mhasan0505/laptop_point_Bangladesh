"use client";

import { StockUpdateDialog } from "@/components/admin/StockUpdateDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Edit2, Package, Search, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  useEffect(() => {
    let active = true;
    fetch("/api/inventory", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (active && Array.isArray(data)) {
          const mapped = data.map((item) => {
            const stock = item.quantity;
            let status = "Active";
            if (stock === 0) status = "Out of Stock";
            else if (stock < 5) status = "Low Stock";

            // Extract brand from SKU (e.g. DELL-ABC -> Dell) or keep as "Laptop"
            const skuParts = item.sku.split("-");
            const brandRaw = skuParts[0] || "Laptop";
            const brand = brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1).toLowerCase();

            return {
              id: item.productId,
              name: item.name,
              brand,
              category: "Laptop",
              stock,
              status,
              sku: item.sku,
            };
          });
          setProducts(mapped);
        }
        if (active) setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load inventory:", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const lowStockProducts = products.filter((p) => p.stock < 10 && p.stock > 0);
  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  const getStockStatus = (stock) => {
    if (stock === 0)
      return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (stock < 10)
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { label: "In Stock", color: "bg-green-100 text-green-800" };
  };

  const handleOpenStockDialog = (product) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      currentStock: product.stock,
    });
    setStockDialogOpen(true);
  };

  const handleStockUpdateSuccess = async (newStock) => {
    if (selectedProduct) {
      try {
        const response = await fetch(`/api/inventory/${selectedProduct.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity: newStock }),
        });

        if (!response.ok) {
          throw new Error("Failed to update stock in Neon DB");
        }

        setProducts((prev) =>
          prev.map((p) =>
            p.id === selectedProduct.id
              ? {
                  ...p,
                  stock: newStock,
                  status:
                    newStock === 0
                      ? "Out of Stock"
                      : newStock < 5
                        ? "Low Stock"
                        : "Active",
                }
              : p,
          ),
        );
        showSuccessToast(`Stock updated to ${newStock} for "${selectedProduct.name}" successfully!`);
      } catch (err) {
        console.error(err);
        showErrorToast("Error updating inventory: " + err.message);
      }
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/inventory/${productToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete inventory record");
      }
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      showSuccessToast(`"${productToDelete.name}" removed from inventory.`);
    } catch (err) {
      console.error(err);
      showErrorToast("Error deleting inventory: " + err.message);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black mb-2">
          Inventory Management
        </h1>
        <p className="text-gray-600">
          Track and manage your product stock levels.
        </p>
      </div>

      {loading ? (
        <Card className="p-12 flex flex-col items-center justify-center min-h-[400px] gap-4 border border-gray-100 bg-white/50 backdrop-blur-md shadow-sm rounded-xl">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-black animate-spin" />
            <Package className="w-5 h-5 text-black absolute animate-pulse" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-gray-900">Fetching live inventory</h3>
            <p className="text-sm text-gray-500 max-w-xs">Connecting securely to Neon PostgreSQL DB to load live stock counts.</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Products
                </CardTitle>
                <Package className="w-4 h-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Stock Units
                </CardTitle>
                <Package className="w-4 h-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStock}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Low Stock Items
                </CardTitle>
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {lowStockProducts.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Out of Stock
                </CardTitle>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {outOfStockProducts.length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Product
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        SKU
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Stock
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => {
                        const status = getStockStatus(product.stock);
                        return (
                          <tr
                            key={product.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-4 px-4">
                              <div className="font-medium text-black">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.brand}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-600 text-sm">
                              {product.sku}
                            </td>
                            <td className="py-4 px-4 text-gray-600 text-sm">
                              {product.category}
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-semibold">{product.stock}</span>
                            </td>
                            <td className="py-4 px-4">
                              <Badge className={status.color}>{status.label}</Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenStockDialog(product)}
                                  className="gap-2"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Update Stock
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(product)}
                                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          className="py-8 px-4 text-center text-gray-500 text-sm"
                          colSpan={6}
                        >
                          No inventory items found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <StockUpdateDialog
        isOpen={stockDialogOpen}
        onClose={() => setStockDialogOpen(false)}
        product={selectedProduct}
        onSuccess={handleStockUpdateSuccess}
      />

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/80" onClick={() => !deleting && setDeleteDialogOpen(false)} />
          <div className="relative z-50 w-full max-w-md bg-white rounded-lg shadow-xl p-6 mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black">Delete Inventory Record</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            {productToDelete && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="font-medium text-black text-sm">{productToDelete.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">SKU: {productToDelete.sku} &middot; Stock: {productToDelete.stock}</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setProductToDelete(null);
                }}
                disabled={deleting}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InventoryPage;
