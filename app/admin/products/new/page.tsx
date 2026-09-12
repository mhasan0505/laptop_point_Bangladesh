"use client";

import { ProductEditorForm } from "@/components/admin/ProductEditorForm";
import { createAdminProduct } from "@/lib/admin-products-api";

export default function NewProductPage() {
  return (
    <ProductEditorForm
      title="Add New Product"
      subtitle="Create a new hardware listing for your catalog with complete specs and pricing"
      submitLabel="Add Product"
      onSubmitProductAction={createAdminProduct}
    />
  );
}
