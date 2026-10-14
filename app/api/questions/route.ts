import { getClientIp } from "@/lib/rate-limit";
import { addQuestion, getQuestions } from "@/lib/questions-storage";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Public product Q&A. Only answered questions are ever exposed here;
// moderation/answering stays in /api/admin/questions.

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function allow(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

export async function GET(request: NextRequest) {
  const slug = new URL(request.url).searchParams.get("productSlug");
  if (!slug) {
    return NextResponse.json({ error: "productSlug is required" }, { status: 400 });
  }
  try {
    const all = await getQuestions();
    const questions = all
      .filter((q) => q.productSlug === slug && q.answer)
      .map(({ id, userName, question, answer, createdAt }) => ({
        id,
        userName,
        question,
        answer,
        createdAt,
      }));
    return NextResponse.json({ questions });
  } catch (err) {
    console.error("[api/questions GET]", err);
    return NextResponse.json({ questions: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!allow(getClientIp(request))) {
      return NextResponse.json(
        { error: "Too many questions. Please try again in a few minutes." },
        { status: 429 },
      );
    }

    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    const productSlug = typeof body?.productSlug === "string" ? body.productSlug.trim() : "";
    const question = typeof body?.question === "string" ? body.question.trim() : "";
    const userName =
      typeof body?.userName === "string" ? body.userName.trim() : "";

    if (!productSlug) {
      return NextResponse.json({ error: "Product is required" }, { status: 400 });
    }
    if (question.length < 10 || question.length > 500) {
      return NextResponse.json(
        { error: "Question must be between 10 and 500 characters" },
        { status: 400 },
      );
    }

    await addQuestion({
      productSlug: productSlug.slice(0, 200),
      userName: (userName || "Customer").slice(0, 60),
      question,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/questions POST]", err);
    return NextResponse.json({ error: "Failed to submit question" }, { status: 500 });
  }
}
