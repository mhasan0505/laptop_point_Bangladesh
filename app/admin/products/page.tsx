"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/contexts/ToastContext";
import { AdminProduct } from "@/lib/admin-data";
import { deleteAdminProduct, fetchAdminProducts } from "@/lib/admin-products-api";
import { Edit, Laptop, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const AdminProducts = () => {
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = () => {
    setIsLoading(true);
    fetchAdminProducts()
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        showErrorToast("Failed to load products from server");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category?.trim()) set.add(p.category.trim());
    });
    return ["All", ...Array.from(set).sort()];
  }, [products]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Out of Stock":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await deleteAdminProduct(productId);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        showSuccessToast(`Product "${productName}" deleted successfully`);
      } catch (err) {
        showErrorToast(
          err instanceof Error ? err.message : "Failed to delete product",
        );
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary" />
        <p className="text-xs text-muted-foreground font-semibold">
          Loading product catalog...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Product Management
            </h1>
            <p className="text-gray-500 text-sm">
              Manage your hardware catalog, inventory, specs, and pricing.
            </p>
          </div>
          <Link href="/admin/products/new">
            <Button className="bg-black hover:bg-gray-800 text-white gap-2 shadow-xs font-medium">
              <Plus className="w-4 h-4" />
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6 bg-white border border-gray-200 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products by name, brand, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
              />
            </div>
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none pr-8 text-sm cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="bg-white border border-gray-200 shadow-xs">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
            <span>Products ({filteredProducts.length})</span>
            <span className="text-xs font-normal text-gray-500">
              Total catalog: {products.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase tracking-wider text-gray-600">
                    Product
                  </th>
                  <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase tracking-wider text-gray-600">
                    SKU
                  </th>
                  <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase tracking-wider text-gray-600">
                    Category
                  </th>
                  <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase tracking-wider text-gray-600">
                    Price
                  </th>
                  <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase tracking-wider text-gray-600">
                    Stock
                  </th>
                  <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase tracking-wider text-gray-600">
                    Status
                  </th>
                  <th className="text-right py-3.5 px-4 font-semibold text-xs uppercase tracking-wider text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const primaryImg = product.images?.[0];
                    return (
                      <tr
                        key={product.id}
                        className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                              {primaryImg ? (
                                <img
                                  src={primaryImg}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/Hero_Image.png";
                                  }}
                                />
                              ) : (
                                <Laptop className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {product.brand}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs font-mono font-medium">
                          {product.sku}
                        </td>
                        <td className="py-3 px-4 text-gray-800 text-xs font-medium">
                          {product.category}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900 text-sm">
                          ৳{product.price.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-800 text-xs font-semibold">
                          {product.stock}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${getStatusColor(
                              product.status,
                            )}`}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Link href={`/admin/products/edit/${product.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-600 hover:text-black hover:bg-gray-100"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4 text-gray-700" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                              onClick={() =>
                                handleDeleteProduct(product.id, product.name)
                              }
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      className="py-12 px-4 text-center text-gray-500 text-sm"
                      colSpan={7}
                    >
                      No products found matching your search and category filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AdminProducts;
