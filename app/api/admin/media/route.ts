import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireAdmin } from "@/lib/auth-guard";
import { loadMergedRawProducts } from "@/lib/products-storage";
import { readBanners } from "@/lib/banners/storage";
import { getPowerDeals } from "@/lib/power-deal-data";

export interface MediaAssetItem {
  id: string;
  /** Public URL to render and copy (local /uploads path or full ImageKit URL). */
  url: string;
  originalFilename: string;
  storageKey: string;
  mime: string;
  width: number;
  height: number;
  bytes: number;
  alt: string;
  preset: string | null;
  variants: Array<{
    width: number;
    height: number;
    format: string;
    url: string;
    bytes: number;
  }>;
  createdAt: string;
  usages: Array<{ type: "banner" | "product"; id: string; name: string }>;
  isUsed: boolean;
  /** Where the file lives. ImageKit assets are listed read-only. */
  storage?: "local" | "imagekit" | "referenced";
}

const mediaMetaFilePath = path.join(process.cwd(), "app", "data", "media-meta.json");

// Responsive variants are written as `<base>-<width>w.<webp|avif>`; they are
// implementation detail and must not show up as separate library assets.
const VARIANT_FILE = /-\d+w\.(webp|avif)$/i;
const MIME_BY_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

async function readMediaMeta(): Promise<Record<string, { alt?: string; preset?: string }>> {
  try {
    const raw = await fs.readFile(mediaMetaFilePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

type Usage = MediaAssetItem["usages"][number];

/** Map of upload filename (or full remote URL) → where it is used. */
async function collectUsages(): Promise<Map<string, Usage[]>> {
  const map = new Map<string, Usage[]>();
  const add = (url: unknown, usage: Usage) => {
    if (typeof url !== "string" || !url) return;
    const clean = url.split("?")[0];
    const key = clean.includes("/uploads/") ? path.basename(clean) : clean;
    const list = map.get(key) ?? [];
    if (!list.some((u) => u.type === usage.type && u.id === usage.id)) list.push(usage);
    map.set(key, list);
  };

  const [products, banners, deals] = await Promise.all([
    loadMergedRawProducts().catch(() => []),
    readBanners().catch(() => []),
    getPowerDeals().catch(() => []),
  ]);

  for (const p of products) {
    const usage: Usage = { type: "product", id: String(p.id), name: p.name || String(p.sku || p.id) };
    (Array.isArray(p.images) ? p.images : []).forEach((img) => add(img, usage));
  }
  for (const b of banners) {
    const usage: Usage = { type: "banner", id: b.id, name: b.title };
    add(b.desktopImageUrl, usage);
    add(b.mobileImageUrl, usage);
  }
  for (const d of deals) {
    add(d.image, { type: "product", id: d.id, name: `Power Deal: ${d.name}` });
  }
  return map;
}

interface ImageKitFile {
  fileId: string;
  name: string;
  url: string;
  size?: number;
  width?: number;
  height?: number;
  createdAt?: string;
  mime?: string;
  type?: string;
}

const IMAGEKIT_FOLDERS = [
  "/laptop-point",
  "/laptop-point/products",
  "/laptop-point/card",
  "/laptop-point/hero",
  "/laptop-point/product",
  "/laptop-point/wide-banner",
  "/laptop-point/mobile-banner",
  "/laptop-point/icon",
];

/**
 * Best-effort, read-only listing of ImageKit uploads; never fails the request.
 * ImageKit's `path` filter is not recursive, so each known folder is queried.
 */
async function listImageKitAssets(): Promise<ImageKitFile[]> {
  const key = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!key) return [];
  const auth = `Basic ${Buffer.from(`${key}:`).toString("base64")}`;

  const results = await Promise.all(
    IMAGEKIT_FOLDERS.map(async (folder) => {
      try {
        const res = await fetch(
          `https://api.imagekit.io/v1/files?path=${encodeURIComponent(folder)}&fileType=image&sort=DESC_CREATED&limit=100`,
          { headers: { Authorization: auth }, signal: AbortSignal.timeout(8000), cache: "no-store" },
        );
        if (!res.ok) return [] as ImageKitFile[];
        const data = (await res.json()) as ImageKitFile[];
        return Array.isArray(data) ? data.filter((f) => f.type !== "folder" && f.url) : [];
      } catch {
        return [] as ImageKitFile[];
      }
    }),
  );

  const byId = new Map<string, ImageKitFile>();
  for (const f of results.flat()) byId.set(f.fileId, f);
  return [...byId.values()];
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const presetFilter = searchParams.get("preset") || "all";
    const unusedOnly = searchParams.get("unused") === "true";

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const filenames = await fs.readdir(uploadsDir).catch(() => [] as string[]);

    const [metadata, usageMap, ikFiles] = await Promise.all([
      readMediaMeta(),
      collectUsages(),
      listImageKitAssets(),
    ]);

    const assets: MediaAssetItem[] = [];

    for (const file of filenames) {
      if (file.startsWith(".") || VARIANT_FILE.test(file)) continue;
      const ext = path.extname(file).toLowerCase();
      if (!MIME_BY_EXT[ext]) continue;

      const stat = await fs.stat(path.join(uploadsDir, file)).catch(() => null);
      if (!stat || !stat.isFile()) continue;

      const meta = metadata[file] || {};
      const usages = usageMap.get(file) ?? [];

      assets.push({
        id: file,
        url: `/uploads/${file}`,
        originalFilename: file,
        storageKey: file,
        mime: MIME_BY_EXT[ext],
        width: 0,
        height: 0,
        bytes: stat.size,
        alt: meta.alt || file.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        preset: meta.preset || null,
        variants: [{ width: 0, height: 0, format: ext.slice(1), url: `/uploads/${file}`, bytes: stat.size }],
        createdAt: stat.birthtime.toISOString(),
        usages,
        isUsed: usages.length > 0,
        storage: "local",
      });
    }

    for (const f of ikFiles) {
      const usages = usageMap.get(f.url.split("?")[0]) ?? [];
      const id = `ik:${f.fileId}`;
      const meta = metadata[id] || {};
      assets.push({
        id,
        url: f.url,
        originalFilename: f.name,
        storageKey: f.fileId,
        mime: f.mime || "image/webp",
        width: f.width ?? 0,
        height: f.height ?? 0,
        bytes: f.size ?? 0,
        alt: meta.alt || f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        preset: meta.preset || null,
        variants: [{ width: f.width ?? 0, height: f.height ?? 0, format: "webp", url: f.url, bytes: f.size ?? 0 }],
        createdAt: f.createdAt || new Date(0).toISOString(),
        usages,
        isUsed: usages.length > 0,
        storage: "imagekit",
      });
    }

    // Anything a banner, deal or product points at that isn't already listed
    // (remote images, or banner/deal artwork in /public) still belongs in the
    // library, so the page is never empty while the storefront shows images.
    const known = new Set(assets.map((a) => a.url.split("?")[0]));
    for (const [key, usages] of usageMap) {
      const isRemote = /^https?:///i.test(key);
      const isStatic = key.startsWith("/") && !key.startsWith("/uploads/");
      const onlyProducts = usages.every((u) => u.type === "product");
      if (!isRemote && !(isStatic && !onlyProducts)) continue;
      const url = key;
      if (known.has(url)) continue;
      known.add(url);
      const filename = decodeURIComponent(url.split("/").pop() || url);
      assets.push({
        id: `ref:${Buffer.from(url).toString("base64url")}`,
        url,
        originalFilename: filename,
        storageKey: filename,
        mime: MIME_BY_EXT[path.extname(filename).toLowerCase()] || "image/webp",
        width: 0,
        height: 0,
        bytes: 0,
        alt: filename.replace(/.[^.]+$/, "").replace(/[-_]/g, " "),
        preset: null,
        variants: [{ width: 0, height: 0, format: path.extname(filename).slice(1) || "webp", url, bytes: 0 }],
        createdAt: new Date(0).toISOString(),
        usages,
        isUsed: true,
        storage: "referenced",
      });
    }

    const filtered = assets
      .filter((a) => {
        if (search && !a.originalFilename.toLowerCase().includes(search) && !a.alt.toLowerCase().includes(search)) {
          return false;
        }
        if (presetFilter !== "all" && a.preset !== presetFilter) return false;
        if (unusedOnly && a.isUsed) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return NextResponse.json({ assets: filtered });
  } catch (err) {
    console.error("[api/admin/media GET] Error:", err);
    return NextResponse.json({ error: "Failed to load media assets", assets: [] }, { status: 500 });
  }
}
