import type { AdminProduct } from "@/lib/admin-data";
import {
  ACCESSORY_CONDITIONS,
  categoryName,
  resolveAccessoryCategorySlug,
  type AccessoryRecord,
} from "@/lib/accessory-types";
import type { AccessoryInput } from "@/lib/accessories-storage";

/**
 * The admin product form is one form for laptops and accessories. Accessories
 * are stored in their own catalogue (lib/accessories-storage.ts) so they appear
 * on /accessories; these helpers translate between the two shapes.
 */

type Groups = Record<string, Record<string, string> | undefined>;

const PERIPHERALS = "Peripherals & Accessories";
const asGroups = (specs: AdminProduct["specs"]): Groups => (specs ?? {}) as Groups;

const splitList = (v: string | undefined) =>
  (v ?? "")
    .split(new RegExp("[\\n;,]"))
    .map((s) => s.trim())
    .filter(Boolean);

export function adminToAccessoryInput(admin: Omit<AdminProduct, "id">): AccessoryInput {
  const groups = asGroups(admin.specs);
  const subCategory = groups["General"]?.["Sub-Category"];
  const category = resolveAccessoryCategorySlug(admin.category, subCategory) ?? "other";

  const connectivity = groups[PERIPHERALS]?.["Connectivity & Interface"]?.trim() ?? "";
  const keySpecs = groups[PERIPHERALS]?.["Key Specifications / Layout"]?.trim() ?? "";
  const compatibility = splitList(groups[PERIPHERALS]?.["Compatible With"]);

  const marketPrice = Number(admin.salePrice ?? admin.marketPrice ?? admin.regularPrice ?? 0);
  const warrantyText =
    [admin.warranty?.period, admin.warranty?.type].filter(Boolean).join(" ").trim() ||
    admin.warranty?.details?.trim() ||
    "";

  const statusKey = String(admin.status ?? admin.statusValue ?? "active").toLowerCase();
  const condition = ACCESSORY_CONDITIONS.find(
    (c) => c.toLowerCase() === String(admin.condition ?? "").trim().toLowerCase(),
  );

  return {
    name: admin.name,
    sku: admin.sku,
    brand: admin.brand,
    category,
    condition: condition ?? "New",
    warranty: warrantyText,
    color: groups["Physical Specification"]?.["Color"] ?? "",
    price: Number(admin.price),
    originalPrice: marketPrice > Number(admin.price) ? marketPrice : undefined,
    stock: Number(admin.stock ?? 0),
    description: (admin.fullDescription || admin.description || "").trim(),
    images: (admin.images ?? []).filter((u) => !u.includes("placeholder-")),
    youtubeUrl: admin.youtubeUrl?.trim() || "",
    connectivity,
    keySpecs,
    compatibility,
    active: statusKey === "active",
  } as AccessoryInput;
}

export function accessoryToAdminProduct(a: AccessoryRecord): AdminProduct {
  const stock = a.stock;
  const marketPrice = a.originalPrice && a.originalPrice > a.price ? a.originalPrice : a.price;

  return {
    id: a.id,
    name: a.name,
    brand: a.brand,
    model: "",
    // Name of the accessory type so the form's category logic recognises it.
    category: categoryName(a.category),
    condition: a.condition,
    grade: "",
    price: a.price,
    salePrice: marketPrice,
    marketPrice,
    regularPrice: marketPrice,
    pricing: {
      currency: "BDT",
      sale_price: a.price,
      market_price: marketPrice,
      discount_percentage:
        marketPrice > a.price ? Math.round(((marketPrice - a.price) / marketPrice) * 100) : 0,
      tax_included: true,
    },
    currency: "BDT",
    taxIncluded: true,
    stock,
    stockStatus: stock > 0 ? "In Stock" : "Out of Stock",
    lowStockThreshold: 5,
    status: stock === 0 ? "Out of Stock" : stock < 5 ? "Low Stock" : "Active",
    statusValue: a.active ? "active" : "draft",
    featured: false,
    sku: a.sku,
    description: a.description,
    fullDescription: a.description,
    tags: [],
    features: [],
    youtubeUrl: a.youtubeUrl,
    specs: {
      General: { "Sub-Category": categoryName(a.category) },
      [PERIPHERALS]: {
        "Connectivity & Interface": a.connectivity ?? "",
        "Key Specifications / Layout": a.keySpecs ?? a.specs.join(", "),
        "Compatible With": a.compatibility.join("\n"),
      },
      ...(a.color ? { "Physical Specification": { Color: a.color } } : {}),
    } as AdminProduct["specs"],
    warranty: a.warranty ? { details: a.warranty } : undefined,
    images: a.images,
  };
}

export const isAccessoryId = (id: string) => id.startsWith("acc-");

/** For items that were saved in the laptop catalogue but are really accessories. */
export function rawToAccessoryInput(raw: import("@/types/raw-product").RawProduct): AccessoryInput {
  const sub = raw.subCategory ?? raw.specGroups?.General?.["Sub-Category"];
  const condition = ACCESSORY_CONDITIONS.find(
    (c) => c.toLowerCase() === String(raw.condition ?? "").trim().toLowerCase(),
  );
  const market = raw.pricing?.market_price ?? 0;
  const price = raw.pricing?.sale_price ?? 0;
  const warranty = raw.warranty
    ? [raw.warranty.period, raw.warranty.type].filter(Boolean).join(" ").trim() ||
      raw.warranty.details ||
      ""
    : "";
  const peripherals = raw.specGroups?.[PERIPHERALS];

  return {
    name: raw.name,
    sku: raw.sku,
    brand: raw.brand || "Generic",
    category: resolveAccessoryCategorySlug(raw.category, sub) ?? "other",
    condition: condition ?? "New",
    warranty,
    color: raw.specGroups?.["Physical Specification"]?.["Color"] ?? "",
    price,
    originalPrice: market > price ? market : undefined,
    stock: raw.stock?.quantity ?? 0,
    description: (raw.description?.full || raw.description?.short || "").trim(),
    images: (raw.images ?? []).filter((u) => !u.includes("placeholder-") && u !== "/Hero_Image.png"),
    youtubeUrl: raw.youtubeUrl,
    connectivity: peripherals?.["Connectivity & Interface"],
    keySpecs: peripherals?.["Key Specifications / Layout"],
    compatibility: splitList(peripherals?.["Compatible With"]),
    specs: (raw.features ?? []).slice(0, 12),
    active: !raw.statusValue || raw.statusValue === "active",
  } as AccessoryInput;
}
