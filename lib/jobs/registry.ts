import type { JobDefinition } from "./types";
import { pruneOrphanUploadsJob } from "./prune-orphan-uploads";
import { dealExpiryJob } from "./deal-expiry";
import { promises as fs } from "fs";
import path from "path";

export interface JobRunRecord {
  id: string;
  name: string;
  status: "running" | "success" | "failed";
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  message: string | null;
}

import { prisma } from "@/lib/prisma";

export const jobsRegistry: JobDefinition[] = [
  pruneOrphanUploadsJob,
  dealExpiryJob,
];

const jobRunsFilePath = path.join(process.cwd(), "app", "data", "job-runs.json");
let inMemoryJobRuns: JobRunRecord[] = [];

export function resetJobRunsCache(): void {
  inMemoryJobRuns = [];
}

async function loadJobRuns(): Promise<JobRunRecord[]> {
  if (inMemoryJobRuns.length > 0) return inMemoryJobRuns;

  // 1. Try DB ProductOverride FIRST (authoritative in production/serverless)
  try {
    const record = await prisma.productOverride.findUnique({
      where: { sku: "system:job_runs" },
    });
    if (record && record.data && Array.isArray(record.data)) {
      inMemoryJobRuns = record.data as unknown as JobRunRecord[];
      return inMemoryJobRuns;
    }
  } catch (dbErr) {
    console.warn("[loadJobRuns] DB fetch warning:", dbErr);
  }

  // 2. Try local file fallback
  try {
    const raw = await fs.readFile(jobRunsFilePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      inMemoryJobRuns = parsed;
      return parsed;
    }
  } catch {
    // ignore
  }
  return inMemoryJobRuns;
}

async function saveJobRuns(runs: JobRunRecord[]): Promise<void> {
  inMemoryJobRuns = runs;

  // 1. Persist to PostgreSQL (source of truth for serverless instances)
  try {
    await prisma.productOverride.upsert({
      where: { sku: "system:job_runs" },
      create: {
        id: "system:job_runs",
        sku: "system:job_runs",
        data: runs.slice(0, 50) as any,
      },
      update: {
        data: runs.slice(0, 50) as any,
        isDeleted: false,
      },
    });
  } catch (dbErr) {
    console.error("[saveJobRuns] DB persist failed:", dbErr);
  }

  // 2. Best-effort write to local file (safely catches EROFS)
  try {
    await fs.mkdir(path.dirname(jobRunsFilePath), { recursive: true });
    await fs.writeFile(jobRunsFilePath, JSON.stringify(runs.slice(0, 50), null, 2), "utf-8");
  } catch {
    // Read-only filesystem in serverless
  }
}

export function getJob(id: string): JobDefinition | undefined {
  return jobsRegistry.find((job) => job.id === id);
}

export async function runJob(id: string): Promise<JobRunRecord> {
  const job = getJob(id);
  if (!job) {
    throw new Error(`Job "${id}" not found in registry`);
  }

  const allRuns = await loadJobRuns();
  const startTime = Date.now();
  const runRecord: JobRunRecord = {
    id: `run-${Date.now()}`,
    name: job.name,
    status: "running",
    startedAt: new Date().toISOString(),
    finishedAt: null,
    durationMs: null,
    message: null,
  };

  allRuns.unshift(runRecord);
  await saveJobRuns(allRuns);

  try {
    const result = await job.run();
    const durationMs = Date.now() - startTime;

    runRecord.status = "success";
    runRecord.finishedAt = new Date().toISOString();
    runRecord.durationMs = durationMs;
    runRecord.message = result.message;

    await saveJobRuns(allRuns);
    return runRecord;
  } catch (err: unknown) {
    const durationMs = Date.now() - startTime;
    const errorMsg = err instanceof Error ? err.message : String(err);

    runRecord.status = "failed";
    runRecord.finishedAt = new Date().toISOString();
    runRecord.durationMs = durationMs;
    runRecord.message = `Failed: ${errorMsg}`;

    await saveJobRuns(allRuns);
    return runRecord;
  }
}

export async function getJobsWithStatus() {
  const allRuns = await loadJobRuns();

  const latestRuns = jobsRegistry.map((job) => {
    const lastRun = allRuns.find((r) => r.name === job.name) || null;
    return {
      id: job.id,
      name: job.name,
      description: job.description,
      schedule: job.schedule,
      lastRun,
    };
  });

  return {
    jobs: latestRuns,
    recentRuns: allRuns.slice(0, 20),
  };
}
