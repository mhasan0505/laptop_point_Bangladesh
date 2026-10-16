import { promises as fs } from "fs";
import path from "path";

async function getPrisma() {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const mod = await import("../prisma.ts").catch(() => import("@/lib/prisma"));
    return mod.prisma;
  } catch {
    return null;
  }
}

export interface MediaMetaRecord {
  fileId?: string;
  url?: string;
  name?: string;
  preset?: string;
  alt?: string;
  width?: number;
  height?: number;
  bytes?: number;
  createdAt?: string;
}

const mediaMetaFilePath = path.join(process.cwd(), "app", "data", "media-meta.json");

// In-memory cache for runtime performance and serverless resilience
const memoryCache: Record<string, MediaMetaRecord> = {};

function sanitizeKey(k: string): string {
  return k.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100);
}

/**
 * Safely reads media-meta.json and merges with memory cache.
 */
export async function readMediaMeta(): Promise<Record<string, MediaMetaRecord>> {
  const result: Record<string, MediaMetaRecord> = { ...memoryCache };
  try {
    const raw = await fs.readFile(mediaMetaFilePath, "utf-8");
    const fileMeta = JSON.parse(raw);
    return { ...fileMeta, ...result };
  } catch {
    return result;
  }
}

/**
 * Safely writes to media-meta.json without throwing on read-only filesystems (EROFS).
 */
export async function writeMediaMeta(meta: Record<string, MediaMetaRecord>): Promise<void> {
  Object.assign(memoryCache, meta);

  try {
    await fs.mkdir(path.dirname(mediaMetaFilePath), { recursive: true });
    const tmp = `${mediaMetaFilePath}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(meta, null, 2), "utf-8");
    await fs.rename(tmp, mediaMetaFilePath);
  } catch (err) {
    // Expected on serverless hosts like Vercel (read-only filesystem)
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code !== "EROFS" && code !== "EACCES" && code !== "EPERM") {
      console.warn("[media/storage] writeMediaMeta filesystem warning:", err);
    }
  }
}

/**
 * Stores or updates metadata for an asset keyed by URL (and optionally fileId).
 * Persists to memory, database (if reachable), and file backup (if writable).
 */
export async function storeMediaMeta(urlOrKey: string, record: MediaMetaRecord): Promise<void> {
  memoryCache[urlOrKey] = {
    ...memoryCache[urlOrKey],
    ...record,
  };

  if (record.fileId) {
    const ikKey = `ik:${record.fileId}`;
    memoryCache[ikKey] = {
      ...memoryCache[ikKey],
      ...record,
    };
  }

  // Best-effort database persistence via ProductOverride for serverless durability
  if (record.fileId || record.url) {
    try {
      const db = await getPrisma();
      if (db) {
        const cleanKey = record.fileId || sanitizeKey(urlOrKey);
        await db.productOverride.upsert({
          where: { sku: `system:media:${cleanKey}` },
          update: { data: record as never, isDeleted: false },
          create: {
            id: `system:media:${cleanKey}`,
            sku: `system:media:${cleanKey}`,
            data: record as never,
            isDeleted: false,
          },
        });
      }
    } catch {
      // Database write is best-effort
    }
  }

  // Update file backup (safely catches EROFS)
  const fullMeta = await readMediaMeta();
  fullMeta[urlOrKey] = { ...fullMeta[urlOrKey], ...record };
  if (record.fileId) {
    fullMeta[`ik:${record.fileId}`] = { ...fullMeta[`ik:${record.fileId}`], ...record };
  }
  await writeMediaMeta(fullMeta);
}

/**
 * Retrieves metadata for an asset by URL, filename, or `ik:${fileId}`.
 */
export async function getMediaMeta(urlOrKey: string): Promise<MediaMetaRecord | undefined> {
  if (memoryCache[urlOrKey]) return memoryCache[urlOrKey];

  const cleanUrl = urlOrKey.split("?")[0];
  if (memoryCache[cleanUrl]) return memoryCache[cleanUrl];

  // Try DB
  try {
    const db = await getPrisma();
    if (db) {
      const fileIdMatch = urlOrKey.startsWith("ik:") ? urlOrKey.slice(3) : sanitizeKey(urlOrKey);
      const dbRecord = await db.productOverride.findUnique({
        where: { sku: `system:media:${fileIdMatch}` },
      });
      if (dbRecord?.data && !dbRecord.isDeleted) {
        const parsed = dbRecord.data as MediaMetaRecord;
        memoryCache[urlOrKey] = parsed;
        return parsed;
      }
    }
  } catch {
    // DB not available or table missing
  }

  const meta = await readMediaMeta();
  if (meta[urlOrKey]) return meta[urlOrKey];
  if (meta[cleanUrl]) return meta[cleanUrl];

  // Search by fileId or url substring
  for (const [key, value] of Object.entries(meta)) {
    if (value.fileId && (urlOrKey === value.fileId || urlOrKey === `ik:${value.fileId}`)) {
      return value;
    }
    if (value.url && value.url.split("?")[0] === cleanUrl) {
      return value;
    }
  }

  return undefined;
}

/**
 * Removes metadata for an asset.
 */
export async function deleteMediaMeta(urlOrKey: string): Promise<void> {
  const cleanUrl = urlOrKey.split("?")[0];
  const fileIdMatch = urlOrKey.startsWith("ik:") ? urlOrKey.slice(3) : sanitizeKey(urlOrKey);

  delete memoryCache[urlOrKey];
  delete memoryCache[cleanUrl];
  for (const [key, value] of Object.entries(memoryCache)) {
    if (
      (value.url && value.url.split("?")[0] === cleanUrl) ||
      (value.fileId && (urlOrKey === value.fileId || urlOrKey === `ik:${value.fileId}`))
    ) {
      delete memoryCache[key];
    }
  }

  // Also remove from DB
  try {
    const db = await getPrisma();
    if (db) {
      await db.productOverride.updateMany({
        where: {
          sku: { in: [`system:media:${fileIdMatch}`, `system:media:${sanitizeKey(cleanUrl)}`] },
        },
        data: { isDeleted: true },
      });
    }
  } catch {
    // Best-effort
  }

  const meta = await readMediaMeta();
  let modified = false;

  if (meta[urlOrKey]) {
    delete meta[urlOrKey];
    modified = true;
  }
  if (meta[cleanUrl]) {
    delete meta[cleanUrl];
    modified = true;
  }

  // Also delete associated `ik:${fileId}` or matching url
  for (const [key, value] of Object.entries(meta)) {
    if (
      (value.url && value.url.split("?")[0] === cleanUrl) ||
      (value.fileId && (urlOrKey === value.fileId || urlOrKey === `ik:${value.fileId}`))
    ) {
      delete meta[key];
      modified = true;
    }
  }

  if (modified) {
    await writeMediaMeta(meta);
  }
}

/**
 * Checks if an asset (by filename, URL, or id) is currently referenced
 * by products, banners, or power deals.
 */
export async function findAssetUsages(target: string): Promise<string[]> {
  const used: string[] = [];
  const cleanTarget = target.split("?")[0].trim();
  const targetBase = path.basename(cleanTarget);

  // If the target is an ik: id, find its corresponding URL if any
  let remoteUrl = "";
  if (cleanTarget.startsWith("ik:")) {
    const meta = await getMediaMeta(cleanTarget);
    if (meta?.url) remoteUrl = meta.url.split("?")[0];
  }

  const matches = (u: unknown): boolean => {
    if (typeof u !== "string" || !u) return false;
    const cleanU = u.split("?")[0].trim();
    if (cleanU === cleanTarget) return true;
    if (remoteUrl && cleanU === remoteUrl) return true;
    if (cleanU.includes("/uploads/") && path.basename(cleanU) === targetBase) return true;
    if (cleanTarget.includes("/uploads/") && path.basename(cleanTarget) === path.basename(cleanU)) return true;
    return false;
  };

  async function readJsonSafe<T>(relPath: string, fallback: T): Promise<T> {
    try {
      const fullPath = path.join(process.cwd(), "app", "data", relPath);
      const content = await fs.readFile(fullPath, "utf-8");
      return JSON.parse(content) as T;
    } catch {
      return fallback;
    }
  }

  const [productsRaw, accessoriesRaw, bannersRaw, dealsRaw] = await Promise.all([
    readJsonSafe<any>("products.json", []),
    readJsonSafe<any>("accessories.json", []),
    readJsonSafe<any>("banners.json", []),
    readJsonSafe<any>("power-deals.json", []),
  ]);

  const products = Array.isArray(productsRaw) ? productsRaw : [];
  const accessories = Array.isArray(accessoriesRaw) ? accessoriesRaw : [];
  const banners = Array.isArray(bannersRaw) ? bannersRaw : [];
  const deals = Array.isArray(dealsRaw) ? dealsRaw : Array.isArray(dealsRaw?.deals) ? dealsRaw.deals : [];

  for (const p of [...products, ...accessories]) {
    if ((p.images ?? []).some(matches)) {
      used.push(`Product: ${p.name || p.sku || p.id}`);
    }
  }
  for (const b of banners) {
    if (matches(b.desktopImageUrl) || matches(b.mobileImageUrl)) {
      used.push(`Banner: ${b.title || b.id}`);
    }
  }
  for (const d of deals) {
    if (matches(d.image)) {
      used.push(`Power Deal: ${d.name || d.id}`);
    }
  }

  return used;
}

/**
 * Deletes a file from ImageKit by fileId.
 */
export async function deleteFromImageKit(
  fileId: string,
  privateKey: string = process.env.IMAGEKIT_PRIVATE_KEY || ""
): Promise<{ ok: boolean; status: number; error?: string }> {
  if (!privateKey) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is not configured");
  }

  const auth = `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`;
  const res = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`, {
    method: "DELETE",
    headers: { Authorization: auth },
    signal: AbortSignal.timeout(15000),
  });

  // 204 No Content, 200 OK, or 404 (already deleted) are considered successful
  if (res.status === 204 || res.status === 200 || res.status === 404) {
    return { ok: true, status: res.status };
  }

  const text = await res.text().catch(() => "");
  return {
    ok: false,
    status: res.status,
    error: `ImageKit responded ${res.status}${text ? `: ${text}` : ""}`,
  };
}
