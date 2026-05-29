import { client } from "@/lib/sanity.client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SINGLETON_ID = "heroBanner-singleton";

export async function GET() {
  try {
    const doc = await client.fetch<{ slides?: Array<{ _key: string; imageUrl: string; alt?: string; linkHref?: string; active: boolean }> } | null>(
      `*[_type == "heroBanner" && _id == $id][0]{ slides }`,
      { id: SINGLETON_ID },
    );

    const slides = (doc?.slides ?? []).filter((s) => s.active !== false);
    return NextResponse.json({ slides }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[GET /api/hero-banners]", error);
    return NextResponse.json({ slides: [] });
  }
}
