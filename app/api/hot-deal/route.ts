import { client } from "@/lib/sanity.client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SINGLETON_ID = "hotDeal-singleton";

const DEFAULTS = {
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

export async function GET() {
  try {
    const doc = await client.fetch(
      `*[_type == "hotDeal" && _id == $id][0]{
        headline, subtext, badgeText, bannerImageUrl,
        targetDate, ctaLabel, ctaHref, active
      }`,
      { id: SINGLETON_ID },
    );
    return NextResponse.json(
      { ...DEFAULTS, ...(doc ?? {}) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}
