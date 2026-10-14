import { NextRequest, NextResponse } from "next/server";
import { getQuestions, addQuestion } from "@/lib/questions-storage";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const list = await getQuestions();
    return NextResponse.json(list);
  } catch (err) {
    console.error("[api/admin/questions GET] Error:", err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "support"] });
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    if (!body.question) {
      return NextResponse.json({ error: "Question text is required" }, { status: 400 });
    }

    const created = await addQuestion(body);
    return NextResponse.json({ ok: true, question: created });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add question" },
      { status: 500 }
    );
  }
}
