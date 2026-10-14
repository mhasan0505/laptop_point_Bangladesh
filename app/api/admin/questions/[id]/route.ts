import { NextRequest, NextResponse } from "next/server";
import { answerQuestion, deleteQuestion } from "@/lib/questions-storage";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (typeof body.answer !== "string") {
      return NextResponse.json({ error: "Answer string is required" }, { status: 400 });
    }

    const updated = await answerQuestion(id, body.answer);
    if (!updated) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, question: updated });
  } catch (err) {
    console.error("[api/admin/questions/[id] PATCH] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save answer" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const removed = await deleteQuestion(id);

    if (!removed) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/questions/[id] DELETE] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete question" },
      { status: 500 }
    );
  }
}
