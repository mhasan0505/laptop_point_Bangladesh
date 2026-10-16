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

import { TtlCache } from "@/lib/cache/ttl-cache";

const mediaMetaFilePath = path.join(process.cwd(), "app", "data", "media-meta.json");

// In-memory TTL cache for runtime performance and cross-instance coherence
const mediaMetaCache = new TtlCache<Record<string, MediaMetaRecord>>();

export function resetMediaMetaCache(): void {
  mediaMetaCache.invalidate();
}

function sanitizeKey(k: string): string {
  return k.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100);
}

/**
 * Safely reads media-meta from DB overrides, static file, and memory cache.
 */
export async function readMediaMeta(): Promise<Record<string, MediaMetaRecord>> {
  const cached = mediaMetaCache.get();
  if (cached) return { ...cached };

  const result: Record<string, MediaMetaRecord> = {};

  // 1. Static base from local file
  try {
    const raw = await fs.readFile(mediaMetaFilePath, "utf-8");
    const fileMeta = JSON.parse(raw);
    if (fileMeta && typeof fileMeta === "object") {
      Object.assign(result, fileMeta);
    }
  } catch {
    // File not created yet
  }

  // 2. Query database overrides (authoritative source of truth for production)
  try {
    const db = await getPrisma();
    if (db) {
      const records = await db.productOverride.findMany({
        where: { sku: { startsWith: "system:media:" } },
      });
      for (const rec of records) {
        if (rec.isDeleted) {
          const key = rec.sku.replace("system:media:", "");
          delete result[key];
          delete result[`ik:${key}`];
        } else if (rec.data) {
          const data = rec.data as MediaMetaRecord;
          if (data.url) {
            result[data.url] = { ...result[data.url], ...data };
            result[data.url.split("?")[0]] = { ...result[data.url.split("?")[0]], ...data };
          }
          if (data.fileId) {
            result[`ik:${data.fileId}`] = { ...result[`ik:${data.fileId}`], ...data };
            result[data.fileId] = { ...result[data.fileId], ...data };
          }
        }
      }
    }
  } catch (dbErr) {
    console.warn("[readMediaMeta] DB fetch warning:", dbErr);
  }

  mediaMetaCache.set(result);
  return { ...result };
}

/**
 * Safely writes to media-meta.json without throwing on read-only filesystems (EROFS).
 */
export async function writeMediaMeta(meta: Record<string, MediaMetaRecord>): Promise<void> {
  mediaMetaCache.set(meta);

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
  const current = (await readMediaMeta()) || {};
  current[urlOrKey] = {
    ...current[urlOrKey],
    ...record,
  };

  if (record.fileId) {
    const ikKey = `ik:${record.fileId}`;
    current[ikKey] = {
      ...current[ikKey],
      ...record,
    };
  }

  mediaMetaCache.set(current);

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
  await writeMediaMeta(current);
}

/**
 * Retrieves metadata for an asset by URL, filename, or `ik:${fileId}`.
 */
export async function getMediaMeta(urlOrKey: string): Promise<MediaMetaRecord | undefined> {
  const cached = mediaMetaCache.get();
  if (cached) {
    if (cached[urlOrKey]) return cached[urlOrKey];
    const cleanUrl = urlOrKey.split("?")[0];
    if (cached[cleanUrl]) return cached[cleanUrl];
  }

  const meta = await readMediaMeta();
  const cleanUrl = urlOrKey.split("?")[0];
  if (meta[urlOrKey]) return meta[urlOrKey];
  if (meta[cleanUrl]) return meta[cleanUrl];

  // Search by fileId or url substring
  for (const [, value] of Object.entries(meta)) {
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
  const meta = await readMediaMeta();
  const existing = meta[urlOrKey] || meta[cleanUrl];
  const fileId = existing?.fileId;

  const skusToDelete = [
    `system:media:${sanitizeKey(urlOrKey)}`,
    `system:media:${sanitizeKey(cleanUrl)}`,
  ];
  if (fileId) {
    skusToDelete.push(`system:media:${fileId}`);
    skusToDelete.push(`system:media:${sanitizeKey(fileId)}`);
  }
  if (urlOrKey.startsWith("ik:")) {
    skusToDelete.push(`system:media:${urlOrKey.slice(3)}`);
  }

  // Also remove from DB
  try {
    const db = await getPrisma();
    if (db) {
      await db.productOverride.updateMany({
        where: {
          sku: { in: skusToDelete },
        },
        data: { isDeleted: true },
      });
    }
  } catch {
    // Best-effort
  }

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
      (value.fileId && (urlOrKey === value.fileId || urlOrKey === `ik:${value.fileId}` || value.fileId === fileId))
    ) {
      delete meta[key];
      modified = true;
    }
  }

  mediaMetaCache.set(meta);

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
