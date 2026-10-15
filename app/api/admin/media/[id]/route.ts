import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireAdmin } from "@/lib/auth-guard";
import { loadMergedRawProducts } from "@/lib/products-storage";
import { readBanners } from "@/lib/banners/storage";
import { getPowerDeals } from "@/lib/power-deal-data";

import {
  findAssetUsages,
  deleteFromImageKit,
  deleteMediaMeta,
} from "@/lib/media/storage";

const mediaMetaFilePath = path.join(process.cwd(), "app", "data", "media-meta.json");
const VARIANT_FILE = /-\d+w\.(webp|avif)$/i;

interface Params {
  params: Promise<{ id: string }>;
}

async function readMeta(): Promise<Record<string, { alt?: string; preset?: string }>> {
  try {
    return JSON.parse(await fs.readFile(mediaMetaFilePath, "utf-8"));
  } catch {
    return {};
  }
}

async function writeMeta(meta: Record<string, unknown>): Promise<void> {
  await fs.mkdir(path.dirname(mediaMetaFilePath), { recursive: true });
  const tmp = `${mediaMetaFilePath}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(meta, null, 2), "utf-8");
  await fs.rename(tmp, mediaMetaFilePath);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "marketing"] });
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { alt?: unknown; preset?: unknown };

    const meta = await readMeta();
    meta[id] = {
      ...meta[id],
      ...(body.alt !== undefined ? { alt: String(body.alt).slice(0, 200) } : {}),
      ...(body.preset !== undefined ? { preset: String(body.preset).slice(0, 40) } : {}),
    };
    await writeMeta(meta);

    return NextResponse.json({ ok: true, id, meta: meta[id] });
  } catch (err) {
    console.error("[api/admin/media PATCH] Error:", err);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "marketing"] });
  if (auth.error) return auth.error;

  try {
    const { id } = await params;

    if (id.startsWith("ref:")) {
      return NextResponse.json(
        { error: "This image is bundled with the site and cannot be deleted." },
        { status: 400 },
      );
    }

    const force = new URL(request.url).searchParams.get("force") === "1";

    if (!force) {
      const usages = await findAssetUsages(id);
      if (usages.length > 0) {
        return NextResponse.json(
          {
            error: `This image is in use (${usages.slice(0, 3).join(", ")}${usages.length > 3 ? "…" : ""}). Replace it first, or delete anyway with force=1.`,
            usages,
          },
          { status: 409 },
        );
      }
    }

    if (id.startsWith("ik:")) {
      const fileId = id.slice(3);
      const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
      if (!privateKey) {
        return NextResponse.json(
          { error: "ImageKit is not configured. Set IMAGEKIT_PRIVATE_KEY to delete ImageKit files." },
          { status: 503 },
        );
      }

      const res = await deleteFromImageKit(fileId, privateKey);
      if (!res.ok) {
        return NextResponse.json(
          { error: res.error || "Failed to delete file from ImageKit" },
          { status: 502 },
        );
      }

      await deleteMediaMeta(id);
      return NextResponse.json({ ok: true, deleted: true, fileId });
    }

    const filename = path.basename(id);
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const stem = filename.replace(/\.[^.]+$/, "");
    const entries = await fs.readdir(uploadsDir).catch(() => [] as string[]);
    const victims = entries.filter(
      (f) => f === filename || (f.startsWith(`${stem}-`) && VARIANT_FILE.test(f)),
    );
    await Promise.all(victims.map((f) => fs.unlink(path.join(uploadsDir, f)).catch(() => {})));

    await deleteMediaMeta(filename);
    await deleteMediaMeta(id);

    return NextResponse.json({ ok: true, removed: victims.length });
  } catch (err) {
    console.error("[api/admin/media DELETE] Error:", err);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}
