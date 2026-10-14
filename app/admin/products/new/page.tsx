"use client";

import { ProductEditorForm } from "@/components/admin/ProductEditorForm";
import { createAdminProduct } from "@/lib/admin-products-api";

export default function NewProductPage() {
  return (
    <ProductEditorForm
      title="Add Product"
      subtitle="Create a new product in your inventory"
      submitLabel="Add Product"
      onSubmitProductAction={createAdminProduct}
    />
  );
}
