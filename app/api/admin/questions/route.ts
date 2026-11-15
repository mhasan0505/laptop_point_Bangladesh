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
    const question = typeof body?.question === "string" ? body.question.trim() : "";
    const productSlug = typeof body?.productSlug === "string" ? body.productSlug.trim() : "";
    const userName = typeof body?.userName === "string" ? body.userName.trim() : "";
    if (!question || !productSlug || !userName) {
      return NextResponse.json(
        { error: "Product slug, user name, and question text are required" },
        { status: 400 },
      );
    }

    const created = await addQuestion({ ...body, question, productSlug, userName });
    return NextResponse.json({ ok: true, question: created });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add question" },
      { status: 500 }
    );
  }
}
