"use client";

import { ProductEditorForm } from "@/components/admin/ProductEditorForm";
import { createAdminProduct } from "@/lib/admin-products-api";

export default function AddProductPage() {
  return (
    <ProductEditorForm
      title="Add New Product"
      subtitle="Create a product using the same detail structure as products.json"
      submitLabel="Add Product"
      onSubmitProductAction={createAdminProduct}
    />
  );
}
