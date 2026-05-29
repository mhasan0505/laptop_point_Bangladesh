import { writeClient } from "@/lib/sanity.client";
import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

function isAdminRequest(request: NextRequest): boolean {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  const cookie = request.cookies.get("admin_session")?.value;
  if (!sessionSecret || !cookie) return false;
  try {
    const ha = createHash("sha256").update(cookie).digest();
    const hb = createHash("sha256").update(sessionSecret).digest();
    return timingSafeEqual(ha, hb);
  } catch {
    return false;
  }
}

const SINGLETON_ID = "heroBanner-singleton";

export interface HeroSlide {
  _key: string;
  imageUrl: string;
  alt?: string;
  linkHref?: string;
  active: boolean;
}

interface SanityHeroBanner {
  _id: string;
  slides?: HeroSlide[];
}

async function getOrCreateDoc(): Promise<SanityHeroBanner> {
  const existing = await writeClient.fetch<SanityHeroBanner | null>(
    `*[_type == "heroBanner" && _id == $id][0]{ _id, slides }`,
    { id: SINGLETON_ID },
  );
  if (existing) return existing;

  // Create singleton on first access
  const doc = await writeClient.createIfNotExists({
    _id: SINGLETON_ID,
    _type: "heroBanner",
    title: "Hero Banners",
    slides: [],
  });
  return doc as SanityHeroBanner;
}

/**
 * GET /api/admin/hero-banners
 * Returns the current hero banner slides. Also used by the public hero section.
 */
export async function GET(request: NextRequest) {
  // Public read – no auth required (used by front-end HeroSection)
  const isPublic =
    request.nextUrl.searchParams.get("public") === "1" ||
    !request.cookies.get("admin_session");

  if (!isPublic && !isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const doc = await getOrCreateDoc();
    const slides = (doc.slides ?? []).filter((s) => !isPublic || s.active);
    return NextResponse.json({ slides }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[GET /api/admin/hero-banners]", error);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/hero-banners
 * Replaces the entire slides array.
 */
export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const slides: HeroSlide[] = (body.slides ?? []).map(
      (s: Partial<HeroSlide>, i: number) => ({
        _key: s._key ?? `slide-${Date.now()}-${i}`,
        imageUrl: String(s.imageUrl ?? ""),
        alt: s.alt ? String(s.alt) : undefined,
        linkHref: s.linkHref ? String(s.linkHref) : undefined,
        active: s.active !== false,
      }),
    );

    await writeClient
      .patch(SINGLETON_ID)
      .set({ slides })
      .commit({ autoGenerateArrayKeys: true });

    return NextResponse.json({ success: true, count: slides.length });
  } catch (error) {
    console.error("[PUT /api/admin/hero-banners]", error);
    return NextResponse.json({ error: "Failed to save banners" }, { status: 500 });
  }
}
