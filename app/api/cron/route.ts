import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { runJob, jobsRegistry } from "@/lib/jobs/registry";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = request.headers.get("authorization") || "";
    const expected = `Bearer ${cronSecret}`;

    const authBuffer = Buffer.from(authHeader);
    const expectedBuffer = Buffer.from(expected);

    if (
      authBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(authBuffer, expectedBuffer)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results: Array<{ jobId: string; ok: boolean; message?: string }> = [];

  for (const job of jobsRegistry) {
    try {
      const res = await runJob(job.id);
      results.push({
        jobId: job.id,
        ok: true,
        message: res.message || "Executed",
      });
    } catch (err) {
      results.push({
        jobId: job.id,
        ok: false,
        message: err instanceof Error ? err.message : "Job execution failed",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    jobsRun: results,
  });
}
