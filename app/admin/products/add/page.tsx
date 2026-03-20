"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addProduct } from "@/lib/sanity-admin";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = [
  "Business Laptops",
  "Premium Laptops",
  "Gaming Laptops",
  "Apple",
  "Accessories",
];

export default function AddProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "Business Laptops",
    sku: "",
    price: "",
    stock: "",
    status: "Active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.brand.trim()) errs.brand = "Brand is required";
    if (!form.sku.trim()) errs.sku = "SKU is required";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      errs.price = "Valid price is required";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      errs.stock = "Valid stock quantity is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      await addProduct({
        name: form.name.trim(),
        brand: form.brand.trim(),
        category: form.category,
        sku: form.sku.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        status: form.status,
        images: [],
      });
      router.push("/admin/products");
    } finally {
      setSaving(false);
    }
  };

  const setField = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field])
      setErrors((e) => {
        const copy = { ...e };
        delete copy[field];
        return copy;
      });
  };

  const inputCls =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-black">Add New Product</h1>
          <p className="text-gray-500">Create a new product listing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="e.g. Dell Latitude 5540"
                  className={inputCls}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setField("brand", e.target.value)}
                  placeholder="e.g. Dell"
                  className={inputCls}
                />
                {errors.brand && (
                  <p className="text-red-500 text-xs mt-1">{errors.brand}</p>
                )}
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setField("sku", e.target.value)}
                  placeholder="e.g. DELL-LAT-5540"
                  className={inputCls}
                />
                {errors.sku && (
                  <p className="text-red-500 text-xs mt-1">{errors.sku}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                  className={inputCls}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value)}
                  className={inputCls}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (৳) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setField("stock", e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/admin/products">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white"
                disabled={saving}
              >
                {saving ? "Saving..." : "Add Product"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
