import { client, writeClient } from "@/lib/sanity.client";
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

const SINGLETON_ID = "hotDeal-singleton";

export interface HotDealData {
  headline: string;
  subtext: string;
  badgeText: string;
  bannerImageUrl: string;
  targetDate: string;
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
}

const DEFAULTS: HotDealData = {
  headline: "Flash Sale Ends In",
  subtext:
    "Grab your favourite laptops at unbeatable prices. Discounts up to 40% on selected premium models.",
  badgeText: "Limited Time Offer",
  bannerImageUrl: "",
  targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  ctaLabel: "Shop Deals Now",
  ctaHref: "/shop",
  active: true,
};

async function getOrCreate(): Promise<HotDealData> {
  const existing = await writeClient.fetch<HotDealData | null>(
    `*[_type == "hotDeal" && _id == $id][0]{
      headline, subtext, badgeText, bannerImageUrl,
      targetDate, ctaLabel, ctaHref, active
    }`,
    { id: SINGLETON_ID },
  );
  if (existing) return { ...DEFAULTS, ...existing };

  await writeClient.createIfNotExists({
    _id: SINGLETON_ID,
    _type: "hotDeal",
    title: "Hot Deal Banner",
    ...DEFAULTS,
  });
  return DEFAULTS;
}

/**
 * GET /api/admin/hot-deal  — admin + public read
 * GET /api/hot-deal        — handled by /app/api/hot-deal/route.ts
 */
export async function GET(request: NextRequest) {
  const isAdmin = isAdminRequest(request);
  // Public can read too (used by front-end FlashSaleBanner)
  try {
    const readClient = isAdmin ? writeClient : client;
    const doc = await readClient.fetch<HotDealData | null>(
      `*[_type == "hotDeal" && _id == $id][0]{
        headline, subtext, badgeText, bannerImageUrl,
        targetDate, ctaLabel, ctaHref, active
      }`,
      { id: SINGLETON_ID },
    );
    const data: HotDealData = { ...DEFAULTS, ...(doc ?? {}) };
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[GET /api/admin/hot-deal]", error);
    return NextResponse.json(DEFAULTS);
  }
}

/**
 * PUT /api/admin/hot-deal  — replace all fields
 */
export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const payload: Partial<HotDealData> = {};
    if (body.headline !== undefined) payload.headline = String(body.headline);
    if (body.subtext !== undefined) payload.subtext = String(body.subtext);
    if (body.badgeText !== undefined) payload.badgeText = String(body.badgeText);
    if (body.bannerImageUrl !== undefined)
      payload.bannerImageUrl = String(body.bannerImageUrl);
    if (body.targetDate !== undefined) payload.targetDate = String(body.targetDate);
    if (body.ctaLabel !== undefined) payload.ctaLabel = String(body.ctaLabel);
    if (body.ctaHref !== undefined) payload.ctaHref = String(body.ctaHref);
    if (body.active !== undefined) payload.active = Boolean(body.active);

    // Ensure doc exists before patching
    await getOrCreate();
    await writeClient.patch(SINGLETON_ID).set(payload).commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PUT /api/admin/hot-deal]", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
