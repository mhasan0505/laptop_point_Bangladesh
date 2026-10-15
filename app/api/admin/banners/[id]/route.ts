import { NextRequest, NextResponse } from "next/server";
import { saveBanner, deleteBanner, readBanners } from "@/lib/banners/storage";
import { requireAdmin } from "@/lib/auth-guard";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const all = await readBanners();
    const banner = all.find((b) => b.id === id);

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ banner });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error fetching banner" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "marketing"] });
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();

    const saved = await saveBanner({ id, ...body });
    return NextResponse.json({ ok: true, banner: saved });
  } catch (err) {
    console.error("[api/admin/banners/[id] PATCH] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update banner" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "marketing"] });
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const removed = await deleteBanner(id);

    if (!removed) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/banners/[id] DELETE] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete banner" },
      { status: 500 }
    );
  }
}
