"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminProduct } from "@/lib/admin-data";
import {
  deleteAdminProduct,
  fetchAdminProducts,
} from "@/lib/admin-products-api";
import { Edit, Laptop, Plus, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminProducts = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categoryOptions = [
    ...new Set(
      products
        .map((product) => product.category?.trim())
        .filter((category): category is string => Boolean(category)),
    ),
  ].sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    fetchAdminProducts().then((data) => {
      setProducts(data);
      setIsLoading(false);
    });
  }, []);

  const filteredProducts = products
    .filter((product) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (product.name?.toLowerCase() || "").includes(searchLower) ||
        (product.sku?.toLowerCase() || "").includes(searchLower) ||
        (product.brand?.toLowerCase() || "").includes(searchLower);
      const matchesCategory =
        filterCategory === "All" || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    // Deduplicate by slug to avoid duplicate product links and confusing admin edits
    .filter((product, index, arr) => arr.findIndex((p) => p.slug === product.slug) === index);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800";
      case "Out of Stock":
        return "bg-red-100 text-red-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black mb-2">
              Product Management
            </h1>
            <p className="text-gray-600">
              Manage your product catalog, inventory, and pricing.
            </p>
          </div>
          <Link href="/admin/products/add">
            <Button className="bg-black hover:bg-gray-800 text-white gap-2">
              <Plus className="w-4 h-4" />
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none pr-8"
              >
                <option value="All">All Categories</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">
            Products ({filteredProducts.length})
          </CardTitle>
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
                    Price
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
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id || product.name}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            <Laptop className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-medium text-black">
                              {product.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        {product.sku}
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        {product.category}
                      </td>
                      <td className="py-4 px-4 font-semibold text-black">
                        ৳{product.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {product.stock}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(
                            product.status,
                          )}`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Link href={`/admin/products/edit/${product.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="py-8 px-4 text-center text-gray-500"
                      colSpan={7}
                    >
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="text-left">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Delete Product</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400 mt-2">
              Are you sure you want to delete this product? This action cannot be undone and will permanently remove the product from the catalog.
            </DialogDescription>
          </DialogHeader>

          {productToDelete && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl my-2 text-left">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200/60 dark:border-gray-700/60 flex items-center justify-center text-gray-400">
                <Laptop className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {productToDelete.name}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  SKU: {productToDelete.sku} | Price: ৳{productToDelete.price.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setProductToDelete(null);
              }}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminProducts;
