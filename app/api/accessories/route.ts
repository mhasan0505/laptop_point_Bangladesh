import { listPublicAccessories } from "@/lib/accessories-storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Public, read-only. Inactive accessories are never exposed.
export async function GET() {
  try {
    return NextResponse.json(await listPublicAccessories());
  } catch (err) {
    console.error("[GET /api/accessories]", err);
    return NextResponse.json({ error: "Failed to load accessories" }, { status: 500 });
  }
}
