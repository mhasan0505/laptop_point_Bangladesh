"use client";

import { Button } from "@/components/ui/button";
import { uploadAdminImage } from "@/lib/sanity-admin";
import { UploadCloud } from "lucide-react";
import { useState } from "react";

const parseImageUrls = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

export type ProductFormValue = {
  name: string;
  brand: string;
  model: string;
  category: string;
  sku: string;
  slug: string;
  condition: string;
  grade: string;
  status: "draft" | "review" | "published" | "archived";
  salePrice: string;
  marketPrice: string;
  discountPercentage: string;
  taxIncluded: boolean;
  stock: string;
  processor: string;
  ram: string;
  storage: string;
  displaySize: string;
  displayResolution: string;
  displayType: string;
  touchscreen: boolean;
  graphics: string;
  ports: string;
  weight: string;
  os: string;
  shortDescription: string;
  fullDescription: string;
  features: string;
  images: string;
};

export type ProductFormErrors = Record<string, string>;

type Props = {
  title: string;
  subtitle: string;
  form: ProductFormValue;
  errors: ProductFormErrors;
  saving: boolean;
  submitLabel: string;
  onCancelAction: () => void;
  onChangeAction: (
    field: keyof ProductFormValue,
    value: string | boolean,
  ) => void;
  onSubmitAction: (event: React.FormEvent) => void;
  topMessage?: string;
};

const inputCls =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none";

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-red-500 text-xs mt-1">{error}</p>;
}

export function ProductForm({
  title,
  subtitle,
  form,
  errors,
  saving,
  submitLabel,
  onCancelAction,
  onChangeAction,
  onSubmitAction,
  topMessage,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const imageUrls = parseImageUrls(form.images);

  const updateImages = (urls: string[]) => {
    onChangeAction("images", urls.join("\n"));
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setUploadError(null);
    setUploading(true);

    try {
      const uploadMetadata = {
        sku: form.sku,
        slug: form.slug,
        brand: form.brand,
        model: form.model,
      };
      const uploadedUrls = await Promise.all(
        files.map((file) => uploadAdminImage(file, uploadMetadata)),
      );
      updateImages([...imageUrls, ...uploadedUrls]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleImageRemove = (index: number) => {
    updateImages(imageUrls.filter((_, imageIndex) => imageIndex !== index));
  };

  return (
    <form onSubmit={onSubmitAction} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">{title}</h1>
        <p className="text-gray-500">{subtitle}</p>
      </div>

      {topMessage && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {topMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 rounded-lg border bg-white p-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => onChangeAction("name", e.target.value)}
          />
          <FieldError error={errors.name} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand
          </label>
          <input
            className={inputCls}
            value={form.brand}
            onChange={(e) => onChangeAction("brand", e.target.value)}
          />
          <FieldError error={errors.brand} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <input
            className={inputCls}
            value={form.model}
            onChange={(e) => onChangeAction("model", e.target.value)}
          />
          <FieldError error={errors.model} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            className={inputCls}
            value={form.category}
            onChange={(e) => onChangeAction("category", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU
          </label>
          <input
            className={inputCls}
            value={form.sku}
            onChange={(e) => onChangeAction("sku", e.target.value)}
          />
          <FieldError error={errors.sku} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug
          </label>
          <input
            className={inputCls}
            value={form.slug}
            onChange={(e) => onChangeAction("slug", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            className={inputCls}
            value={form.status}
            onChange={(e) => onChangeAction("status", e.target.value)}
          >
            <option value="draft">draft</option>
            <option value="review">review</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Condition
          </label>
          <input
            className={inputCls}
            value={form.condition}
            onChange={(e) => onChangeAction("condition", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grade
          </label>
          <input
            className={inputCls}
            value={form.grade}
            onChange={(e) => onChangeAction("grade", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 rounded-lg border bg-white p-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sale Price
          </label>
          <input
            type="number"
            min="0"
            className={inputCls}
            value={form.salePrice}
            onChange={(e) => onChangeAction("salePrice", e.target.value)}
          />
          <FieldError error={errors.salePrice} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Market Price
          </label>
          <input
            type="number"
            min="0"
            className={inputCls}
            value={form.marketPrice}
            onChange={(e) => onChangeAction("marketPrice", e.target.value)}
          />
          <FieldError error={errors.marketPrice} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount %
          </label>
          <input
            type="number"
            min="0"
            className={inputCls}
            value={form.discountPercentage}
            onChange={(e) =>
              onChangeAction("discountPercentage", e.target.value)
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock Quantity
          </label>
          <input
            type="number"
            min="0"
            className={inputCls}
            value={form.stock}
            onChange={(e) => onChangeAction("stock", e.target.value)}
          />
          <FieldError error={errors.stock} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 rounded-lg border bg-white p-5">
        <input
          className={inputCls}
          placeholder="Processor"
          value={form.processor}
          onChange={(e) => onChangeAction("processor", e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="RAM"
          value={form.ram}
          onChange={(e) => onChangeAction("ram", e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="Storage"
          value={form.storage}
          onChange={(e) => onChangeAction("storage", e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="Display Size"
          value={form.displaySize}
          onChange={(e) => onChangeAction("displaySize", e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="Display Resolution"
          value={form.displayResolution}
          onChange={(e) => onChangeAction("displayResolution", e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="Display Type"
          value={form.displayType}
          onChange={(e) => onChangeAction("displayType", e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="Graphics"
          value={form.graphics}
          onChange={(e) => onChangeAction("graphics", e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="Ports (comma separated)"
          value={form.ports}
          onChange={(e) => onChangeAction("ports", e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="Weight"
          value={form.weight}
          onChange={(e) => onChangeAction("weight", e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="OS"
          value={form.os}
          onChange={(e) => onChangeAction("os", e.target.value)}
        />
      </div>

      <div className="rounded-lg border bg-white p-5 space-y-4">
        <textarea
          className={inputCls}
          rows={3}
          placeholder="Short description"
          value={form.shortDescription}
          onChange={(e) => onChangeAction("shortDescription", e.target.value)}
        />
        <textarea
          className={inputCls}
          rows={7}
          placeholder="Full description"
          value={form.fullDescription}
          onChange={(e) => onChangeAction("fullDescription", e.target.value)}
        />
        <textarea
          className={inputCls}
          rows={5}
          placeholder="Features, one per line"
          value={form.features}
          onChange={(e) => onChangeAction("features", e.target.value)}
        />
        <div className="space-y-4 rounded-2xl border border-dashed border-gray-300 bg-linear-to-br from-gray-50 via-white to-gray-100 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Product Images
              </p>
              <p className="text-xs text-gray-500">
                Upload image files directly. They will be stored automatically
                and attached to this product.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {uploading ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">
                  Uploading image files...
                </span>
              ) : null}
              {imageUrls.length > 0 ? (
                <span className="rounded-full bg-black px-3 py-1 font-medium text-white">
                  {imageUrls.length} image{imageUrls.length > 1 ? "s" : ""}
                </span>
              ) : null}
            </div>
          </div>

          <input
            id="product-image-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={uploading}
            className="sr-only"
          />
          <label
            htmlFor="product-image-upload"
            className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center transition hover:border-black hover:bg-gray-50"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-sm transition group-hover:scale-105">
              <UploadCloud className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900">
                Drag product photos here or browse files
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, WEBP and other image formats are supported.
              </p>
            </div>
            <span className="rounded-full border border-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black transition group-hover:bg-black group-hover:text-white">
              Choose Images
            </span>
          </label>

          {imageUrls.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {imageUrls.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white"
                >
                  <div className="relative aspect-4/3 bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Product image ${index + 1}`}
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="line-clamp-2 text-xs text-gray-500">{url}</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleImageRemove(index)}
                    >
                      Remove Image
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Manual image URLs (optional)
            </label>
            <textarea
              className={inputCls}
              rows={4}
              placeholder="Paste image URLs here only if you need to add external images"
              value={form.images}
              onChange={(e) => onChangeAction("images", e.target.value)}
            />
          </div>
        </div>

        {uploadError && <p className="text-red-500 text-xs">{uploadError}</p>}
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancelAction}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-black hover:bg-gray-800 text-white"
          disabled={saving || uploading}
        >
          {saving ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function getInitialProductFormValue(): ProductFormValue {
  return {
    name: "",
    brand: "",
    model: "",
    category: "Laptop",
    sku: "",
    slug: "",
    condition: "Used",
    grade: "",
    status: "published",
    salePrice: "",
    marketPrice: "",
    discountPercentage: "0",
    taxIncluded: true,
    stock: "0",
    processor: "",
    ram: "",
    storage: "",
    displaySize: "",
    displayResolution: "",
    displayType: "",
    touchscreen: false,
    graphics: "",
    ports: "",
    weight: "",
    os: "",
    shortDescription: "",
    fullDescription: "",
    features: "",
    images: "",
  };
}
