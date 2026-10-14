import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireAdmin } from "@/lib/auth-guard";

const mediaMetaFilePath = path.join(process.cwd(), "app", "data", "media-meta.json");

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "marketing"] });
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();

    let meta: Record<string, { alt?: string; preset?: string }> = {};
    try {
      const raw = await fs.readFile(mediaMetaFilePath, "utf-8");
      meta = JSON.parse(raw);
    } catch {
      // ignore
    }

    meta[id] = {
      ...meta[id],
      ...(body.alt !== undefined ? { alt: String(body.alt) } : {}),
      ...(body.preset !== undefined ? { preset: String(body.preset) } : {}),
    };

    await fs.mkdir(path.dirname(mediaMetaFilePath), { recursive: true });
    await fs.writeFile(mediaMetaFilePath, JSON.stringify(meta, null, 2), "utf-8");

    return NextResponse.json({ ok: true, id, meta: meta[id] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update asset" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "marketing"] });
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const targetFile = path.join(process.cwd(), "public", "uploads", path.basename(id));

    await fs.unlink(targetFile).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete asset" },
      { status: 500 }
    );
  }
}
