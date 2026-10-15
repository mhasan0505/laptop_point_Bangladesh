import { promises as fs } from "fs";
import path from "path";

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

/**
 * Safely reads media-meta.json.
 */
export async function readMediaMeta(): Promise<Record<string, MediaMetaRecord>> {
  try {
    const raw = await fs.readFile(mediaMetaFilePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Atomically writes to media-meta.json.
 */
export async function writeMediaMeta(meta: Record<string, MediaMetaRecord>): Promise<void> {
  await fs.mkdir(path.dirname(mediaMetaFilePath), { recursive: true });
  const tmp = `${mediaMetaFilePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(meta, null, 2), "utf-8");
  await fs.rename(tmp, mediaMetaFilePath);
}

/**
 * Stores or updates metadata for an asset keyed by URL (and optionally fileId).
 */
export async function storeMediaMeta(urlOrKey: string, record: MediaMetaRecord): Promise<void> {
  const meta = await readMediaMeta();
  meta[urlOrKey] = {
    ...meta[urlOrKey],
    ...record,
  };
  if (record.fileId) {
    const ikKey = `ik:${record.fileId}`;
    meta[ikKey] = {
      ...meta[ikKey],
      ...record,
    };
  }
  await writeMediaMeta(meta);
}

/**
 * Retrieves metadata for an asset by URL, filename, or `ik:${fileId}`.
 */
export async function getMediaMeta(urlOrKey: string): Promise<MediaMetaRecord | undefined> {
  const meta = await readMediaMeta();
  if (meta[urlOrKey]) return meta[urlOrKey];

  // Also check without query string
  const cleanUrl = urlOrKey.split("?")[0];
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
  const meta = await readMediaMeta();
  let modified = false;

  if (meta[urlOrKey]) {
    delete meta[urlOrKey];
    modified = true;
  }
  const cleanUrl = urlOrKey.split("?")[0];
  if (meta[cleanUrl]) {
    delete meta[cleanUrl];
    modified = true;
  }

  // Also delete associated `ik:${fileId}` if present
  for (const [key, value] of Object.entries(meta)) {
    if (value.url && value.url.split("?")[0] === cleanUrl) {
      delete meta[key];
      modified = true;
    }
  }

  if (modified) {
    await writeMediaMeta(meta).catch(() => {});
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
