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

const SINGLETON_ID = "specialOffers-singleton";

export interface OfferCard {
  _key: string;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeColor: string;
  imageUrl: string;
  bgGradient: string;
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
}

export interface SpecialOffersData {
  sectionHeading: string;
  sectionSubheading: string;
  offers: OfferCard[];
}

const DEFAULTS: SpecialOffersData = {
  sectionHeading: "Special Offers",
  sectionSubheading: "Handpicked deals you don't want to miss",
  offers: [],
};

async function getOrCreate(): Promise<SpecialOffersData> {
  const existing = await writeClient.fetch<SpecialOffersData | null>(
    `*[_type == "specialOffers" && _id == $id][0]{
      sectionHeading, sectionSubheading,
      offers[]{ _key, title, subtitle, badgeText, badgeColor, imageUrl, bgGradient, ctaLabel, ctaHref, active }
    }`,
    { id: SINGLETON_ID },
  );
  if (existing) return { ...DEFAULTS, ...existing, offers: existing.offers ?? [] };

  await writeClient.createIfNotExists({
    _id: SINGLETON_ID,
    _type: "specialOffers",
    title: "Special Offers",
    ...DEFAULTS,
  });
  return DEFAULTS;
}

export async function GET(request: NextRequest) {
  const isAdmin = isAdminRequest(request);
  try {
    const readClient = isAdmin ? writeClient : client;
    const doc = await readClient.fetch<SpecialOffersData | null>(
      `*[_type == "specialOffers" && _id == $id][0]{
        sectionHeading, sectionSubheading,
        offers[]{ _key, title, subtitle, badgeText, badgeColor, imageUrl, bgGradient, ctaLabel, ctaHref, active }
      }`,
      { id: SINGLETON_ID },
    );
    const data: SpecialOffersData = {
      ...DEFAULTS,
      ...(doc ?? {}),
      offers: (doc?.offers ?? []).filter((o) => isAdmin || o.active),
    };
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[GET /api/admin/special-offers]", error);
    return NextResponse.json(DEFAULTS);
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const offers: OfferCard[] = (body.offers ?? []).map(
      (o: Partial<OfferCard>, i: number) => ({
        _key: o._key ?? `offer-${Date.now()}-${i}`,
        title: String(o.title ?? ""),
        subtitle: String(o.subtitle ?? ""),
        badgeText: String(o.badgeText ?? ""),
        badgeColor: String(o.badgeColor ?? "red"),
        imageUrl: String(o.imageUrl ?? ""),
        bgGradient: String(o.bgGradient ?? "slate"),
        ctaLabel: String(o.ctaLabel ?? "Shop Now"),
        ctaHref: String(o.ctaHref ?? "/shop"),
        active: o.active !== false,
      }),
    );

    await getOrCreate();
    await writeClient.patch(SINGLETON_ID).set({
      sectionHeading: String(body.sectionHeading ?? DEFAULTS.sectionHeading),
      sectionSubheading: String(body.sectionSubheading ?? DEFAULTS.sectionSubheading),
      offers,
    }).commit({ autoGenerateArrayKeys: true });

    return NextResponse.json({ success: true, count: offers.length });
  } catch (error) {
    console.error("[PUT /api/admin/special-offers]", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
