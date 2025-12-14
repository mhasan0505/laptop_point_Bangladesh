"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Laptop, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: string;
  sku: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "HP EliteBook 840 G7",
      category: "Business Laptops",
      price: "৳42,500",
      stock: 25,
      status: "Active",
      sku: "HP-840-G7",
    },
    {
      id: 2,
      name: "Dell XPS 13 9310",
      category: "Premium Laptops",
      price: "৳95,000",
      stock: 15,
      status: "Active",
      sku: "DELL-XPS-9310",
    },
    {
      id: 3,
      name: "Lenovo ThinkPad X1 Carbon",
      category: "Business Laptops",
      price: "৳85,000",
      stock: 3,
      status: "Low Stock",
      sku: "LEN-X1-CAR",
    },
    {
      id: 4,
      name: "MacBook Air M2",
      category: "Apple",
      price: "৳125,000",
      stock: 12,
      status: "Active",
      sku: "APP-MBA-M2",
    },
    {
      id: 5,
      name: "Asus ROG Zephyrus G14",
      category: "Gaming Laptops",
      price: "৳145,000",
      stock: 0,
      status: "Out of Stock",
      sku: "ASU-ROG-G14",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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

  const handleDeleteProduct = (productId: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((p) => p.id !== productId));
    }
  };

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
                <option value="Business Laptops">Business Laptops</option>
                <option value="Premium Laptops">Premium Laptops</option>
                <option value="Gaming Laptops">Gaming Laptops</option>
                <option value="Apple">Apple</option>
                <option value="Accessories">Accessories</option>
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
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
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
                      {product.price}
                    </td>
                    <td className="py-4 px-4 text-gray-600">{product.stock}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(
                          product.status
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
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AdminProducts;
