import {
  getClientIp,
  checkQuestionSubmissionRateLimit,
  verifyBotFriction,
} from "@/lib/rate-limit";
import { addQuestion, getQuestions } from "@/lib/questions-storage";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Public product Q&A. Only answered questions are ever exposed here;
// moderation/answering stays in /api/admin/questions.


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
    const clientIp = getClientIp(request);
    const rateCheck = checkQuestionSubmissionRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many questions. Please try again in a few minutes." },
        {
          status: 429,
          headers: { "Retry-After": String(rateCheck.retryAfterSeconds ?? 60) },
        },
      );
    }

    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    let isSuspect = false;
    if (body) {
      const botCheck = verifyBotFriction(body);
      if (botCheck.isBot) {
        return NextResponse.json(
          { error: "Automated submission rejected" },
          { status: 400 }
        );
      }
      if (body._t === undefined || body._t === null || body._t === "") {
        isSuspect = true;
        logger.warn("Public question submission suspect: missing _t render timestamp", {
          ip: getClientIp(request),
          productSlug: typeof body?.productSlug === "string" ? body.productSlug : "unknown",
        });
      }
    }

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
