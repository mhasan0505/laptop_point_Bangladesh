import { NextRequest, NextResponse } from "next/server";
import { getJobsWithStatus, runJob } from "@/lib/jobs/registry";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const data = await getJobsWithStatus();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/admin/jobs GET] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager"] });
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const jobId = body.jobId;

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const runResult = await runJob(jobId);
    return NextResponse.json({ ok: true, run: runResult });
  } catch (err) {
    console.error("[api/admin/jobs POST] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to execute job" },
      { status: 500 }
    );
  }
}
