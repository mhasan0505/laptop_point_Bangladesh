import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import {
  ACCESSORY_CATEGORIES,
  ACCESSORY_CONDITIONS,
  type AccessoryCondition,
  type AccessoryRecord,
  type PublicAccessory,
} from "@/lib/accessory-types";

/**
 * Accessories live beside the laptop catalogue but are modelled separately:
 *  - base data:   app/data/accessories.json (read-only seed in serverless)
 *  - overrides:   ProductOverride rows keyed `system:accessory:<sku>` (these
 *                 prefixes are already skipped by the laptop catalogue loader)
 *  - live stock:  Inventory rows with productId === accessory id
 * Same layering as products, so edits survive read-only filesystems.
 */

const FILE_PATH = path.join(process.cwd(), "app", "data", "accessories.json");
const KEY_PREFIX = "system:accessory:";

async function readBase(): Promise<AccessoryRecord[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE_PATH, "utf-8"));
    return Array.isArray(parsed) ? (parsed as AccessoryRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeBase(list: AccessoryRecord[]): Promise<boolean> {
  try {
    const tmp = `${FILE_PATH}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(list, null, 2), "utf-8");
    await fs.rename(tmp, FILE_PATH);
    return true;
  } catch {
    return false; // read-only filesystem: DB is the source of truth
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function accessoryIdFromSku(sku: string): string {
  return `acc-${slugify(sku)}`;
}

/** All accessories (including inactive) with live stock applied. */
export async function listAccessories(): Promise<AccessoryRecord[]> {
  const map = new Map<string, AccessoryRecord>();
  for (const a of await readBase()) map.set(a.sku.toLowerCase(), a);

  try {
    const overrides = await prisma.productOverride.findMany({
      where: { sku: { startsWith: KEY_PREFIX } },
    });
    for (const o of overrides) {
      const sku = o.sku.slice(KEY_PREFIX.length).toLowerCase();
      if (o.isDeleted) map.delete(sku);
      else if (o.data) map.set(sku, o.data as unknown as AccessoryRecord);
    }
  } catch (err) {
    console.warn("[accessories] override fetch failed:", err);
  }

  const list = [...map.values()];

  try {
    const ids = list.map((a) => a.id);
    if (ids.length > 0) {
      const inv = await prisma.inventory.findMany({ where: { productId: { in: ids } } });
      const byId = new Map(inv.map((i) => [i.productId, i.quantity]));
      for (const a of list) {
        const q = byId.get(a.id);
        if (typeof q === "number") a.stock = q;
      }
    }
  } catch {
    // keep stored stock
  }

  return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getAccessoryByIdOrSlug(key: string): Promise<AccessoryRecord | null> {
  const k = key.toLowerCase();
  const all = await listAccessories();
  return (
    all.find((a) => a.id.toLowerCase() === k || a.slug === k || a.sku.toLowerCase() === k) ?? null
  );
}

export function toPublic(a: AccessoryRecord): PublicAccessory {
  const { active: _active, ...rest } = a;
  void _active;
  return { ...rest, inStock: a.stock > 0 };
}

export async function listPublicAccessories(): Promise<PublicAccessory[]> {
  return (await listAccessories()).filter((a) => a.active).map(toPublic);
}

// ─── Validation ─────────────────────────────────────────────────────────────

export type AccessoryInput = Partial<Omit<AccessoryRecord, "id" | "createdAt" | "updatedAt">>;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function strList(v: unknown, maxItems: number, maxLen: number): string[] {
  const arr = Array.isArray(v)
    ? v
    : typeof v === "string"
      ? v.split(/[\n,]/)
      : [];
  return arr
    .map((x) => (typeof x === "string" ? x.trim().slice(0, maxLen) : ""))
    .filter(Boolean)
    .slice(0, maxItems);
}

function isSafeImage(u: string): boolean {
  return /^https:\/\//i.test(u) || (u.startsWith("/") && !u.startsWith("//"));
}

export function parseAccessoryInput(
  body: unknown,
  mode: "create" | "update",
): { data: AccessoryInput } | { error: string } {
  if (typeof body !== "object" || body === null) return { error: "Invalid request body" };
  const b = body as Record<string, unknown>;
  const out: AccessoryInput = {};

  if (mode === "create" || b.name !== undefined) {
    const name = str(b.name, 140);
    if (name.length < 3) return { error: "Name must be at least 3 characters" };
    out.name = name;
  }
  if (mode === "create" || b.sku !== undefined) {
    const sku = str(b.sku, 64);
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{1,63}$/.test(sku)) {
      return { error: "SKU must be 2–64 characters: letters, numbers, dot, dash or underscore" };
    }
    out.sku = sku;
  }
  if (mode === "create" || b.category !== undefined) {
    const category = str(b.category, 60);
    if (!ACCESSORY_CATEGORIES.some((c) => c.slug === category)) {
      return { error: "Choose a valid category" };
    }
    out.category = category;
  }
  if (mode === "create" || b.price !== undefined) {
    const price = Number(b.price);
    if (!Number.isFinite(price) || price <= 0 || price > 10_000_000) {
      return { error: "Price must be a positive number" };
    }
    out.price = Math.round(price);
  }
  if (b.originalPrice !== undefined && b.originalPrice !== null && b.originalPrice !== "") {
    const op = Number(b.originalPrice);
    if (!Number.isFinite(op) || op < 0) return { error: "Regular price must be a valid number" };
    out.originalPrice = op > 0 ? Math.round(op) : undefined;
  }
  if (mode === "create" || b.stock !== undefined) {
    const stock = Number(b.stock ?? 0);
    if (!Number.isInteger(stock) || stock < 0 || stock > 100_000) {
      return { error: "Stock must be a whole number of 0 or more" };
    }
    out.stock = stock;
  }
  if (b.brand !== undefined || mode === "create") out.brand = str(b.brand, 60) || "Generic";
  if (b.condition !== undefined || mode === "create") {
    const c = str(b.condition, 20) as AccessoryCondition;
    out.condition = ACCESSORY_CONDITIONS.includes(c) ? c : "New";
  }
  if (b.warranty !== undefined || mode === "create") out.warranty = str(b.warranty, 80);
  if (b.color !== undefined || mode === "create") out.color = str(b.color, 40);
  if (b.description !== undefined || mode === "create") out.description = str(b.description, 2000);
  if (b.badge !== undefined) out.badge = str(b.badge, 30) || undefined;
  if (b.compatibility !== undefined || mode === "create") out.compatibility = strList(b.compatibility, 20, 60);
  if (b.specs !== undefined || mode === "create") out.specs = strList(b.specs, 12, 80);
  if (b.images !== undefined || mode === "create") {
    const imgs = strList(b.images, 8, 500);
    if (imgs.some((u) => !isSafeImage(u))) {
      return { error: "Images must be uploaded files or https URLs" };
    }
    out.images = imgs;
  }
  if (b.active !== undefined || mode === "create") out.active = b.active === undefined ? true : Boolean(b.active);

  if (out.price !== undefined && out.originalPrice !== undefined && out.originalPrice <= out.price) {
    out.originalPrice = undefined; // a "regular price" at or below the price is meaningless
  }
  return { data: out };
}

// ─── Persistence ────────────────────────────────────────────────────────────

async function persist(record: AccessoryRecord): Promise<void> {
  let dbOk = false;
  try {
    await prisma.productOverride.upsert({
      where: { sku: `${KEY_PREFIX}${record.sku}` },
      update: { id: `${KEY_PREFIX}${record.id}`, data: record as never, isDeleted: false },
      create: {
        id: `${KEY_PREFIX}${record.id}`,
        sku: `${KEY_PREFIX}${record.sku}`,
        data: record as never,
        isDeleted: false,
      },
    });
    dbOk = true;
  } catch (err) {
    console.error("[accessories] override upsert failed:", err);
  }

  try {
    await prisma.inventory.upsert({
      where: { productId: record.id },
      update: { name: record.name, sku: record.sku, quantity: record.stock },
      create: { productId: record.id, sku: record.sku, name: record.name, quantity: record.stock },
    });
  } catch (err) {
    console.warn("[accessories] inventory sync failed:", err);
  }

  const base = await readBase();
  const i = base.findIndex((a) => a.id === record.id || a.sku.toLowerCase() === record.sku.toLowerCase());
  if (i >= 0) base[i] = record;
  else base.unshift(record);
  const fileOk = await writeBase(base);

  if (!dbOk && !fileOk) {
    throw new Error("Could not save the accessory (database and local file are both unavailable)");
  }
}

function revalidate() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { revalidatePath } = require("next/cache");
    revalidatePath("/accessories");
    revalidatePath("/accessories", "layout");
  } catch {
    // outside a request
  }
}

export async function createAccessory(input: AccessoryInput): Promise<AccessoryRecord> {
  const sku = input.sku!;
  const all = await listAccessories();
  if (all.some((a) => a.sku.toLowerCase() === sku.toLowerCase())) {
    throw new AccessoryConflictError(`An accessory with SKU "${sku}" already exists`);
  }

  const id = accessoryIdFromSku(sku);
  let slug = slugify(`${input.name}`) || id;
  if (all.some((a) => a.slug === slug)) slug = `${slug}-${slugify(sku)}`;

  const now = new Date().toISOString();
  const record: AccessoryRecord = {
    id,
    sku,
    slug,
    name: input.name!,
    brand: input.brand || "Generic",
    category: input.category!,
    compatibility: input.compatibility ?? [],
    condition: input.condition ?? "New",
    warranty: input.warranty ?? "",
    color: input.color ?? "",
    price: input.price!,
    originalPrice: input.originalPrice,
    stock: input.stock ?? 0,
    specs: input.specs ?? [],
    description: input.description ?? "",
    images: input.images ?? [],
    badge: input.badge,
    active: input.active ?? true,
    createdAt: now,
    updatedAt: now,
  };
  await persist(record);
  revalidate();
  return record;
}

export async function updateAccessory(
  idOrSlug: string,
  input: AccessoryInput,
): Promise<AccessoryRecord | null> {
  const existing = await getAccessoryByIdOrSlug(idOrSlug);
  if (!existing) return null;

  if (input.sku && input.sku.toLowerCase() !== existing.sku.toLowerCase()) {
    throw new AccessoryConflictError("SKU can't be changed after creation. Create a new accessory instead.");
  }

  const record: AccessoryRecord = {
    ...existing,
    ...Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined)),
    id: existing.id,
    sku: existing.sku,
    slug: existing.slug,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  } as AccessoryRecord;
  if (input.originalPrice === undefined && "originalPrice" in input) record.originalPrice = undefined;

  await persist(record);
  revalidate();
  return record;
}

export async function deleteAccessory(idOrSlug: string): Promise<boolean> {
  const existing = await getAccessoryByIdOrSlug(idOrSlug);
  if (!existing) return false;

  try {
    await prisma.productOverride.upsert({
      where: { sku: `${KEY_PREFIX}${existing.sku}` },
      update: { isDeleted: true },
      create: {
        id: `${KEY_PREFIX}${existing.id}`,
        sku: `${KEY_PREFIX}${existing.sku}`,
        data: existing as never,
        isDeleted: true,
      },
    });
  } catch (err) {
    console.error("[accessories] delete override failed:", err);
  }
  await prisma.inventory.deleteMany({ where: { productId: existing.id } }).catch(() => {});

  const base = await readBase();
  const next = base.filter((a) => a.id !== existing.id);
  if (next.length !== base.length) await writeBase(next);

  revalidate();
  return true;
}

export class AccessoryConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccessoryConflictError";
  }
}
