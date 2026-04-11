"use client";

import {
  getInitialProductFormValue,
  ProductForm,
  ProductFormValue,
} from "@/components/admin/ProductForm";
import {
  fetchCatalogProductById,
  updateProduct,
  type AdminCatalogProduct,
} from "@/lib/sanity-admin";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

function validate(form: ProductFormValue) {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.brand.trim()) errors.brand = "Brand is required";
  if (!form.model.trim()) errors.model = "Model is required";
  if (!form.sku.trim()) errors.sku = "SKU is required";
  if (Number.isNaN(Number(form.salePrice)) || Number(form.salePrice) < 0)
    errors.salePrice = "Valid sale price is required";
  if (Number.isNaN(Number(form.marketPrice)) || Number(form.marketPrice) < 0)
    errors.marketPrice = "Valid market price is required";
  if (Number.isNaN(Number(form.stock)) || Number(form.stock) < 0)
    errors.stock = "Valid stock quantity is required";
  return errors;
}

function mapProductToForm(product: AdminCatalogProduct): ProductFormValue {
  return {
    ...getInitialProductFormValue(),
    name: product.name,
    brand: product.brand,
    model: product.model,
    category: product.category,
    sku: product.sku,
    slug: product.slug,
    condition: product.condition,
    grade: product.grade || "",
    status: product.status,
    salePrice: String(product.pricing.sale_price),
    marketPrice: String(product.pricing.market_price),
    discountPercentage: String(product.pricing.discount_percentage || 0),
    taxIncluded: product.pricing.tax_included,
    stock: String(product.stock.quantity),
    processor: product.specs.processor || "",
    ram: product.specs.ram || "",
    storage: product.specs.storage || "",
    displaySize: product.specs.display.size || "",
    displayResolution: product.specs.display.resolution || "",
    displayType: product.specs.display.type || "",
    touchscreen: product.specs.display.touchscreen,
    graphics: product.specs.graphics || "",
    ports: product.specs.ports.join(", "),
    weight: product.specs.weight || "",
    os: product.specs.os || "",
    shortDescription: product.description.short || "",
    fullDescription: product.description.full || "",
    features: product.features.join("\n"),
    images: product.images.join("\n"),
  };
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState<ProductFormValue>(
    getInitialProductFormValue(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const product = await fetchCatalogProductById(id);
        setForm(mapProductToForm(product));
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "Failed to load product",
        );
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [id]);

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
      await updateProduct(id, {
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
        stock: { quantity: Number(form.stock) },
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
        error instanceof Error ? error.message : "Failed to update product",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <ProductForm
      title="Edit Product"
      subtitle="Update full catalog data, stock sync, publish status, and media URLs."
      form={form}
      errors={errors}
      saving={saving}
      submitLabel="Save Changes"
      onCancelAction={() => router.push("/admin/products")}
      onChangeAction={onChange}
      onSubmitAction={onSubmit}
      topMessage={submitError ?? undefined}
    />
  );
}
