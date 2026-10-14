import { NextRequest, NextResponse } from "next/server";
import { savePowerDeal, deletePowerDeal, getPowerDeals } from "@/lib/power-deal-data";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const deals = await getPowerDeals();
    const deal = deals.find((d) => d.id === id);

    if (!deal) {
      return NextResponse.json({ error: "Power deal not found" }, { status: 404 });
    }

    return NextResponse.json({ deal });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error fetching deal" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await savePowerDeal({ id, ...body });
    return NextResponse.json({ ok: true, deal: updated });
  } catch (err) {
    console.error("[api/admin/power-deal/[id] PATCH] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update power deal" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const removed = await deletePowerDeal(id);

    if (!removed) {
      return NextResponse.json({ error: "Power deal not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/power-deal/[id] DELETE] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete power deal" },
      { status: 500 }
    );
  }
}
