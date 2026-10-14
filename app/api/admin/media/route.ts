import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireAdmin } from "@/lib/auth-guard";

export interface MediaAssetItem {
  id: string;
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
}

const mediaMetaFilePath = path.join(process.cwd(), "app", "data", "media-meta.json");

async function readMediaMeta(): Promise<Record<string, { alt?: string; preset?: string }>> {
  try {
    const raw = await fs.readFile(mediaMetaFilePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const presetFilter = searchParams.get("preset") || "all";

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filenames = await fs.readdir(uploadsDir).catch(() => [] as string[]);
    const metadata = await readMediaMeta();

    const assets: MediaAssetItem[] = [];

    for (const file of filenames) {
      if (file.startsWith(".") || file.includes("-w.") || file.includes(".gitkeep")) continue;

      const fullPath = path.join(uploadsDir, file);
      const stat = await fs.stat(fullPath).catch(() => null);
      if (!stat || !stat.isFile()) continue;

      const meta = metadata[file] || {};
      const ext = path.extname(file).toLowerCase();
      const mime = ext === ".webp" ? "image/webp" : ext === ".avif" ? "image/avif" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";

      assets.push({
        id: file,
        originalFilename: file,
        storageKey: file,
        mime,
        width: 1200,
        height: 800,
        bytes: stat.size,
        alt: meta.alt || file.replace(/[-_]/g, " "),
        preset: meta.preset || "card",
        variants: [
          {
            width: 800,
            height: 600,
            format: "webp",
            url: `/uploads/${file}`,
            bytes: stat.size,
          },
        ],
        createdAt: stat.birthtime.toISOString(),
        usages: [],
        isUsed: false,
      });
    }

    // Filter by search and preset
    const filtered = assets.filter((a) => {
      if (search && !a.originalFilename.toLowerCase().includes(search) && !a.alt.toLowerCase().includes(search)) {
        return false;
      }
      if (presetFilter !== "all" && a.preset !== presetFilter) {
        return false;
      }
      return true;
    });

    return NextResponse.json({ assets: filtered });
  } catch (err) {
    console.error("[api/admin/media GET] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load media assets", assets: [] },
      { status: 500 }
    );
  }
}
