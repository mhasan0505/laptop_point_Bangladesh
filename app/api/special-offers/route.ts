import { client } from "@/lib/sanity.client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SINGLETON_ID = "specialOffers-singleton";

export async function GET() {
  try {
    const doc = await client.fetch(
      `*[_type == "specialOffers" && _id == $id][0]{
        sectionHeading, sectionSubheading,
        offers[]{ _key, title, subtitle, badgeText, badgeColor, imageUrl, bgGradient, ctaLabel, ctaHref, active }
      }`,
      { id: SINGLETON_ID },
    );
    const offers = ((doc?.offers as Array<{ active?: boolean }>) ?? []).filter(
      (o) => o.active !== false,
    );
    return NextResponse.json(
      {
        sectionHeading: doc?.sectionHeading ?? "Special Offers",
        sectionSubheading: doc?.sectionSubheading ?? "Handpicked deals you don't want to miss",
        offers,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ sectionHeading: "Special Offers", sectionSubheading: "", offers: [] });
  }
}
