"use client";

import { AdminQuickCreateModal } from "@/components/admin/AdminQuickCreateModal";
import { Button } from "@/components/ui/button";

import { AdminProduct } from "@/lib/admin-data";
import { fetchAdminProducts } from "@/lib/admin-products-api";
import { ArrowDown, ArrowUp, ChevronLeft, Plus, Trash2, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const CONDITIONS = ["New", "Used", "Refurbished", "Open Box"];
const STOCK_STATUSES = [
  "In Stock",
  "Limited Stock",
  "Out of Stock",
  "Pre Order",
];

type ProductEditorFormProps = {
  title: string;
  subtitle: string;
  submitLabel: string;
  initialProduct?: AdminProduct;
  onSubmitProductAction: (
    product: Omit<AdminProduct, "id">,
  ) => Promise<unknown>;
};

type ProductFormState = {
  name: string;
  brand: string;
  model: string;
  category: string;
  condition: string;
  grade: string;
  sku: string;
  description: string;
  fullDescription: string;
  price: string;
  marketPrice: string;
  currency: string;
  taxIncluded: boolean;
  stock: string;
  stockStatus: string;
  lowStockThreshold: string;
  status: string;
  featured: boolean;
  tagsInput: string;
  features: string[];
  specs: {
    processor: string;
    ram: string;
    storage: string;
    displaySize: string;
    displayResolution: string;
    displayType: string;
    displayTouchscreen: boolean;
    graphics: string;
    portsInput: string;
    battery: string;
    weight: string;
    dimensions: string;
    os: string;
  };
  warranty: {
    period: string;
    type: string;
    details: string;
  };
};

type CreateOptionModalState = {
  open: boolean;
  field: "brand" | "category";
  value: string;
  error: string;
};

function deriveStockStatus(stock: number, lowStockThreshold: number) {
  if (stock <= 0) {
    return "Out of Stock";
  }
  if (stock <= lowStockThreshold) {
    return "Limited Stock";
  }
  return "In Stock";
}

function buildDisplaySummary(form: ProductFormState) {
  return [
    form.specs.displaySize.trim(),
    form.specs.displayResolution.trim(),
    form.specs.displayType.trim(),
    form.specs.displayTouchscreen ? "Touchscreen" : undefined,
  ]
    .filter(Boolean)
    .join(" | ");
}

function buildAutoProductName(form: ProductFormState) {
  const brand = form.brand.trim();
  const model = form.model.trim();
  const category = form.category.trim();

  const categoryLabel = category
    ? /laptop/i.test(category)
      ? category
      : `${category} Laptop`
    : "Laptop";

  const baseTitle = [brand, model, categoryLabel].filter(Boolean).join(" ");

  const displaySize = form.specs.displaySize.trim();
  const displayResolution = form.specs.displayResolution.trim();
  const displayType = form.specs.displayType.trim();
  const processor = form.specs.processor.trim();
  const ram = form.specs.ram.trim();
  const storage = form.specs.storage.trim();
  const os = form.specs.os.trim();

  const displayParts = [displaySize, displayResolution, displayType].filter(
    Boolean,
  );

  const displayClause =
    displayParts.length > 0
      ? displayParts.join(" ")
      : form.specs.displayTouchscreen
        ? "Touch Display"
        : "";

  const ramClause = ram ? (/\bram\b/i.test(ram) ? ram : `${ram} RAM`) : "";

  const detailClauses = [
    displayClause,
    processor,
    ramClause,
    storage,
    os,
  ].filter(Boolean);

  if (!baseTitle && detailClauses.length === 0) {
    return "";
  }

  if (detailClauses.length === 0) {
    return baseTitle;
  }

  return `${baseTitle}, ${detailClauses.join(", ")}`
    .replace(/\s+/g, " ")
    .trim();
}

function buildInitialState(initialProduct?: AdminProduct): ProductFormState {
  const displayDetails = initialProduct?.specs?.displayDetails;

  return {
    name: initialProduct?.name || "",
    brand: initialProduct?.brand || "",
    model: initialProduct?.model || "",
    category: initialProduct?.category || "",
    condition: initialProduct?.condition || "Used",
    grade: initialProduct?.grade || "",
    sku: initialProduct?.sku || "",
    description: initialProduct?.description || "",
    fullDescription: initialProduct?.fullDescription || "",
    price: initialProduct ? String(initialProduct.price) : "",
    marketPrice:
      initialProduct?.salePrice !== undefined
        ? String(initialProduct.salePrice)
        : "",
    currency: initialProduct?.currency || "BDT",
    taxIncluded: initialProduct?.taxIncluded ?? true,
    stock: initialProduct ? String(initialProduct.stock) : "",
    stockStatus:
      initialProduct?.stockStatus ||
      deriveStockStatus(
        initialProduct?.stock ?? 0,
        initialProduct?.lowStockThreshold ?? 10,
      ),
    lowStockThreshold: String(initialProduct?.lowStockThreshold ?? 10),
    status:
      initialProduct?.statusValue === "archived"
        ? "Archived"
        : initialProduct?.statusValue === "draft"
          ? "Draft"
          : "Active",
    featured: Boolean(initialProduct?.featured),
    tagsInput: (initialProduct?.tags || []).join(", "),
    features: initialProduct?.features || [],
    specs: {
      processor: initialProduct?.specs?.processor || "",
      ram: initialProduct?.specs?.ram || "",
      storage: initialProduct?.specs?.storage || "",
      displaySize: displayDetails?.size || "",
      displayResolution: displayDetails?.resolution || "",
      displayType:
        displayDetails?.type ||
        (displayDetails ? "" : initialProduct?.specs?.display || ""),
      displayTouchscreen: Boolean(displayDetails?.touchscreen),
      graphics: initialProduct?.specs?.graphics || "",
      portsInput:
        initialProduct?.specs?.portsList?.join(", ") ||
        initialProduct?.specs?.ports ||
        "",
      battery: initialProduct?.specs?.battery || "",
      weight: initialProduct?.specs?.weight || "",
      dimensions: initialProduct?.specs?.dimensions || "",
      os: initialProduct?.specs?.os || "",
    },
    warranty: {
      period: initialProduct?.warranty?.period || "",
      type: initialProduct?.warranty?.type || "",
      details: initialProduct?.warranty?.details || "",
    },
  };
}

export function ProductEditorForm({
  title,
  subtitle,
  submitLabel,
  initialProduct,
  onSubmitProductAction,
}: ProductEditorFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(
    null,
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialProduct?.images || [],
  );
  const [imageError, setImageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState<ProductFormState>(
    buildInitialState(initialProduct),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [createOptionModal, setCreateOptionModal] =
    useState<CreateOptionModalState>({
      open: false,
      field: "brand",
      value: "",
      error: "",
    });
  const [autoNameEnabled, setAutoNameEnabled] = useState(!initialProduct);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const normalizedBrandOptions = useMemo(
    () =>
      [
        ...new Set(brandOptions.map((value) => value.trim()).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b)),
    [brandOptions],
  );

  const normalizedCategoryOptions = useMemo(
    () =>
      [
        ...new Set(
          categoryOptions.map((value) => value.trim()).filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [categoryOptions],
  );

  const autoGeneratedName = useMemo(
    () => buildAutoProductName(form),
    [
      form.brand,
      form.model,
      form.category,
      form.specs.displaySize,
      form.specs.displayResolution,
      form.specs.displayType,
      form.specs.displayTouchscreen,
      form.specs.processor,
      form.specs.ram,
      form.specs.storage,
      form.specs.os,
    ],
  );

  useEffect(() => {
    let active = true;

    fetchAdminProducts()
      .then((products) => {
        if (!active) return;

        const loadedBrands = products
          .map((product) => product.brand?.trim())
          .filter(Boolean) as string[];
        const loadedCategories = products
          .map((product) => product.category?.trim())
          .filter(Boolean) as string[];

        setBrandOptions((current) => [...current, ...loadedBrands]);
        setCategoryOptions((current) => [...current, ...loadedCategories]);
      })
      .catch(() => {
        // Keep the form usable even if list loading fails.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const currentBrand = form.brand.trim();
    const currentCategory = form.category.trim();

    if (currentBrand) {
      setBrandOptions((current) => [...current, currentBrand]);
    }
    if (currentCategory) {
      setCategoryOptions((current) => [...current, currentCategory]);
    }
  }, [form.brand, form.category]);

  useEffect(() => {
    if (!autoNameEnabled) return;

    setForm((current) => {
      if (current.name === autoGeneratedName) {
        return current;
      }
      return { ...current, name: autoGeneratedName };
    });
  }, [autoGeneratedName, autoNameEnabled]);

  const inputCls =
    "w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-black focus:border-black outline-none transition-all text-sm";

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) nextErrors.name = "Product name is required";
    if (!form.brand.trim()) nextErrors.brand = "Brand is required";
    if (!form.sku.trim()) nextErrors.sku = "SKU is required";
    if (!form.category.trim()) nextErrors.category = "Category is required";
    if (!form.description.trim()) {
      nextErrors.description = "Short description is required";
    }

    const price = Number(form.price);
    const marketPrice = form.marketPrice ? Number(form.marketPrice) : undefined;
    const stock = Number(form.stock);
    const lowStockThreshold = Number(form.lowStockThreshold);

    if (!form.price || Number.isNaN(price) || price < 0) {
      nextErrors.price = "Current price must be a valid non-negative number";
    }
    if (
      form.marketPrice &&
      (marketPrice === undefined ||
        Number.isNaN(marketPrice) ||
        marketPrice < 0)
    ) {
      nextErrors.marketPrice =
        "Market price must be a valid non-negative number";
    }
    if (
      marketPrice !== undefined &&
      !Number.isNaN(price) &&
      marketPrice < price
    ) {
      nextErrors.marketPrice =
        "Market price cannot be lower than current price";
    }
    if (!form.stock || Number.isNaN(stock) || stock < 0) {
      nextErrors.stock = "Stock quantity must be a valid non-negative number";
    }
    if (
      !form.lowStockThreshold ||
      Number.isNaN(lowStockThreshold) ||
      lowStockThreshold < 0
    ) {
      nextErrors.lowStockThreshold =
        "Low stock threshold must be a valid non-negative number";
    }

    const categoryKey = form.category.trim().toLowerCase();
    const isProductWithTechSpecs =
      !categoryKey.includes("accessor") && !categoryKey.includes("component");

    if (isProductWithTechSpecs) {
      if (!form.specs.processor.trim()) {
        nextErrors.processor = "Processor is required";
      }
      if (!form.specs.ram.trim()) {
        nextErrors.ram = "RAM is required";
      }
      if (!form.specs.storage.trim()) {
        nextErrors.storage = "Storage is required";
      }
    }

    if (imageUrls.length === 0) {
      nextErrors.images = "At least one product image is required";
    }

    return nextErrors;
  };

  const setField = (field: keyof ProductFormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSubmitError("");
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const setSpecField = (
    field: keyof ProductFormState["specs"],
    value: string | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      specs: { ...current.specs, [field]: value },
    }));
    setSubmitError("");
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const setWarrantyField = (
    field: keyof ProductFormState["warranty"],
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      warranty: { ...current.warranty, [field]: value },
    }));
  };

  const addFeature = () => {
    setForm((current) => ({
      ...current,
      features: [...(current.features || []), ""],
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setForm((current) => {
      const nextFeatures = [...(current.features || [])];
      nextFeatures[index] = value;
      return { ...current, features: nextFeatures };
    });
  };

  const removeFeature = (index: number) => {
    setForm((current) => ({
      ...current,
      features: (current.features || []).filter((_, i) => i !== index),
    }));
  };

  const moveFeature = (index: number, direction: "up" | "down") => {
    setForm((current) => {
      const nextFeatures = [...(current.features || [])];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= nextFeatures.length) {
        return current;
      }
      const temp = nextFeatures[index];
      nextFeatures[index] = nextFeatures[targetIndex];
      nextFeatures[targetIndex] = temp;
      return { ...current, features: nextFeatures };
    });
  };

  const generateSku = () => {
    const base = `${form.brand}-${form.model || form.name}`
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 44);

    if (base) {
      // If the current SKU has a conflict error, append a short unique suffix
      const suffix = errors.sku ? `-${Date.now().toString(36).toUpperCase().slice(-4)}` : "";
      setField("sku", `${base}${suffix}`);
    }
  };

  const openCreateModal = (field: "brand" | "category") => {
    const initialValue = field === "brand" ? form.brand : form.category;

    setCreateOptionModal({
      open: true,
      field,
      value: initialValue,
      error: "",
    });
  };

  const closeCreateModal = () => {
    setCreateOptionModal((current) => ({
      ...current,
      open: false,
      error: "",
    }));
  };

  const createOptionFromModal = () => {
    const nextValue = createOptionModal.value.trim();
    const fieldLabel =
      createOptionModal.field === "brand" ? "Brand" : "Category";

    if (!nextValue) {
      setCreateOptionModal((current) => ({
        ...current,
        error: `${fieldLabel} name cannot be empty`,
      }));
      return;
    }

    if (createOptionModal.field === "brand") {
      setField("brand", nextValue);
      setBrandOptions((current) => [...current, nextValue]);
    } else {
      setField("category", nextValue);
      setCategoryOptions((current) => [...current, nextValue]);
    }

    closeCreateModal();
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const appendSelectedFiles = (files: File[]) => {
    if (files.length === 0) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length !== files.length) {
      setImageError("Only image files are allowed");
    } else {
      setImageError("");
    }

    setSelectedFiles((current) => [...current, ...imageFiles]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const uploadSelectedImages = async () => {
    if (selectedFiles.length === 0) return;
    setUploadingImages(true);
    setImageError("");

    try {
      const uploadedUrls: string[] = [];

      for (const file of selectedFiles) {
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image file`);
        }
        if (file.size > 8 * 1024 * 1024) {
          throw new Error(`${file.name} exceeds 8MB size limit`);
        }

        const data = new FormData();
        data.append("file", file);
        data.append("folder", "/laptop-point/products");

        const response = await fetch("/api/admin/imagekit/upload", {
          method: "POST",
          body: data,
        });

        const json = await response.json();
        if (!response.ok) {
          throw new Error(json?.error || `Upload failed for ${file.name}`);
        }

        uploadedUrls.push(String(json.url));
      }

      setImageUrls((current) => [...new Set([...current, ...uploadedUrls])]);
      setSelectedFiles([]);
      setErrors((current) => {
        const next = { ...current };
        delete next.images;
        return next;
      });
    } catch (error) {
      setImageError(
        error instanceof Error ? error.message : "Image upload failed",
      );
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (url: string) => {
    setImageUrls((current) => current.filter((imageUrl) => imageUrl !== url));
  };

  const setPrimaryImage = (index: number) => {
    setImageUrls((current) => {
      if (index < 0 || index >= current.length) return current;
      const next = [...current];
      const [picked] = next.splice(index, 1);
      next.unshift(picked);
      return next;
    });
  };

  const handleImageDrop = (targetIndex: number) => {
    setImageUrls((current) => {
      if (draggedImageIndex === null || draggedImageIndex === targetIndex) {
        return current;
      }
      if (draggedImageIndex < 0 || draggedImageIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [picked] = next.splice(draggedImageIndex, 1);
      next.splice(targetIndex, 0, picked);
      return next;
    });
    setDraggedImageIndex(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setSubmitError("");

    try {
      const tags = form.tagsInput
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
      const features = (form.features || [])
        .map((entry) => entry.trim())
        .filter(Boolean);
      const portsList = form.specs.portsInput
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
      const price = Number(form.price);
      const marketPrice = form.marketPrice
        ? Number(form.marketPrice)
        : undefined;
      const stock = Number(form.stock);
      const lowStockThreshold = Number(form.lowStockThreshold);
      const computedStockStatus =
        form.stockStatus || deriveStockStatus(stock, lowStockThreshold);
      const displaySummary = buildDisplaySummary(form);

      await onSubmitProductAction({
        name: form.name.trim(),
        brand: form.brand.trim(),
        model: form.model.trim() || undefined,
        category: form.category,
        condition: form.condition.trim() || undefined,
        grade: form.grade.trim() || undefined,
        sku: form.sku.trim(),
        description: form.description.trim(),
        fullDescription: form.fullDescription.trim() || undefined,
        price,
        salePrice: marketPrice,
        currency: form.currency.trim() || "BDT",
        taxIncluded: form.taxIncluded,
        stock,
        stockStatus: computedStockStatus,
        lowStockThreshold,
        status: form.status,
        featured: form.featured,
        tags,
        features,
        specs: {
          processor: form.specs.processor.trim() || undefined,
          ram: form.specs.ram.trim() || undefined,
          storage: form.specs.storage.trim() || undefined,
          display: displaySummary || undefined,
          displayDetails:
            displaySummary || form.specs.displayTouchscreen
              ? {
                  size: form.specs.displaySize.trim() || undefined,
                  resolution: form.specs.displayResolution.trim() || undefined,
                  type: form.specs.displayType.trim() || undefined,
                  touchscreen: form.specs.displayTouchscreen,
                }
              : undefined,
          graphics: form.specs.graphics.trim() || undefined,
          ports: portsList.join(", ") || undefined,
          portsList: portsList.length > 0 ? portsList : undefined,
          battery: form.specs.battery.trim() || undefined,
          weight: form.specs.weight.trim() || undefined,
          dimensions: form.specs.dimensions.trim() || undefined,
          os: form.specs.os.trim() || undefined,
        },
        warranty: {
          period: form.warranty.period.trim() || undefined,
          type: form.warranty.type.trim() || undefined,
          details: form.warranty.details.trim() || undefined,
        },
        images: imageUrls,
      });

      router.push("/admin/products");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save product";

      // Detect SKU conflict (409) and highlight the SKU field
      const isSkuConflict =
        /already exists|duplicate|sku/i.test(message);

      if (isSkuConflict) {
        setErrors((current) => ({
          ...current,
          sku: `SKU "${form.sku.trim()}" is already taken. Please use a different SKU.`,
        }));
        setSubmitError(
          "SKU conflict: a product with this SKU already exists. Update the SKU field above and try again.",
        );
      } else {
        setSubmitError(message);
      }
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-black">{title}</h1>
          <p className="text-gray-500">{subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <section className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-xl font-medium text-gray-900">Basic Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAutoNameEnabled((current) => !current);
                      }}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        autoNameEnabled
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Auto Name {autoNameEnabled ? "ON" : "OFF"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAutoNameEnabled(true);
                        setField("name", autoGeneratedName);
                      }}
                      className="text-xs text-gray-600 underline"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => {
                    if (autoNameEnabled) {
                      setAutoNameEnabled(false);
                    }
                    setField("name", event.target.value);
                  }}
                  placeholder='e.g. HP Elitebook 840 G8 Business Laptop, 14" 1920 x 1080 FHD Touch, Intel Core i5-1135G7, 16GB RAM, 256GB M.2 SSD, Windows 11 Pro'
                  className={inputCls}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Fill brand, model, category, display, processor, RAM, storage,
                  and OS to auto-generate the name.
                </p>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.brand}
                    onChange={(event) => setField("brand", event.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select a brand</option>
                    {normalizedBrandOptions.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openCreateModal("brand")}
                    title="Create brand"
                    className="shrink-0 gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>
                {errors.brand && (
                  <p className="text-red-500 text-xs mt-1">{errors.brand}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  value={form.model}
                  onChange={(event) => setField("model", event.target.value)}
                  placeholder="e.g. EliteBook 840 G8"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setField("category", event.target.value)
                    }
                    className={inputCls}
                  >
                    <option value="">Select a category</option>
                    {normalizedCategoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openCreateModal("category")}
                    title="Create category"
                    className="shrink-0 gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(event) => setField("sku", event.target.value)}
                  placeholder="e.g. HP-840G8-I5-006"
                  className={`${inputCls} ${errors.sku ? "border-red-500 ring-2 ring-red-200" : ""}`}
                />
                {errors.sku && (
                  <p className="text-red-500 text-xs mt-1">{errors.sku}</p>
                )}
                <button
                  type="button"
                  className="mt-2 text-xs text-gray-600 underline"
                  onClick={generateSku}
                >
                  Generate SKU from brand + model/name
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  value={form.condition}
                  onChange={(event) =>
                    setField("condition", event.target.value)
                  }
                  className={inputCls}
                >
                  {CONDITIONS.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade
                </label>
                <input
                  type="text"
                  value={form.grade}
                  onChange={(event) => setField("grade", event.target.value)}
                  placeholder="e.g. A+, Like New, Premium"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.status}
                  onChange={(event) => setField("status", event.target.value)}
                  className={inputCls}
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="md:col-span-2 mt-8">
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h2 className="text-xl font-medium text-gray-900">Descriptions</h2>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        setField("description", event.target.value)
                      }
                      rows={3}
                      placeholder="Short summary for products description field and product listing pages"
                      className={inputCls}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Description
                    </label>
                    <textarea
                      value={form.fullDescription}
                      onChange={(event) =>
                        setField("fullDescription", event.target.value)
                      }
                      rows={8}
                      placeholder="Long description for product details page. Can include features, specifications, and other details."
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 mt-8">
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h2 className="text-xl font-medium text-gray-900">Pricing & Stock</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Price ({form.currency || "BDT"}){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={(event) =>
                        setField("price", event.target.value)
                      }
                      placeholder="e.g. 41500"
                      className={inputCls}
                    />
                    {errors.price && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.price}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Market Price ({form.currency || "BDT"})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.marketPrice}
                      onChange={(event) =>
                        setField("marketPrice", event.target.value)
                      }
                      placeholder="e.g. 48000"
                      className={inputCls}
                    />
                    {errors.marketPrice && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.marketPrice}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <input
                      type="text"
                      value={form.currency}
                      onChange={(event) =>
                        setField("currency", event.target.value)
                      }
                      placeholder="BDT"
                      className={inputCls}
                    />
                  </div>
                  <div className="flex items-center pt-7">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.taxIncluded}
                        onChange={(event) =>
                          setField("taxIncluded", event.target.checked)
                        }
                      />
                      Tax included
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(event) =>
                        setField("stock", event.target.value)
                      }
                      placeholder="0"
                      className={inputCls}
                    />
                    {errors.stock && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.stock}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Status Label
                    </label>
                    <select
                      value={form.stockStatus}
                      onChange={(event) =>
                        setField("stockStatus", event.target.value)
                      }
                      className={inputCls}
                    >
                      {STOCK_STATUSES.map((stockStatus) => (
                        <option key={stockStatus} value={stockStatus}>
                          {stockStatus}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.lowStockThreshold}
                      onChange={(event) =>
                        setField("lowStockThreshold", event.target.value)
                      }
                      className={inputCls}
                    />
                    {errors.lowStockThreshold && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.lowStockThreshold}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center pt-7">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(event) =>
                          setField("featured", event.target.checked)
                        }
                      />
                      Featured product
                    </label>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 mt-8">
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h2 className="text-xl font-medium text-gray-900">Technical Specifications</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Processor
                    </label>
                    <input
                      type="text"
                      value={form.specs.processor}
                      onChange={(event) =>
                        setSpecField("processor", event.target.value)
                      }
                      placeholder="e.g. Intel Core i5-1135G7"
                      className={inputCls}
                    />
                    {errors.processor && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.processor}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      RAM
                    </label>
                    <input
                      type="text"
                      value={form.specs.ram}
                      onChange={(event) =>
                        setSpecField("ram", event.target.value)
                      }
                      placeholder="e.g. 16GB DDR4"
                      className={inputCls}
                    />
                    {errors.ram && (
                      <p className="text-red-500 text-xs mt-1">{errors.ram}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Storage
                    </label>
                    <input
                      type="text"
                      value={form.specs.storage}
                      onChange={(event) =>
                        setSpecField("storage", event.target.value)
                      }
                      placeholder="e.g. 512GB NVMe SSD"
                      className={inputCls}
                    />
                    {errors.storage && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.storage}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Graphics
                    </label>
                    <input
                      type="text"
                      value={form.specs.graphics}
                      onChange={(event) =>
                        setSpecField("graphics", event.target.value)
                      }
                      placeholder="e.g. Intel Iris Xe Graphics"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Size
                    </label>
                    <input
                      type="text"
                      value={form.specs.displaySize}
                      onChange={(event) =>
                        setSpecField("displaySize", event.target.value)
                      }
                      placeholder="e.g. 14.0 inch"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Resolution
                    </label>
                    <input
                      type="text"
                      value={form.specs.displayResolution}
                      onChange={(event) =>
                        setSpecField("displayResolution", event.target.value)
                      }
                      placeholder="e.g. 1920 x 1080 (FHD)"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Type
                    </label>
                    <input
                      type="text"
                      value={form.specs.displayType}
                      onChange={(event) =>
                        setSpecField("displayType", event.target.value)
                      }
                      placeholder="e.g. IPS Anti-Glare"
                      className={inputCls}
                    />
                  </div>
                  <div className="flex items-center pt-7">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.specs.displayTouchscreen}
                        onChange={(event) =>
                          setSpecField(
                            "displayTouchscreen",
                            event.target.checked,
                          )
                        }
                      />
                      Touchscreen display
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ports
                    </label>
                    <input
                      type="text"
                      value={form.specs.portsInput}
                      onChange={(event) =>
                        setSpecField("portsInput", event.target.value)
                      }
                      placeholder="Comma separated, e.g. 2x Thunderbolt 4, 2x USB-A, HDMI 2.0"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight
                    </label>
                    <input
                      type="text"
                      value={form.specs.weight}
                      onChange={(event) =>
                        setSpecField("weight", event.target.value)
                      }
                      placeholder="e.g. 1.32 kg"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Operating System
                    </label>
                    <input
                      type="text"
                      value={form.specs.os}
                      onChange={(event) =>
                        setSpecField("os", event.target.value)
                      }
                      placeholder="e.g. Windows 11 Pro"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Battery
                    </label>
                    <input
                      type="text"
                      value={form.specs.battery}
                      onChange={(event) =>
                        setSpecField("battery", event.target.value)
                      }
                      placeholder="e.g. Up to 3 hours"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      value={form.specs.dimensions}
                      onChange={(event) =>
                        setSpecField("dimensions", event.target.value)
                      }
                      placeholder="Optional"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 mt-8">
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h2 className="text-xl font-medium text-gray-900">Features, Tags & Warranty</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Key Features (Bulleted List)
                      </label>
                      <button
                        type="button"
                        onClick={addFeature}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-black hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Feature Bullet
                      </button>
                    </div>

                    <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/30 p-4">
                      {(!form.features || form.features.length === 0) ? (
                        <div className="text-center py-6">
                          <p className="text-xs text-gray-500 mb-2">No key features added yet.</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addFeature}
                            className="text-xs gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add First Feature
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {form.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              {/* Square Bullet Point Representation */}
                              <span className="w-2.5 h-2.5 bg-gray-900 rounded-[2px] shrink-0 ml-1" />
                              
                              <input
                                type="text"
                                value={feature}
                                onChange={(event) => updateFeature(index, event.target.value)}
                                placeholder="e.g. 11th Gen Intel® Core™ i5-1145G7 Processor"
                                className={`${inputCls} flex-1`}
                              />

                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="w-9 h-9 shrink-0"
                                  onClick={() => moveFeature(index, "up")}
                                  disabled={index === 0}
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="w-9 h-9 shrink-0"
                                  onClick={() => moveFeature(index, "down")}
                                  disabled={index === form.features.length - 1}
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="w-9 h-9 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => removeFeature(index)}
                                  title="Delete Feature"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">
                      These bullet points represent the main Highlights that will be displayed in solid squares on the storefront product details page.
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags / Keywords
                    </label>
                    <input
                      type="text"
                      value={form.tagsInput}
                      onChange={(event) =>
                        setField("tagsInput", event.target.value)
                      }
                      placeholder="Comma separated tags for search and SEO"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warranty Period
                    </label>
                    <input
                      type="text"
                      value={form.warranty.period}
                      onChange={(event) =>
                        setWarrantyField("period", event.target.value)
                      }
                      placeholder="e.g. 1 Year"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warranty Type
                    </label>
                    <input
                      type="text"
                      value={form.warranty.type}
                      onChange={(event) =>
                        setWarrantyField("type", event.target.value)
                      }
                      placeholder="e.g. Local Service Warranty"
                      className={inputCls}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warranty Details
                    </label>
                    <textarea
                      value={form.warranty.details}
                      onChange={(event) =>
                        setWarrantyField("details", event.target.value)
                      }
                      rows={2}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 mt-8">
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h2 className="text-xl font-medium text-gray-900">Product Images</h2>
                </div>
                <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/30 p-6">
                  <div
                    className={`rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                      isDraggingFiles
                        ? "border-black bg-white shadow-sm"
                        : "border-gray-300 bg-white"
                    }`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDraggingFiles(true);
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      setIsDraggingFiles(false);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      setIsDraggingFiles(false);
                      appendSelectedFiles(
                        Array.from(event.dataTransfer.files || []),
                      );
                    }}
                  >
                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      Drag and drop product images here
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      or use the buttons below to choose files and upload
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => {
                      appendSelectedFiles(Array.from(event.target.files || []));
                      event.currentTarget.value = "";
                    }}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openFilePicker}
                    >
                      Choose Files
                    </Button>
                    <Button
                      type="button"
                      onClick={uploadSelectedImages}
                      disabled={uploadingImages || selectedFiles.length === 0}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      {uploadingImages ? "Uploading..." : "Upload"}
                    </Button>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, WebP up to 8MB each
                    </p>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-3">
                      <p className="text-xs font-medium text-gray-700">
                        {selectedFiles.length} file(s) ready to upload
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                          >
                            <span
                              className="max-w-44 truncate"
                              title={file.name}
                            >
                              {file.name}
                            </span>
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => removeSelectedFile(index)}
                              aria-label={`Remove ${file.name}`}
                            >
                              x
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {imageError && (
                    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                      {imageError}
                    </p>
                  )}
                  {errors.images && (
                    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                      {errors.images}
                    </p>
                  )}

                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                      {imageUrls.map((url, index) => (
                        <div
                          key={url}
                          className="relative rounded-xl border border-gray-200 bg-white p-2 shadow-sm"
                          draggable
                          onDragStart={() => setDraggedImageIndex(index)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => handleImageDrop(index)}
                        >
                          {index === 0 && (
                            <span className="absolute top-2 left-2 text-[10px] bg-black text-white px-1.5 py-0.5 rounded">
                              Primary
                            </span>
                          )}
                          <img
                            src={url}
                            alt="Product preview"
                            className="w-full h-24 object-cover rounded"
                          />
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              className="text-xs text-gray-700 underline"
                              onClick={() => setPrimaryImage(index)}
                            >
                              Set primary
                            </button>
                            <button
                              type="button"
                              className="text-xs text-red-600 underline hover:text-red-700"
                              onClick={() => removeImage(url)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

        </section>

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:pl-64 border-t border-gray-200 bg-white/80 backdrop-blur-md shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="p-4 px-6 md:px-8 max-w-5xl mx-auto flex items-center justify-between">
            <div>
              {submitError && (
                <p className="text-sm font-medium text-red-600">{submitError}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/products">
                <Button type="button" variant="outline" className="bg-white hover:bg-gray-50 text-gray-700">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white px-8 shadow-sm"
                disabled={saving || uploadingImages}
              >
                {saving ? "Saving..." : submitLabel}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <AdminQuickCreateModal
        open={createOptionModal.open}
        entityLabel={createOptionModal.field}
        value={createOptionModal.value}
        onValueChange={(value) =>
          setCreateOptionModal((current) => ({
            ...current,
            value,
            error: "",
          }))
        }
        error={createOptionModal.error}
        placeholder={
          createOptionModal.field === "brand"
            ? "e.g. Asus"
            : "e.g. Student Laptop"
        }
        onClose={closeCreateModal}
        onConfirm={createOptionFromModal}
      />
    </div>
  );
}
