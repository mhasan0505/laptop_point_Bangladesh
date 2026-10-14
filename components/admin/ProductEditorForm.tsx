"use client";

import { AdminQuickCreateModal } from "@/components/admin/AdminQuickCreateModal";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { FormField } from "@/components/admin/ui/FormField";
import { AdminProduct } from "@/lib/admin-data";
import { fetchAdminProducts } from "@/lib/admin-products-api";
import { ACCESSORY_CATEGORIES } from "@/lib/navigation";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
  X,
  Sparkles,
  Layers,
  Check,
  AlertCircle,
  Copy,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { cn } from "@/lib/utils";

const CONDITIONS = ["New", "Used", "Refurbished", "Open Box"];
const STOCK_STATUSES = [
  "In Stock",
  "Limited Stock",
  "Out of Stock",
  "Pre Order",
];

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ACCEPT_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";
const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB

type SelectedUploadFile = {
  id: string;
  file: File;
  previewUrl: string;
};

export const DEFAULT_SPEC_GROUPS: Record<string, string[]> = {
  Processor: ["Processor Brand", "Processor Model", "Processor Frequency", "Processor Core", "CPU Cache", "NPU"],
  Display: ["Display Size", "Display Type", "Display Resolution", "Touch Screen", "Refresh Rate", "Display Features"],
  Memory: ["RAM", "RAM Type", "Removable", "Total RAM Slot"],
  Storage: ["Storage Type", "Storage Capacity", "Extra M.2 Slot"],
  Graphics: ["Graphics Model", "Graphics Memory", "Graphics Type"],
  "Keyboard & TouchPad": ["Keyboard Type", "Keyboard Features", "TouchPad"],
  "Camera & Audio": ["WebCam", "Speaker", "Microphone", "Audio Features"],
  "Ports & Slots": ["Optical Drive", "USB 3.0 Port", "USB Type-C / Thunderbolt Port", "Headphone & Microphone Port"],
  "Network & Connectivity": ["LAN", "WIFI", "Bluetooth"],
  Security: ["Fingerprint Sensor", "Security Chip"],
  Software: ["Operating System"],
  Power: ["Battery Type", "Battery Capacity", "Backup Time (Approx)", "Adapter Type"],
  "Physical Specification": ["Color", "Dimensions", "Weight"],
  "Other Features": ["Other Features"],
  Warranty: ["Warranty Details"],
};

type SpecRow = { label: string; value: string };

type ProductEditorFormProps = {
  title: string;
  subtitle: string;
  submitLabel: string;
  initialProduct?: AdminProduct;
  onSubmitProductAction: (
    product: Omit<AdminProduct, "id">,
  ) => Promise<unknown>;
};

export type OptionGroupInput = {
  id: string;
  name: string;
  values: string[];
  rawInput: string;
};

export type ProductFormVariant = {
  id?: string;
  sku: string;
  options: Record<string, string>;
  price: string;
  marketPrice: string;
  stockQty: string;
  stockStatus: string;
  imageUrl?: string;
  active: boolean;
};

type ProductFormState = {
  name: string;
  brand: string;
  brandId: string;
  model: string;
  category: string;
  categoryId: string;
  subCategory: string;
  series: string;
  productCode: string;
  color: string;
  connectivity: string;
  keySpecs: string;
  condition: string;
  grade: string;
  sku: string;
  description: string;
  fullDescription: string;
  callForPrice: boolean;
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
  youtubeUrl: string;
  specGroups: Record<string, SpecRow[]>;
  warranty: {
    period: string;
    type: string;
    details: string;
  };
  variantOptionGroups: OptionGroupInput[];
  variants: ProductFormVariant[];
};

type CreateOptionModalState = {
  open: boolean;
  field: "brand" | "category" | "subCategory";
  value: string;
  error: string;
};

function deriveStockStatus(stock: number, lowStockThreshold: number) {
  if (stock <= 0) return "Out of Stock";
  if (stock <= lowStockThreshold) return "Limited Stock";
  return "In Stock";
}

function isAccessoryCategory(category: string): boolean {
  const key = category.trim().toLowerCase();
  if (!key) return false;
  if (
    key === "accessories" ||
    key.includes("accessor") ||
    key.includes("component") ||
    key.includes("peripheral")
  ) {
    return true;
  }
  return ACCESSORY_CATEGORIES.some((value) => value.toLowerCase() === key);
}

function parseInitialSpecs(initialProduct?: AdminProduct): Record<string, SpecRow[]> {
  const result: Record<string, SpecRow[]> = {};
  const rawSpecs = (initialProduct?.specs as Record<string, any>) || {};

  const isGrouped = Object.keys(rawSpecs).some(
    (key) => typeof rawSpecs[key] === "object" && rawSpecs[key] !== null && !Array.isArray(rawSpecs[key])
  );

  for (const [group, defaultKeys] of Object.entries(DEFAULT_SPEC_GROUPS)) {
    const rows: SpecRow[] = [];
    const existingGroup = isGrouped ? (rawSpecs[group] as Record<string, string> || {}) : {};

    for (const key of defaultKeys) {
      let val = existingGroup[key] || "";
      if (!val && !isGrouped) {
        if (group === "Processor" && key === "Processor Model") val = rawSpecs.processor || "";
        if (group === "Memory" && key === "RAM") val = rawSpecs.ram || "";
        if (group === "Storage" && key === "Storage Capacity") val = rawSpecs.storage || "";
        if (group === "Graphics" && key === "Graphics Model") val = rawSpecs.graphics || "";
        if (group === "Software" && key === "Operating System") val = rawSpecs.os || "";
        if (group === "Display" && key === "Display Size") val = rawSpecs.displayDetails?.size || rawSpecs.display || "";
        if (group === "Display" && key === "Display Resolution") val = rawSpecs.displayDetails?.resolution || "";
        if (group === "Display" && key === "Display Type") val = rawSpecs.displayDetails?.type || "";
        if (group === "Display" && key === "Touch Screen") val = rawSpecs.displayDetails?.touchscreen ? "Yes" : "";
        if (group === "Ports & Slots" && key === "USB 3.0 Port") val = rawSpecs.portsList?.join(", ") || rawSpecs.ports || "";
        if (group === "Power" && key === "Battery Capacity") val = rawSpecs.battery || "";
        if (group === "Physical Specification" && key === "Weight") val = rawSpecs.weight || "";
        if (group === "Physical Specification" && key === "Dimensions") val = rawSpecs.dimensions || "";
        if (group === "Warranty" && key === "Warranty Details") val = initialProduct?.warranty?.details || "";
      }
      rows.push({ label: key, value: String(val || "") });
    }

    for (const [key, val] of Object.entries(existingGroup)) {
      if (!defaultKeys.includes(key)) {
        rows.push({ label: key, value: String(val || "") });
      }
    }

    result[group] = rows;
  }

  if (isGrouped) {
    for (const [group, groupObj] of Object.entries(rawSpecs)) {
      if (!DEFAULT_SPEC_GROUPS[group] && typeof groupObj === "object" && groupObj !== null) {
        result[group] = Object.entries(groupObj as Record<string, string>).map(([label, value]) => ({
          label,
          value: String(value || ""),
        }));
      }
    }
  }

  return result;
}

function buildAutoProductName(
  brand: string,
  model: string,
  category: string,
  specGroups: Record<string, SpecRow[]>,
  connectivity?: string,
  keySpecs?: string
) {
  const isAccessory = isAccessoryCategory(category);
  const categoryLabel = category
    ? isAccessory || /laptop/i.test(category)
      ? category
      : `${category} Laptop`
    : "Laptop";

  const baseTitle = [brand.trim(), model.trim(), categoryLabel].filter(Boolean).join(" ");

  if (isAccessory) {
    const details = [connectivity?.trim(), keySpecs?.trim()].filter(Boolean);
    if (!baseTitle && details.length === 0) return "";
    if (details.length === 0) return baseTitle;
    return `${baseTitle} (${details.join(", ")})`.replace(/\s+/g, " ").trim();
  }

  const findSpec = (group: string, label: string) => {
    return specGroups[group]?.find((r) => r.label.toLowerCase() === label.toLowerCase())?.value?.trim() || "";
  };

  const display = findSpec("Display", "Display Size");
  const processor = findSpec("Processor", "Processor Model") || findSpec("Processor", "Processor Brand");
  const ram = findSpec("Memory", "RAM");
  const storage = findSpec("Storage", "Storage Capacity");
  const os = findSpec("Software", "Operating System");

  const ramClause = ram ? (/\bram\b/i.test(ram) ? ram : `${ram} RAM`) : "";
  const detailClauses = [display, processor, ramClause, storage, os].filter(Boolean);

  if (!baseTitle && detailClauses.length === 0) return "";
  if (detailClauses.length === 0) return baseTitle;
  return `${baseTitle}, ${detailClauses.join(", ")}`.replace(/\s+/g, " ").trim();
}

function buildInitialState(initialProduct?: AdminProduct): ProductFormState {
  const isCallForPrice = initialProduct
    ? (initialProduct.price === null || initialProduct.price === undefined)
    : false;

  const rawSpecs = (initialProduct?.specs as Record<string, any>) || {};
  const periphSpecs = rawSpecs["Peripherals & Accessories"] || {};
  const generalSpecs = rawSpecs["General"] || {};
  const physicalSpecs = rawSpecs["Physical Specification"] || {};

  return {
    name: initialProduct?.name || "",
    brand: initialProduct?.brand || "",
    brandId: initialProduct?.brandId || "",
    model: initialProduct?.model || "",
    category: initialProduct?.category || "",
    categoryId: initialProduct?.categoryId || "",
    subCategory:
      generalSpecs["Sub-Category"] ||
      rawSpecs.subCategory ||
      rawSpecs["Sub-Category"] ||
      "",
    series:
      generalSpecs["Series"] ||
      rawSpecs.series ||
      rawSpecs["Series"] ||
      "",
    productCode:
      generalSpecs["Product Code"] ||
      rawSpecs.productCode ||
      rawSpecs["Product Code"] ||
      "",
    color:
      physicalSpecs["Color"] ||
      rawSpecs.color ||
      "",
    connectivity:
      periphSpecs["Connectivity & Interface"] ||
      rawSpecs.connectivity ||
      "",
    keySpecs:
      periphSpecs["Key Specifications / Layout"] ||
      rawSpecs.keySpecs ||
      "",
    condition: initialProduct?.condition || "",
    grade: initialProduct?.grade || "",
    sku: initialProduct?.sku || "",
    description: initialProduct?.description || "",
    fullDescription: initialProduct?.fullDescription || "",
    callForPrice: isCallForPrice,
    price: initialProduct && initialProduct.price !== null && initialProduct.price !== undefined
      ? String(initialProduct.price)
      : "",
    marketPrice:
      initialProduct?.marketPrice !== undefined && initialProduct?.marketPrice !== null
        ? String(initialProduct.marketPrice)
        : initialProduct?.regularPrice !== undefined && initialProduct?.regularPrice !== null
          ? String(initialProduct.regularPrice)
          : initialProduct?.salePrice !== undefined && initialProduct?.salePrice !== null
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
    youtubeUrl: initialProduct?.youtubeUrl || "",
    specGroups: parseInitialSpecs(initialProduct),
    warranty: {
      period: initialProduct?.warranty?.period || "",
      type: initialProduct?.warranty?.type || "",
      details: initialProduct?.warranty?.details || "",
    },
    variantOptionGroups: (() => {
      const rawOptions = (initialProduct?.variantOptions as any) || [];
      if (Array.isArray(rawOptions) && rawOptions.length > 0) {
        return rawOptions.map((og: any, idx: number) => ({
          id: `opt-${idx}`,
          name: og.name || "",
          values: Array.isArray(og.values) ? og.values : [],
          rawInput: Array.isArray(og.values) ? og.values.join(", ") : "",
        }));
      }
      const rawV = initialProduct?.variants || [];
      if (rawV.length > 0) {
        const extracted = new Map<string, Set<string>>();
        rawV.forEach((v: any) => {
          if (v.options && typeof v.options === "object") {
            Object.entries(v.options).forEach(([k, val]) => {
              if (!extracted.has(k)) extracted.set(k, new Set());
              extracted.get(k)!.add(String(val));
            });
          }
        });
        let idx = 0;
        const res: OptionGroupInput[] = [];
        extracted.forEach((vals, name) => {
          const arr = Array.from(vals);
          res.push({
            id: `opt-${idx++}`,
            name,
            values: arr,
            rawInput: arr.join(", "),
          });
        });
        return res;
      }
      return [];
    })(),
    variants: (initialProduct?.variants || []).map((v: any) => {
      let opts = (typeof v.options === "object" && v.options !== null ? v.options : {}) as Record<string, string>;
      if (Object.keys(opts).length === 0 && v.name) {
        opts = { Configuration: v.name };
      }
      return {
        id: v.id,
        sku: v.sku || "",
        options: opts,
        price: v.price !== undefined && v.price !== null ? String(v.price) : "",
        marketPrice:
          (v.marketPrice ?? v.regularPrice ?? v.originalPrice) !== undefined &&
          (v.marketPrice ?? v.regularPrice ?? v.originalPrice) !== null
            ? String(v.marketPrice ?? v.regularPrice ?? v.originalPrice)
            : "",
        stockQty:
          v.stockQty !== undefined
            ? String(v.stockQty)
            : v.stock !== undefined
            ? String(v.stock)
            : "0",
        stockStatus: v.stockStatus || "In Stock",
        imageUrl: v.imageUrl || "",
        active: v.active !== false,
      };
    }),
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
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedUploadFile[]>([]);
  const activeObjectUrlsRef = useRef<Set<string>>(new Set());
  const [imageUrls, setImageUrls] = useState<string[]>(initialProduct?.images || []);
  const [imageError, setImageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState<ProductFormState>(buildInitialState(initialProduct));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [masterBrandsList, setMasterBrandsList] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [masterCategoriesList, setMasterCategoriesList] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([
    "Accessories",
    "Gaming Laptop",
    "Ultrabook",
    "Business Laptop",
    "Student Laptop",
    "Workstation",
    "2-in-1 Laptop",
  ]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<string[]>([
    "Mouse",
    "Keyboard",
    "Headsets & Audio",
    "Adapters & Cables",
    "Chargers & Power",
    "Laptop Stand",
    "Cooling Pad",
    "Laptop Bags & Sleeves",
    "Monitors",
    "Webcams",
    "Storage & Docks",
  ]);
  const [conditionOptions, setConditionOptions] = useState<string[]>([
    "Brand New",
    "Open Box",
    "Official Refurbished",
    "Pre-Owned / Like New",
    "Pre-Owned / Excellent",
    "Pre-Owned / Good",
    "New",
    "Used",
  ]);
  const [gradeOptions, setGradeOptions] = useState<string[]>([
    "A+",
    "A",
    "A-",
    "B+",
    "B",
  ]);
  const [warrantyTypeOptions, setWarrantyTypeOptions] = useState<string[]>([
    "Official Brand Warranty",
    "Shop Replacement & Free Service Warranty",
    "Parts & Service Warranty",
    "International Warranty",
  ]);
  const [createOptionModal, setCreateOptionModal] = useState<CreateOptionModalState>({
    open: false,
    field: "brand",
    value: "",
    error: "",
  });
  const [autoNameEnabled, setAutoNameEnabled] = useState(!initialProduct);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Processor: true,
    Display: true,
    Memory: true,
    Storage: true,
    Graphics: true,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  // Option Group Handlers
  const addOptionGroup = () => {
    setForm((prev) => ({
      ...prev,
      variantOptionGroups: [
        ...prev.variantOptionGroups,
        {
          id: `opt-${Date.now()}`,
          name: "",
          values: [],
          rawInput: "",
        },
      ],
    }));
  };

  const removeOptionGroup = (id: string) => {
    setForm((prev) => ({
      ...prev,
      variantOptionGroups: prev.variantOptionGroups.filter((g) => g.id !== id),
    }));
  };

  const updateOptionGroup = (id: string, name: string, rawInput: string) => {
    const values = rawInput
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    setForm((prev) => ({
      ...prev,
      variantOptionGroups: prev.variantOptionGroups.map((g) =>
        g.id === id ? { ...g, name, rawInput, values } : g
      ),
    }));
  };

  const generateCombinations = () => {
    const activeGroups = form.variantOptionGroups.filter(
      (g) => g.name.trim() && g.values.length > 0
    );

    if (activeGroups.length === 0) {
      showErrorToast("Please add at least one attribute with values before generating combinations.");
      return;
    }

    let combinations: Record<string, string>[] = [{}];
    for (const group of activeGroups) {
      const nextCombos: Record<string, string>[] = [];
      const gName = group.name.trim();
      for (const combo of combinations) {
        for (const val of group.values) {
          nextCombos.push({ ...combo, [gName]: val.trim() });
        }
      }
      combinations = nextCombos;
    }

    let baseSku = form.sku.trim();
    if (!baseSku) {
      const derived = `${form.brand}-${form.model || form.name}`
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 44);
      if (derived) {
        baseSku = derived;
        setField("sku", derived);
      }
    }

    const existingVariants = form.variants;

    const newVariants: ProductFormVariant[] = combinations.map((combo, idx) => {
      const suffix = Object.values(combo)
        .map((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, ""))
        .filter(Boolean)
        .join("-");

      const existing = existingVariants.find((ev) => {
        const keys = Object.keys(combo);
        const evKeys = Object.keys(ev.options);
        if (keys.length !== evKeys.length) return false;
        return keys.every((k) => ev.options[k] === combo[k]);
      });

      if (existing) {
        const isGenericVarSku = !existing.sku || existing.sku.startsWith("VAR-");
        return {
          ...existing,
          sku: isGenericVarSku && baseSku ? `${baseSku.toUpperCase()}-${suffix || idx + 1}` : existing.sku,
          options: combo,
        };
      }

      const autoSku = baseSku
        ? `${baseSku.toUpperCase()}-${suffix || idx + 1}`
        : `VAR-${Date.now().toString(36).toUpperCase()}-${suffix || idx + 1}`;

      return {
        sku: autoSku,
        options: combo,
        price: form.price || "0",
        marketPrice: form.marketPrice || "",
        stockQty: form.stock || "0",
        stockStatus: form.stockStatus || "In Stock",
        imageUrl: imageUrls[0] || "",
        active: true,
      };
    });

    setForm((prev) => ({
      ...prev,
      ...(baseSku && !prev.sku.trim() ? { sku: baseSku } : {}),
      variants: newVariants,
    }));
    showSuccessToast(`Generated ${newVariants.length} variant combination(s)`);
  };

  const syncVariantSkusWithProduct = () => {
    const baseSku =
      form.sku.trim() ||
      `${form.brand}-${form.model || form.name}`
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 44);

    if (!baseSku) {
      showErrorToast("Please specify or auto-generate a Product SKU first.");
      return;
    }

    if (!form.sku.trim()) {
      setField("sku", baseSku);
    }

    setForm((prev) => ({
      ...prev,
      sku: prev.sku.trim() || baseSku,
      variants: prev.variants.map((v, idx) => {
        const suffix =
          Object.values(v.options)
            .map((val) => val.toUpperCase().replace(/[^A-Z0-9]/g, ""))
            .filter(Boolean)
            .join("-") || `V${idx + 1}`;
        return {
          ...v,
          sku: `${baseSku.toUpperCase()}-${suffix}`,
        };
      }),
    }));
    showSuccessToast("Variant SKUs synchronized with Product SKU.");
  };

  const addVariantRow = () => {
    const defaultOptions: Record<string, string> = {};
    form.variantOptionGroups.forEach((g) => {
      if (g.name.trim() && g.values.length > 0) {
        defaultOptions[g.name.trim()] = g.values[0];
      }
    });

    const newVariant: ProductFormVariant = {
      sku: form.sku.trim() ? `${form.sku.trim().toUpperCase()}-V${form.variants.length + 1}` : `VAR-${Date.now()}`,
      options: defaultOptions,
      price: form.price || "0",
      marketPrice: form.marketPrice || "",
      stockQty: form.stock || "0",
      stockStatus: form.stockStatus || "In Stock",
      imageUrl: imageUrls[0] || "",
      active: true,
    };

    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
  };

  const removeVariantRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== index),
    }));
  };

  const updateVariantRow = (index: number, field: keyof ProductFormVariant, value: any) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, idx) =>
        idx === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const moveVariantRow = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= form.variants.length) return;
    setForm((prev) => {
      const next = [...prev.variants];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return { ...prev, variants: next };
    });
  };

  const normalizedBrandOptions = useMemo(
    () => [...new Set(brandOptions.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    ),
    [brandOptions]
  );

  const normalizedCategoryOptions = useMemo(
    () => [...new Set(categoryOptions.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    ),
    [categoryOptions]
  );

  const normalizedSubCategoryOptions = useMemo(
    () => [...new Set(subCategoryOptions.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    ),
    [subCategoryOptions]
  );

  const autoGeneratedName = useMemo(
    () =>
      buildAutoProductName(
        form.brand,
        form.model,
        form.category,
        form.specGroups,
        form.connectivity,
        form.keySpecs
      ),
    [form.brand, form.model, form.category, form.specGroups, form.connectivity, form.keySpecs]
  );

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchAdminProducts().catch(() => []),
      fetch("/api/admin/setup/masters")
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
    ]).then(([products, masters]) => {
      if (!active) return;
      const loadedBrands = ((products || []) as any[]).map((product) => product.brand?.trim()).filter(Boolean) as string[];
      const loadedCategories = ((products || []) as any[]).map((product) => product.category?.trim()).filter(Boolean) as string[];
      const masterBrands = (masters?.brands || [])
        .filter((b: any) => b.active !== false)
        .map((b: any) => b.name?.trim())
        .filter(Boolean) as string[];
      const masterCategories = (masters?.categories || [])
        .filter((c: any) => c.active !== false)
        .map((c: any) => c.name?.trim())
        .filter(Boolean) as string[];

      setBrandOptions((current) => [...current, ...loadedBrands, ...masterBrands]);
      setCategoryOptions((current) => [...current, ...loadedCategories, ...masterCategories]);

      if (masters) {
        if (Array.isArray(masters.brands)) {
          setMasterBrandsList(masters.brands);
        }
        if (Array.isArray(masters.categories)) {
          setMasterCategoriesList(masters.categories);
        }
        if (Array.isArray(masters.conditions) && masters.conditions.length > 0) {
          setConditionOptions((current) => Array.from(new Set([...current, ...masters.conditions])));
        }
        if (Array.isArray(masters.grades) && masters.grades.length > 0) {
          setGradeOptions((current) => Array.from(new Set([...current, ...masters.grades])));
        }
        if (Array.isArray(masters.warrantyTypes) && masters.warrantyTypes.length > 0) {
          setWarrantyTypeOptions((current) => Array.from(new Set([...current, ...masters.warrantyTypes])));
        }
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const currentBrand = form.brand.trim();
    const currentCategory = form.category.trim();
    const currentSub = form.subCategory.trim();
    if (currentBrand) {
      setBrandOptions((current) => (current.includes(currentBrand) ? current : [...current, currentBrand]));
    }
    if (currentCategory) {
      setCategoryOptions((current) => (current.includes(currentCategory) ? current : [...current, currentCategory]));
    }
    if (currentSub) {
      setSubCategoryOptions((current) => (current.includes(currentSub) ? current : [...current, currentSub]));
    }
  }, [form.brand, form.category, form.subCategory]);

  useEffect(() => {
    if (!autoNameEnabled) return;
    setForm((current) => {
      if (current.name === autoGeneratedName) return current;
      return { ...current, name: autoGeneratedName };
    });
  }, [autoGeneratedName, autoNameEnabled]);

  const inputCls =
    "w-full px-3.5 py-2.5 bg-background border border-border rounded-lg focus:bg-background focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground";

  const handleBrandChange = (brandName: string) => {
    const match = masterBrandsList.find(
      (b) => b.name.toLowerCase() === brandName.trim().toLowerCase()
    );
    setForm((prev) => ({
      ...prev,
      brand: brandName,
      brandId: match ? match.id : prev.brandId && prev.brand === brandName ? prev.brandId : "",
    }));
    setSubmitError("");
    setErrors((current) => {
      const next = { ...current };
      delete next.brand;
      return next;
    });
  };

  const handleCategoryChange = (categoryName: string) => {
    const match = masterCategoriesList.find(
      (c) => c.name.toLowerCase() === categoryName.trim().toLowerCase()
    );
    setForm((prev) => ({
      ...prev,
      category: categoryName,
      categoryId: match ? match.id : prev.categoryId && prev.category === categoryName ? prev.categoryId : "",
    }));
    setSubmitError("");
    setErrors((current) => {
      const next = { ...current };
      delete next.category;
      return next;
    });
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

  const updateSpecRow = (group: string, index: number, field: "label" | "value", text: string) => {
    setForm((current) => {
      const nextGroup = [...(current.specGroups[group] || [])];
      nextGroup[index] = { ...nextGroup[index], [field]: text };
      return {
        ...current,
        specGroups: { ...current.specGroups, [group]: nextGroup },
      };
    });
  };

  const addSpecRow = (group: string) => {
    setForm((current) => ({
      ...current,
      specGroups: {
        ...current.specGroups,
        [group]: [...(current.specGroups[group] || []), { label: "", value: "" }],
      },
    }));
  };

  const deleteSpecRow = (group: string, index: number) => {
    setForm((current) => ({
      ...current,
      specGroups: {
        ...current.specGroups,
        [group]: (current.specGroups[group] || []).filter((_, i) => i !== index),
      },
    }));
  };

  const setWarrantyField = (field: keyof ProductFormState["warranty"], value: string) => {
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
      if (targetIndex < 0 || targetIndex >= nextFeatures.length) return current;
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
      const suffix = errors.sku ? `-${Date.now().toString(36).toUpperCase().slice(-4)}` : "";
      const newSku = `${base}${suffix}`;
      setField("sku", newSku);

      // Also update any variants that have generic VAR- or empty SKUs
      setForm((prev) => ({
        ...prev,
        sku: newSku,
        variants: prev.variants.map((v, idx) => {
          if (!v.sku || v.sku.startsWith("VAR-")) {
            const vSuffix =
              Object.values(v.options)
                .map((val) => val.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                .filter(Boolean)
                .join("-") || `V${idx + 1}`;
            return {
              ...v,
              sku: `${newSku}-${vSuffix}`,
            };
          }
          return v;
        }),
      }));
    }
  };

  const openCreateModal = (field: "brand" | "category" | "subCategory") => {
    const initialValue =
      field === "brand"
        ? form.brand
        : field === "category"
          ? form.category
          : form.subCategory;
    setCreateOptionModal({
      open: true,
      field,
      value: initialValue,
      error: "",
    });
  };

  const closeCreateModal = () => {
    setCreateOptionModal((current) => ({ ...current, open: false, error: "" }));
  };

  const createOptionFromModal = () => {
    const nextValue = createOptionModal.value.trim();
    const fieldLabel =
      createOptionModal.field === "brand"
        ? "Brand"
        : createOptionModal.field === "category"
          ? "Category"
          : "Sub-Category";

    if (!nextValue) {
      setCreateOptionModal((current) => ({
        ...current,
        error: `${fieldLabel} name cannot be empty`,
      }));
      return;
    }

    if (createOptionModal.field === "brand") {
      handleBrandChange(nextValue);
      setBrandOptions((current) => [...current, nextValue]);
    } else if (createOptionModal.field === "category") {
      handleCategoryChange(nextValue);
      setCategoryOptions((current) => [...current, nextValue]);
    } else {
      setField("subCategory", nextValue);
      setSubCategoryOptions((current) => [...current, nextValue]);
    }

    closeCreateModal();
  };

  useEffect(() => {
    const urls = activeObjectUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const appendSelectedFiles = (files: File[]) => {
    if (files.length === 0) return;
    const validItems: SelectedUploadFile[] = [];
    let rejectedCount = 0;

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        rejectedCount++;
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        rejectedCount++;
        continue;
      }
      const previewUrl = URL.createObjectURL(file);
      activeObjectUrlsRef.current.add(previewUrl);
      validItems.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl,
      });
    }

    if (rejectedCount > 0) {
      setImageError(
        `Only JPG, PNG, WebP, or GIF images under 8MB are allowed. ${rejectedCount} file(s) were skipped.`
      );
    } else {
      setImageError("");
    }

    setSelectedFiles((current) => [...current, ...validItems]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((current) => {
      const itemToRemove = current[index];
      if (itemToRemove?.previewUrl) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
        activeObjectUrlsRef.current.delete(itemToRemove.previewUrl);
      }
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const clearAllSelectedFiles = () => {
    selectedFiles.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl);
      activeObjectUrlsRef.current.delete(item.previewUrl);
    });
    setSelectedFiles([]);
  };

  const uploadSelectedImages = async () => {
    if (selectedFiles.length === 0) return;
    setUploadingImages(true);
    setImageError("");

    try {
      const uploadPromises = selectedFiles.map(async (item) => {
        const data = new FormData();
        data.append("file", item.file);

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: data,
        });

        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
          const stage = json?.stage ? ` [stage: ${json.stage}]` : "";
          const detail = json?.detail
            ? `: ${json.detail}`
            : json?.error
            ? `: ${json.error}`
            : "";
          throw new Error(`Upload failed for "${item.file.name}"${stage}${detail}`);
        }
        return { item, url: String(json.url) };
      });

      const results = await Promise.allSettled(uploadPromises);

      const uploadedUrls: string[] = [];
      const remainingItems: SelectedUploadFile[] = [];
      const errorsList: string[] = [];

      results.forEach((res, index) => {
        const item = selectedFiles[index];
        if (res.status === "fulfilled") {
          uploadedUrls.push(res.value.url);
          if (item?.previewUrl) {
            URL.revokeObjectURL(item.previewUrl);
            activeObjectUrlsRef.current.delete(item.previewUrl);
          }
        } else {
          remainingItems.push(item);
          errorsList.push(
            res.reason instanceof Error ? res.reason.message : `Failed to upload ${item.file.name}`
          );
        }
      });

      if (uploadedUrls.length > 0) {
        setImageUrls((current) => [...new Set([...current, ...uploadedUrls])]);
        setErrors((current) => {
          const next = { ...current };
          delete next.images;
          return next;
        });
      }

      setSelectedFiles(remainingItems);

      if (errorsList.length > 0) {
        setImageError(errorsList.join("; "));
      }
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (url: string) => {
    setImageUrls((current) => current.filter((imageUrl) => imageUrl !== url));
    // Clean up local uploaded file from server storage to prevent orphans
    if (url.startsWith("/uploads/")) {
      fetch(`/api/admin/upload?url=${encodeURIComponent(url)}`, {
        method: "DELETE",
      }).catch(() => {});
    }
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
      if (draggedImageIndex === null || draggedImageIndex === targetIndex) return current;
      if (draggedImageIndex < 0 || draggedImageIndex >= current.length) return current;
      const next = [...current];
      const [picked] = next.splice(draggedImageIndex, 1);
      next.splice(targetIndex, 0, picked);
      return next;
    });
    setDraggedImageIndex(null);
  };

  const validate = (currentImages: string[]) => {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) nextErrors.name = "Product name is required";
    if (!form.brand.trim()) nextErrors.brand = "Brand is required";
    if (!form.sku.trim()) nextErrors.sku = "SKU is required";
    if (!form.category.trim()) nextErrors.category = "Category is required";

    if (!form.callForPrice) {
      const price = Number(form.price);
      if (!form.price || Number.isNaN(price) || price < 0) {
        nextErrors.price = "Current price must be a valid non-negative number";
      }
    }

    const marketPrice = form.marketPrice ? Number(form.marketPrice) : undefined;
    const stock = Number(form.stock);
    const lowStockThreshold = Number(form.lowStockThreshold);

    if (form.marketPrice && (marketPrice === undefined || Number.isNaN(marketPrice) || marketPrice < 0)) {
      nextErrors.marketPrice = "Market / Regular price must be a valid non-negative number";
    }

    if (!form.stock || Number.isNaN(stock) || stock < 0) {
      nextErrors.stock = "Stock quantity must be a valid non-negative number";
    }
    if (!form.lowStockThreshold || Number.isNaN(lowStockThreshold) || lowStockThreshold < 0) {
      nextErrors.lowStockThreshold = "Low stock threshold must be a valid non-negative number";
    }

    if (form.variants.length > 0) {
      const seenSkus = new Set<string>();
      form.variants.forEach((v, index) => {
        const skuTrimmed = v.sku.trim();
        if (!skuTrimmed) {
          nextErrors[`variant_${index}_sku`] = "SKU is required";
        } else if (seenSkus.has(skuTrimmed.toLowerCase())) {
          nextErrors[`variant_${index}_sku`] = `Duplicate SKU "${skuTrimmed}"`;
        } else {
          seenSkus.add(skuTrimmed.toLowerCase());
        }

        if (!form.callForPrice) {
          const vPrice = Number(v.price);
          if (v.price === "" || Number.isNaN(vPrice) || vPrice < 0) {
            nextErrors[`variant_${index}_price`] = "Price must be a valid non-negative number";
          }
        }

        if (v.marketPrice !== "") {
          const vRegPrice = Number(v.marketPrice);
          if (Number.isNaN(vRegPrice) || vRegPrice < 0) {
            nextErrors[`variant_${index}_marketPrice`] = "Regular price must be non-negative";
          }
        }

        const vStock = Number(v.stockQty);
        if (v.stockQty === "" || Number.isNaN(vStock) || vStock < 0) {
          nextErrors[`variant_${index}_stockQty`] = "Stock must be a valid non-negative number";
        }
      });
    }

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSubmitError("");

    let currentImages = [...imageUrls];

    // If there are files queued in selectedFiles that haven't been uploaded yet, auto-upload them now!
    if (selectedFiles.length > 0) {
      setUploadingImages(true);
      try {
        const uploadPromises = selectedFiles.map(async (item) => {
          const data = new FormData();
          data.append("file", item.file);
          const response = await fetch("/api/admin/upload", {
            method: "POST",
            body: data,
          });
          const json = await response.json();
          if (!response.ok) {
            throw new Error(json?.error || `Upload failed for ${item.file.name}`);
          }
          return { item, url: String(json.url) };
        });

        const results = await Promise.allSettled(uploadPromises);
        const uploadedUrls: string[] = [];
        results.forEach((res) => {
          if (res.status === "fulfilled") {
            uploadedUrls.push(res.value.url);
          }
        });

        if (uploadedUrls.length > 0) {
          currentImages = [...new Set([...currentImages, ...uploadedUrls])];
          setImageUrls(currentImages);
          clearAllSelectedFiles();
        }
      } catch (uploadErr) {
        console.error("Auto image upload error:", uploadErr);
      } finally {
        setUploadingImages(false);
      }
    }

    // Fallback if no images provided to avoid broken listings
    if (currentImages.length === 0) {
      currentImages = [
        isAccessoryCategory(form.category)
          ? "/images/placeholder-accessory.png"
          : "/images/placeholder-laptop.png",
      ];
      setImageUrls(currentImages);
    }

    const nextErrors = validate(currentImages);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSaving(false);
      return;
    }

    try {
      const tags = form.tagsInput.split(",").map((entry) => entry.trim()).filter(Boolean);
      const features = (form.features || []).map((entry) => entry.trim()).filter(Boolean);

      const price = form.callForPrice
        ? null
        : form.price
          ? Number(form.price)
          : null;

      const marketPrice = form.marketPrice ? Number(form.marketPrice) : undefined;
      const stock = Number(form.stock);
      const lowStockThreshold = Number(form.lowStockThreshold);
      const computedStockStatus = form.stockStatus || deriveStockStatus(stock, lowStockThreshold);

      // Serialize specs to JSON
      const finalSpecs: Record<string, Record<string, string>> = {};

      if (isAccessoryCategory(form.category)) {
        finalSpecs["Peripherals & Accessories"] = {
          "Connectivity & Interface": form.connectivity.trim(),
          "Key Specifications / Layout": form.keySpecs.trim(),
        };
      } else {
        for (const [groupName, rows] of Object.entries(form.specGroups)) {
          const groupData: Record<string, string> = {};
          for (const row of rows) {
            const label = row.label.trim();
            const value = row.value.trim();
            if (label && value) {
              groupData[label] = value;
            }
          }
          if (Object.keys(groupData).length > 0) {
            finalSpecs[groupName] = groupData;
          }
        }
      }

      // Add General metadata specs (Series, Sub-Category, Product Code)
      const generalData: Record<string, string> = {};
      if (form.series.trim()) generalData["Series"] = form.series.trim();
      if (form.subCategory.trim()) generalData["Sub-Category"] = form.subCategory.trim();
      if (form.productCode.trim()) generalData["Product Code"] = form.productCode.trim();
      if (Object.keys(generalData).length > 0) {
        finalSpecs["General"] = generalData;
      }

      if (form.color.trim()) {
        finalSpecs["Physical Specification"] = {
          ...(finalSpecs["Physical Specification"] || {}),
          Color: form.color.trim(),
        };
      }

      const description =
        form.description.trim() ||
        `${form.name}. Authentic quality hardware with official warranty at Laptop Point BD.`;

      const variantOptions = form.variantOptionGroups
        .filter((og) => og.name.trim() && og.values.length > 0)
        .map((og) => ({
          name: og.name.trim(),
          values: og.values.map((v) => v.trim()).filter(Boolean),
        }));

      const finalVariants = form.variants.map((v, index) => {
        let finalSku = v.sku.trim();
        if ((!finalSku || finalSku.startsWith("VAR-")) && form.sku.trim()) {
          const suffix = Object.values(v.options)
            .map((val) => val.toUpperCase().replace(/[^A-Z0-9]/g, ""))
            .filter(Boolean)
            .join("-") || `V${index + 1}`;
          finalSku = `${form.sku.trim().toUpperCase()}-${suffix}`;
        }
        const variantName =
          Object.values(v.options).filter(Boolean).join(" / ") ||
          finalSku ||
          `Variant ${index + 1}`;
        const vPrice = form.callForPrice ? 0 : v.price !== "" ? Number(v.price) : (price || 0);
        const vMarketPrice = v.marketPrice !== "" ? Number(v.marketPrice) : undefined;
        return {
          id: v.id,
          name: variantName,
          sku: finalSku,
          options: v.options,
          price: vPrice,
          originalPrice: vMarketPrice,
          marketPrice: vMarketPrice ?? null,
          regularPrice: vMarketPrice ?? null,
          stockQty: v.stockQty !== "" ? Number(v.stockQty) : 0,
          stock: v.stockQty !== "" ? Number(v.stockQty) : 0,
          stockStatus: v.stockStatus || deriveStockStatus(Number(v.stockQty) || 0, lowStockThreshold),
          imageUrl: v.imageUrl?.trim() || null,
          sortOrder: index,
          active: v.active,
        };
      });

      const totalStock = finalVariants.length > 0
        ? finalVariants.reduce((sum, v) => sum + (v.stockQty || 0), 0)
        : stock;

      const minVariantPrice = finalVariants.length > 0 && !form.callForPrice
        ? Math.min(...finalVariants.map((v) => v.price ?? price ?? 0))
        : price;

      const finalBrandId =
        form.brandId ||
        masterBrandsList.find((b) => b.name.toLowerCase() === form.brand.trim().toLowerCase())?.id ||
        undefined;
      const finalCategoryId =
        form.categoryId ||
        masterCategoriesList.find((c) => c.name.toLowerCase() === form.category.trim().toLowerCase())?.id ||
        undefined;

      await onSubmitProductAction({
        name: form.name.trim(),
        brand: form.brand.trim(),
        brandId: finalBrandId,
        model: form.model.trim() || undefined,
        category: form.category.trim(),
        categoryId: finalCategoryId,
        condition: form.condition.trim() || undefined,
        grade: form.grade.trim() || undefined,
        sku: form.sku.trim(),
        description,
        fullDescription: form.fullDescription.trim() || undefined,
        price: form.callForPrice ? 0 : ((finalVariants.length > 0 ? minVariantPrice : price) || 0),
        marketPrice: marketPrice ?? undefined,
        regularPrice: marketPrice ?? undefined,
        salePrice: marketPrice ?? undefined,
        currency: form.currency.trim() || "BDT",
        taxIncluded: form.taxIncluded,
        stock: totalStock,
        stockStatus: computedStockStatus,
        lowStockThreshold,
        status: form.status,
        featured: form.featured,
        tags,
        features,
        youtubeUrl: form.youtubeUrl.trim() || undefined,
        specs: Object.keys(finalSpecs).length > 0 ? finalSpecs : undefined,
        warranty: {
          period: form.warranty.period.trim() || undefined,
          type: form.warranty.type.trim() || undefined,
          details: form.warranty.details.trim() || undefined,
        },
        variantOptions: variantOptions.length > 0 ? variantOptions : undefined,
        variants: finalVariants,
        images: currentImages,
      });

      showSuccessToast("Product saved successfully");
      router.push("/admin/products");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save product";
      setSubmitError(message);
      showErrorToast(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-sm border-border">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">{title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <section className="space-y-6">
          <div className="border-b border-border/80 pb-3">
            <h2 className="text-lg font-bold tracking-tight text-foreground">Basic Information</h2>
          </div>

          <div className="space-y-5">
            {/* Row 1: Product Name, SKU, Product Code */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-foreground">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <span className="inline-flex items-center rounded-sm bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Auto-syncing
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoNameEnabled(true);
                      setField("name", autoGeneratedName);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-500 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    🪄 Regenerate Title
                  </button>
                </div>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => {
                    if (autoNameEnabled) setAutoNameEnabled(false);
                    setField("name", event.target.value);
                  }}
                  placeholder="e.g. Lenovo ThinkPad X1 Carbon Gen 10"
                  className={inputCls}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateSku}
                    className="text-xs text-blue-600 hover:text-blue-500 font-medium cursor-pointer"
                  >
                    Auto-generate
                  </button>
                </div>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(event) => setField("sku", event.target.value)}
                  placeholder="Auto-generated (e.g. TD-LAP-0001)"
                  className={inputCls}
                />
                {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Product Code
                </label>
                <input
                  type="text"
                  value={form.productCode}
                  onChange={(event) => setField("productCode", event.target.value)}
                  placeholder="e.g. WM-1234"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Row 2: Category, Sub-Category, Brand */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={form.category}
                    onChange={(event) => handleCategoryChange(event.target.value)}
                    className={`${inputCls} flex-1`}
                  >
                    <option value="">-Select-</option>
                    {normalizedCategoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => openCreateModal("category")}
                    className="h-10 w-10 shrink-0 rounded-lg border-border"
                    title="Add category"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Sub-Category
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={form.subCategory}
                    onChange={(event) => setField("subCategory", event.target.value)}
                    className={`${inputCls} flex-1`}
                  >
                    <option value="">-Select-</option>
                    {normalizedSubCategoryOptions.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => openCreateModal("subCategory")}
                    className="h-10 w-10 shrink-0 rounded-lg border-border"
                    title="Add sub-category"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Brand <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={form.brand}
                    onChange={(event) => handleBrandChange(event.target.value)}
                    className={`${inputCls} flex-1`}
                  >
                    <option value="">-Select-</option>
                    {normalizedBrandOptions.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => openCreateModal("brand")}
                    className="h-10 w-10 shrink-0 rounded-lg border-border"
                    title="Add brand"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
              </div>
            </div>

            {/* Row 3: Series, Model, Condition, Grade, Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Series</label>
                <input
                  type="text"
                  value={form.series}
                  onChange={(event) => setField("series", event.target.value)}
                  placeholder="Enter Series"
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Model</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={(event) => setField("model", event.target.value)}
                  placeholder="Enter Model"
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Condition</label>
                <select
                  value={form.condition}
                  onChange={(event) => setField("condition", event.target.value)}
                  className={inputCls}
                >
                  <option value="">-Select-</option>
                  {conditionOptions.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Grade</label>
                <select
                  value={form.grade}
                  onChange={(event) => setField("grade", event.target.value)}
                  className={inputCls}
                >
                  <option value="">-Select-</option>
                  {gradeOptions.map((gr) => (
                    <option key={gr} value={gr}>
                      Grade {gr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Color</label>
                <input
                  type="text"
                  value={form.color}
                  onChange={(event) => setField("color", event.target.value)}
                  placeholder="e.g. Silver, Black, Space Gray"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Row 4: Peripherals & Accessories Card (Shown when Category is Accessories) */}
            {isAccessoryCategory(form.category) && (
              <div className="rounded-xl border border-border/80 bg-card/60 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <h3 className="text-sm font-bold text-foreground">
                    Peripherals & Accessories
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Mouse / Keyboard / Headsets / Adapters
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-foreground">
                      Connectivity & Interface
                    </label>
                    <input
                      type="text"
                      value={form.connectivity}
                      onChange={(event) => setField("connectivity", event.target.value)}
                      placeholder="e.g. Wireless 2.4GHz + Bluetooth, USB Type-C"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-foreground">
                      Key Specifications / Layout
                    </label>
                    <input
                      type="text"
                      value={form.keySpecs}
                      onChange={(event) => setField("keySpecs", event.target.value)}
                      placeholder="e.g. Hot-swappable Red Switch, 26000 DPI Sensor, 65W PD"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info: Grade, Visibility Status, Featured */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Grade</label>
                <input
                  type="text"
                  list="master-grade-options"
                  value={form.grade}
                  onChange={(event) => setField("grade", event.target.value)}
                  placeholder="e.g. A+, Like New, Premium"
                  className={inputCls}
                />
                <datalist id="master-grade-options">
                  {gradeOptions.map((g) => (
                    <option key={g} value={g} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">
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

              <div className="flex items-center pt-6">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) => setField("featured", event.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  Mark as Featured Product
                </label>
              </div>
            </div>
          </div>

            {/* Descriptions */}
            <div className="md:col-span-2 mt-4">
              <div className="border-b border-gray-200 pb-3 mb-4">
                <h3 className="text-lg font-medium text-gray-900">Descriptions</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(event) => setField("description", event.target.value)}
                    rows={3}
                    placeholder="Short summary for product listings"
                    className={inputCls}
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                  <textarea
                    value={form.fullDescription}
                    onChange={(event) => setField("fullDescription", event.target.value)}
                    rows={6}
                    placeholder="Comprehensive description for the product detail page"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Pricing Section with Call For Price */}
            <div className="md:col-span-2 mt-6">
              <div className="border-b border-gray-200 pb-3 mb-4">
                <h3 className="text-lg font-medium text-gray-900">Pricing & Inventory</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Call For Price toggle checkbox ABOVE the price input */}
                <div className="md:col-span-2">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-blue-900 bg-blue-50/70 hover:bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={form.callForPrice}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setForm((current) => ({
                          ...current,
                          callForPrice: checked,
                          price: checked ? "" : current.price,
                        }));
                        if (checked) {
                          setErrors((current) => {
                            const next = { ...current };
                            delete next.price;
                            return next;
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span>Call For Price (no price listed)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Price ({form.currency || "BDT"}){" "}
                    {!form.callForPrice && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={form.callForPrice}
                    value={form.callForPrice ? "" : form.price}
                    onChange={(event) => setField("price", event.target.value)}
                    placeholder={form.callForPrice ? "Price on request" : "e.g. 41500"}
                    className={`${inputCls} ${
                      form.callForPrice ? "bg-gray-100/90 text-gray-400 cursor-not-allowed border-dashed" : ""
                    }`}
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Market / Regular Price ({form.currency || "BDT"})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.marketPrice}
                    onChange={(event) => setField("marketPrice", event.target.value)}
                    placeholder="e.g. 48000"
                    className={inputCls}
                  />
                  {errors.marketPrice && <p className="text-red-500 text-xs mt-1">{errors.marketPrice}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <input
                    type="text"
                    value={form.currency}
                    onChange={(event) => setField("currency", event.target.value)}
                    placeholder="BDT"
                    className={inputCls}
                  />
                </div>

                <div className="flex items-center pt-7">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.taxIncluded}
                      onChange={(event) => setField("taxIncluded", event.target.checked)}
                      className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
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
                    onChange={(event) => setField("stock", event.target.value)}
                    placeholder="0"
                    className={inputCls}
                  />
                  {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                  <select
                    value={form.stockStatus}
                    onChange={(event) => setField("stockStatus", event.target.value)}
                    className={inputCls}
                  >
                    {STOCK_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Low Stock Threshold <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.lowStockThreshold}
                    onChange={(event) => setField("lowStockThreshold", event.target.value)}
                    placeholder="10"
                    className={inputCls}
                  />
                  {errors.lowStockThreshold && (
                    <p className="text-red-500 text-xs mt-1">{errors.lowStockThreshold}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Variants Section */}
            <div className="md:col-span-2 mt-8">
              <SectionCard
                title={
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    <span>Product Variants & Options</span>
                    {form.variants.length > 0 && (
                      <StatusBadge status="active">
                        {form.variants.length} variant{form.variants.length > 1 ? "s" : ""}
                      </StatusBadge>
                    )}
                  </div>
                }
                description="Configure product variations (e.g. RAM, Storage, Color) with individual SKUs, pricing, and stock."
              >
                <div className="space-y-6">
                  {/* Step 1: Attribute builder */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Option Attributes (e.g. RAM, Storage, Color)
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOptionGroup}
                        className="text-xs h-7 gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Attribute
                      </Button>
                    </div>

                    {form.variantOptionGroups.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                        No option attributes defined yet. Click &quot;Add Attribute&quot; to configure options like RAM or Storage.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {form.variantOptionGroups.map((group) => (
                          <div
                            key={group.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg border border-border/80 bg-muted/20"
                          >
                            <div className="w-full sm:w-1/3">
                              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                                Attribute Name
                              </label>
                              <input
                                type="text"
                                value={group.name}
                                onChange={(e) =>
                                  updateOptionGroup(group.id, e.target.value, group.rawInput)
                                }
                                placeholder="e.g. RAM, Storage, Color"
                                className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md focus:ring-1 focus:ring-primary outline-none"
                              />
                            </div>
                            <div className="w-full sm:w-2/3">
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-medium text-muted-foreground">
                                  Values (comma separated)
                                </label>
                                <span className="text-[10px] text-muted-foreground">
                                  {group.values.length} value{group.values.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <input
                                type="text"
                                value={group.rawInput}
                                onChange={(e) =>
                                  updateOptionGroup(group.id, group.name, e.target.value)
                                }
                                placeholder="e.g. 8 GB, 16 GB, 32 GB"
                                className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-md focus:ring-1 focus:ring-primary outline-none"
                              />
                              {group.values.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {group.values.map((val, vIdx) => (
                                    <span
                                      key={vIdx}
                                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-medium"
                                    >
                                      {val}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeOptionGroup(group.id)}
                              className="self-center sm:self-auto p-1.5 text-muted-foreground hover:text-red-500 rounded-md transition-colors mt-4 sm:mt-0"
                              title="Delete attribute"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            type="button"
                            size="sm"
                            onClick={generateCombinations}
                            className="text-xs h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Generate Combinations
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addVariantRow}
                            className="text-xs h-8 gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Custom Row
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Variant Matrix Table */}
                  <div className="space-y-3 pt-4 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Variant Matrix ({form.variants.length})
                      </h4>
                      {form.variants.length > 0 && (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={syncVariantSkusWithProduct}
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Sync variant SKUs
                          </button>
                          <span className="text-border">|</span>
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, variants: [] }))}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Clear all variants
                          </button>
                        </div>
                      )}
                    </div>

                    {form.variants.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                        No variants generated. Add attributes above and click &quot;Generate Combinations&quot;, or click &quot;Add Custom Row&quot;.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase">
                            <tr>
                              <th className="py-2.5 px-2 w-10 text-center">#</th>
                              <th className="py-2.5 px-3 min-w-[140px]">Options</th>
                              <th className="py-2.5 px-3 min-w-[140px]">
                                SKU <span className="text-red-500">*</span>
                              </th>
                              <th className="py-2.5 px-3 min-w-[110px]">
                                Price (৳) <span className="text-red-500">*</span>
                              </th>
                              <th className="py-2.5 px-3 min-w-[110px]">Regular Price (৳)</th>
                              <th className="py-2.5 px-3 min-w-[90px]">
                                Stock <span className="text-red-500">*</span>
                              </th>
                              <th className="py-2.5 px-3 min-w-[110px]">Stock Status</th>
                              <th className="py-2.5 px-3 min-w-[130px]">Image URL</th>
                              <th className="py-2.5 px-2 w-14 text-center">Active</th>
                              <th className="py-2.5 px-2 w-10 text-center"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60 bg-background">
                            {form.variants.map((v, idx) => (
                              <tr
                                key={v.id || idx}
                                className={cn(
                                  "hover:bg-muted/20 transition-colors",
                                  !v.active && "opacity-60 bg-muted/10"
                                )}
                              >
                                <td className="py-2 px-1 text-center">
                                  <div className="flex flex-col items-center">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => moveVariantRow(idx, idx - 1)}
                                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                      {idx + 1}
                                    </span>
                                    <button
                                      type="button"
                                      disabled={idx === form.variants.length - 1}
                                      onClick={() => moveVariantRow(idx, idx + 1)}
                                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                                <td className="py-2 px-3">
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(v.options).map(([k, val]) => (
                                      <span
                                        key={k}
                                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-secondary text-secondary-foreground font-medium"
                                      >
                                        <span className="text-muted-foreground mr-1">{k}:</span>
                                        {val}
                                      </span>
                                    ))}
                                    {Object.keys(v.options).length === 0 && (
                                      <span className="text-muted-foreground italic text-[11px]">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={v.sku}
                                    onChange={(e) => updateVariantRow(idx, "sku", e.target.value)}
                                    placeholder="SKU"
                                    className={cn(
                                      "w-full px-2 py-1 text-xs bg-background border rounded font-mono outline-none focus:ring-1 focus:ring-primary",
                                      errors[`variant_${idx}_sku`] ? "border-red-500" : "border-border"
                                    )}
                                  />
                                  {errors[`variant_${idx}_sku`] && (
                                    <p className="text-[10px] text-red-500 mt-0.5">
                                      {errors[`variant_${idx}_sku`]}
                                    </p>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    min="0"
                                    disabled={form.callForPrice}
                                    value={form.callForPrice ? "" : v.price}
                                    onChange={(e) => updateVariantRow(idx, "price", e.target.value)}
                                    placeholder={form.callForPrice ? "On request" : "0"}
                                    className={cn(
                                      "w-full px-2 py-1 text-xs bg-background border rounded outline-none focus:ring-1 focus:ring-primary",
                                      errors[`variant_${idx}_price`] ? "border-red-500" : "border-border"
                                    )}
                                  />
                                  {errors[`variant_${idx}_price`] && (
                                    <p className="text-[10px] text-red-500 mt-0.5">
                                      {errors[`variant_${idx}_price`]}
                                    </p>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    min="0"
                                    value={v.marketPrice}
                                    onChange={(e) => updateVariantRow(idx, "marketPrice", e.target.value)}
                                    placeholder="Regular"
                                    className="w-full px-2 py-1 text-xs bg-background border border-border rounded outline-none focus:ring-1 focus:ring-primary"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    min="0"
                                    value={v.stockQty}
                                    onChange={(e) => updateVariantRow(idx, "stockQty", e.target.value)}
                                    placeholder="0"
                                    className={cn(
                                      "w-full px-2 py-1 text-xs bg-background border rounded outline-none focus:ring-1 focus:ring-primary",
                                      errors[`variant_${idx}_stockQty`] ? "border-red-500" : "border-border"
                                    )}
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <select
                                    value={v.stockStatus}
                                    onChange={(e) => updateVariantRow(idx, "stockStatus", e.target.value)}
                                    className="w-full px-2 py-1 text-xs bg-background border border-border rounded outline-none focus:ring-1 focus:ring-primary"
                                  >
                                    {STOCK_STATUSES.map((st) => (
                                      <option key={st} value={st}>
                                        {st}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={v.imageUrl || ""}
                                    onChange={(e) => updateVariantRow(idx, "imageUrl", e.target.value)}
                                    placeholder="/uploads/..."
                                    className="w-full px-2 py-1 text-xs bg-background border border-border rounded outline-none focus:ring-1 focus:ring-primary text-[11px]"
                                  />
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={v.active}
                                    onChange={(e) => updateVariantRow(idx, "active", e.target.checked)}
                                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                                  />
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => removeVariantRow(idx)}
                                    className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                                    title="Delete variant"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Structured Grouped Specifications (Step 4 - Laptops Only) */}
            {!isAccessoryCategory(form.category) && (
              <div className="md:col-span-2 mt-8">
                <div className="border-b border-border/80 pb-3 mb-6">
                  <h3 className="text-xl font-medium text-foreground">Specifications (Grouped)</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fill in the technical details by category. Unfilled fields will automatically be omitted on the storefront.
                  </p>
                </div>

                <div className="space-y-4">
                  {Object.keys(DEFAULT_SPEC_GROUPS).map((groupName) => {
                    const rows = form.specGroups[groupName] || [];
                    const isOpen = Boolean(openGroups[groupName]);
                    const filledCount = rows.filter((r) => r.value.trim().length > 0).length;

                    return (
                      <div
                        key={groupName}
                        className="border border-blue-200/80 rounded-xl overflow-hidden bg-card shadow-2xs transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => toggleGroup(groupName)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-blue-50/70 hover:bg-blue-50 text-left transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-blue-900 text-sm">{groupName}</span>
                            {filledCount > 0 && (
                              <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                                {filledCount} filled
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-blue-700">
                            <span className="text-xs">{isOpen ? "Hide" : "Edit"}</span>
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="p-4 space-y-3 bg-background">
                            <div className="space-y-2">
                              {rows.map((row, rIdx) => (
                                <div key={rIdx} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={row.label}
                                    onChange={(e) => updateSpecRow(groupName, rIdx, "label", e.target.value)}
                                    placeholder="Spec name"
                                    className="w-2/5 px-3 py-2 text-xs bg-muted/50 border border-border rounded-md focus:bg-background focus:ring-1 focus:ring-blue-500 outline-none font-medium text-foreground"
                                  />
                                  <input
                                    type="text"
                                    value={row.value}
                                    onChange={(e) => updateSpecRow(groupName, rIdx, "value", e.target.value)}
                                    placeholder="Value"
                                    className="w-3/5 px-3 py-2 text-xs bg-muted/50 border border-border rounded-md focus:bg-background focus:ring-1 focus:ring-blue-500 outline-none text-foreground"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => deleteSpecRow(groupName, rIdx)}
                                    className="p-1.5 text-muted-foreground hover:text-red-500 rounded-md transition-colors"
                                    title="Delete spec"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => addSpecRow(groupName)}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-blue-50 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add Row to {groupName}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Key Features & Warranty */}
            <div className="md:col-span-2 mt-8">
              <div className="border-b border-gray-200 pb-3 mb-6">
                <h3 className="text-xl font-medium text-gray-900">Features & Warranty</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Key Feature Bullets</label>
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
                      <div className="text-center py-4">
                        <p className="text-xs text-gray-500 mb-2">No key features added yet.</p>
                        <Button type="button" variant="outline" size="sm" onClick={addFeature} className="text-xs gap-1.5">
                          <Plus className="w-3.5 h-3.5" />
                          Add First Feature
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {form.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
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
                                className="w-8 h-8 shrink-0"
                                onClick={() => moveFeature(index, "up")}
                                disabled={index === 0}
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="w-8 h-8 shrink-0"
                                onClick={() => moveFeature(index, "down")}
                                disabled={index === form.features.length - 1}
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="w-8 h-8 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeFeature(index)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags / Keywords</label>
                  <input
                    type="text"
                    value={form.tagsInput}
                    onChange={(event) => setField("tagsInput", event.target.value)}
                    placeholder="Comma separated tags for search and SEO"
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Period</label>
                    <input
                      type="text"
                      value={form.warranty.period}
                      onChange={(event) => setWarrantyField("period", event.target.value)}
                      placeholder="e.g. 2 Years"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Type</label>
                    <select
                      value={form.warranty.type}
                      onChange={(event) => setWarrantyField("type", event.target.value)}
                      className={inputCls}
                    >
                      <option value="">-Select Warranty Type-</option>
                      {warrantyTypeOptions.map((wt) => (
                        <option key={wt} value={wt}>
                          {wt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Details</label>
                    <textarea
                      value={form.warranty.details}
                      onChange={(event) => setWarrantyField("details", event.target.value)}
                      rows={2}
                      placeholder="e.g. 2 years (battery and adapter 1 year)"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Media & Video Section (Step 5) */}
            <div className="md:col-span-2 mt-8">
              <div className="border-b border-gray-200 pb-3 mb-6">
                <h3 className="text-xl font-medium text-gray-900">Media & Video</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Video (YouTube URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={form.youtubeUrl}
                    onChange={(e) => setField("youtubeUrl", e.target.value)}
                    className={inputCls}
                  />
                  {form.youtubeUrl && (
                    <p className="text-xs text-muted-foreground mt-1">Video will appear on the product page</p>
                  )}
                </div>

                {/* Images Upload Section */}
                <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/30 p-6">
                  <div className="border-b border-gray-200 pb-2">
                    <h4 className="text-sm font-semibold text-gray-800">Product Images</h4>
                  </div>
                  <div
                    className={`rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                      isDraggingFiles ? "border-black bg-white shadow-sm" : "border-gray-300 bg-white"
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
                      appendSelectedFiles(Array.from(event.dataTransfer.files || []));
                    }}
                  >
                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Drag and drop product images here</p>
                    <p className="mt-1 text-xs text-gray-500">or use the buttons below to choose files and upload</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT_IMAGE_TYPES}
                    multiple
                    onChange={(event) => {
                      appendSelectedFiles(Array.from(event.target.files || []));
                      event.currentTarget.value = "";
                    }}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" onClick={openFilePicker}>
                      Choose Files
                    </Button>
                    <Button
                      type="button"
                      onClick={uploadSelectedImages}
                      disabled={uploadingImages || selectedFiles.length === 0}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      {uploadingImages ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Uploading {selectedFiles.length} file(s)...
                        </span>
                      ) : (
                        `Upload${selectedFiles.length > 0 ? ` (${selectedFiles.length})` : ""}`
                      )}
                    </Button>
                    <p className="text-xs text-gray-500">JPG, PNG, WebP up to 8MB each</p>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-700">
                          {selectedFiles.length} file(s) ready to upload
                        </p>
                        <button
                          type="button"
                          onClick={clearAllSelectedFiles}
                          className="text-xs text-gray-500 hover:text-red-600 underline"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {selectedFiles.map((item, index) => (
                          <div
                            key={item.id}
                            className="relative group rounded-lg border border-gray-200 bg-gray-50 p-2 overflow-hidden shadow-xs"
                          >
                            <img
                              src={item.previewUrl}
                              alt={item.file.name}
                              className="w-full h-20 object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.png";
                              }}
                            />
                            <div className="mt-1 flex items-center justify-between gap-1">
                              <span
                                className="truncate text-[11px] text-gray-700 font-medium max-w-[100px]"
                                title={item.file.name}
                              >
                                {item.file.name}
                              </span>
                              <span className="text-[10px] text-gray-500 shrink-0">
                                {(item.file.size / 1024).toFixed(0)} KB
                              </span>
                            </div>
                            <button
                              type="button"
                              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-colors cursor-pointer"
                              onClick={() => removeSelectedFile(index)}
                              title="Remove file"
                            >
                              <X className="w-3 h-3" />
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
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.png";
                            }}
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
              {submitError && <p className="text-sm font-medium text-red-600">{submitError}</p>}
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/products">
                <Button type="button" variant="outline" className="bg-white hover:bg-gray-50 text-gray-700">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white px-8 shadow-sm cursor-pointer"
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
        entityLabel={
          createOptionModal.field === "brand"
            ? "Brand"
            : createOptionModal.field === "category"
              ? "Category"
              : "Sub-Category"
        }
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
            ? "e.g. Logitech"
            : createOptionModal.field === "category"
              ? "e.g. Accessories"
              : "e.g. Wireless Mouse"
        }
        onClose={closeCreateModal}
        onConfirm={createOptionFromModal}
      />
    </div>
  );
}
