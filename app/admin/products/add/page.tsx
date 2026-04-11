"use client";

import {
  getInitialProductFormValue,
  ProductForm,
  ProductFormValue,
} from "@/components/admin/ProductForm";
import { addProduct } from "@/lib/sanity-admin";
import { useRouter } from "next/navigation";
import { useState } from "react";

function validate(form: ProductFormValue) {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.brand.trim()) errors.brand = "Brand is required";
  if (!form.model.trim()) errors.model = "Model is required";
  if (!form.sku.trim()) errors.sku = "SKU is required";

  const salePrice = Number(form.salePrice);
  const marketPrice = Number(form.marketPrice);
  const stock = Number(form.stock);

  if (!form.salePrice || Number.isNaN(salePrice) || salePrice < 0)
    errors.salePrice = "Valid sale price is required";
  if (!form.marketPrice || Number.isNaN(marketPrice) || marketPrice < 0)
    errors.marketPrice = "Valid market price is required";
  if (Number.isNaN(stock) || stock < 0)
    errors.stock = "Valid stock quantity is required";

  return errors;
}

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormValue>(
    getInitialProductFormValue(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onChange = (field: keyof ProductFormValue, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value as never }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    const formErrors = validate(form);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setSaving(true);
    try {
      await addProduct({
        sku: form.sku.trim(),
        slug: form.slug.trim() || undefined,
        name: form.name.trim(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        category: form.category.trim(),
        condition: form.condition.trim() || "Used",
        grade: form.grade.trim() || undefined,
        pricing: {
          sale_price: Number(form.salePrice),
          market_price: Number(form.marketPrice),
          discount_percentage: Number(form.discountPercentage || "0"),
          tax_included: form.taxIncluded,
        },
        stock: {
          quantity: Number(form.stock),
        },
        specs: {
          processor: form.processor || undefined,
          ram: form.ram || undefined,
          storage: form.storage || undefined,
          display: {
            size: form.displaySize || undefined,
            resolution: form.displayResolution || undefined,
            type: form.displayType || undefined,
            touchscreen: form.touchscreen,
          },
          graphics: form.graphics || undefined,
          ports: form.ports
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          weight: form.weight || undefined,
          os: form.os || undefined,
        },
        description: {
          short: form.shortDescription || undefined,
          full: form.fullDescription || undefined,
        },
        features: form.features
          .split("\n")
          .map((value) => value.trim())
          .filter(Boolean),
        images: form.images
          .split("\n")
          .map((value) => value.trim())
          .filter(Boolean),
        status: form.status,
      });

      router.push("/admin/products");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create product",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProductForm
      title="Add New Product"
      subtitle="Create a complete product profile and keep it in draft/review/published workflow."
      form={form}
      errors={errors}
      saving={saving}
      submitLabel="Create Product"
      onCancelAction={() => router.push("/admin/products")}
      onChangeAction={onChange}
      onSubmitAction={onSubmit}
      topMessage={submitError ?? undefined}
    />
  );
}
