"use client";

import * as React from "react";
import {
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  DataTable,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import {
  Play,
  RotateCw,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Calendar,
  Layers,
  Loader2,
} from "lucide-react";

interface JobRunItem {
  id: string;
  name: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  message: string | null;
}

interface RegisteredJob {
  id: string;
  name: string;
  description: string;
  schedule: string;
  lastRun: JobRunItem | null;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = React.useState<RegisteredJob[]>([]);
  const [recentRuns, setRecentRuns] = React.useState<JobRunItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [runningJobId, setRunningJobId] = React.useState<string | null>(null);
  const [runError, setRunError] = React.useState<string | null>(null);

  const fetchJobs = React.useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/jobs");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load jobs");
      }
      const data = await res.json();
      setJobs(data.jobs || []);
      setRecentRuns(data.recentRuns || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading background jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/jobs");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load jobs");
        }
        const data = await res.json();
        if (!ignore) {
          setJobs(data.jobs || []);
          setRecentRuns(data.recentRuns || []);
        }
      } catch (err: unknown) {
        if (!ignore) setError(err instanceof Error ? err.message : "Error loading background jobs");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleRunNow = async (jobId: string) => {
    setRunningJobId(jobId);
    setRunError(null);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to run job");
      }
      await fetchJobs();
    } catch (err: unknown) {
      setRunError(err instanceof Error ? err.message : "Execution failed");
    } finally {
      setRunningJobId(null);
    }
  };

  const totalRuns = recentRuns.length;
  const successfulRuns = recentRuns.filter((r) => r.status === "success").length;
  const failedRuns = recentRuns.filter((r) => r.status === "failed").length;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Background Jobs & Worker"
        description="Monitor automated schedules, system maintenance tasks, and manual trigger executions."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "System" },
          { label: "Background Jobs" },
        ]}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchJobs}
            disabled={loading}
            className="gap-2"
          >
            <RotateCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
            Refresh
          </Button>
        }
      />

      {runError && (
        <div className="flex items-center justify-between p-3 rounded-lg border border-danger/30 bg-danger-soft text-danger text-xs">
          <span>{runError}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setRunError(null)}
            className="h-5 px-1 text-[11px]"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Jobs"
          value={jobs.length}
          subtitle="Active schedules"
          icon={<Layers className="h-4 w-4" />}
          status="info"
        />
        <StatCard
          title="Recent Executions"
          value={totalRuns}
          subtitle="Logged in history"
          icon={<Clock className="h-4 w-4" />}
          status="default"
        />
        <StatCard
          title="Successful Runs"
          value={successfulRuns}
          subtitle={`${((successfulRuns / (totalRuns || 1)) * 100).toFixed(0)}% success rate`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          status="success"
        />
        <StatCard
          title="Failed Runs"
          value={failedRuns}
          subtitle={failedRuns === 0 ? "Healthy" : "Attention needed"}
          icon={<AlertOctagon className="h-4 w-4" />}
          status={failedRuns > 0 ? "danger" : "default"}
        />
      </div>

      {/* Registered Jobs Card */}
      <SectionCard
        title="Scheduled Tasks"
        description="All registered background worker routines"
      >
        <div className="divide-y divide-border/60">
          {jobs.map((job) => {
            const isExecuting = runningJobId === job.id;
            const lastRun = job.lastRun;

            return (
              <div
                key={job.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-semibold text-foreground text-sm">
                      {job.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      <Calendar className="h-3 w-3" />
                      {job.schedule}
                    </span>
                    {lastRun && (
                      <StatusBadge
                        status={lastRun.status}
                        size="sm"
                        label={lastRun.status}
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground max-w-2xl">
                    {job.description}
                  </p>
                  {lastRun && (
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                      <span>
                        Last run: {new Date(lastRun.startedAt).toLocaleString()}
                      </span>
                      {lastRun.durationMs !== null && (
                        <span>• Duration: {lastRun.durationMs}ms</span>
                      )}
                      {lastRun.message && (
                        <span className="truncate max-w-md text-foreground/80">
                          • {lastRun.message}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    disabled={isExecuting}
                    onClick={() => handleRunNow(job.id)}
                    className="gap-1.5 text-xs font-semibold"
                  >
                    {isExecuting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    {isExecuting ? "Executing..." : "Run Now"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Execution Audit History */}
      <SectionCard
        title="Execution History"
        description="Chronological log of all automated and manual worker runs"
      >
        <DataTable
          data={recentRuns}
          keyExtractor={(r) => r.id}
          loading={loading}
          error={error}
          onRetry={fetchJobs}
          searchPlaceholder="Search execution logs..."
          searchKey={(r) => `${r.name} ${r.status} ${r.message || ""}`}
          columns={[
            {
              key: "name",
              header: "Job Name",
              sortable: true,
              render: (r) => (
                <span className="font-semibold text-foreground text-xs">
                  {r.name}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              sortable: true,
              render: (r) => <StatusBadge status={r.status} size="sm" />,
            },
            {
              key: "startedAt",
              header: "Started At",
              sortable: true,
              render: (r) => (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(r.startedAt).toLocaleString()}
                </span>
              ),
            },
            {
              key: "durationMs",
              header: "Duration",
              sortable: true,
              render: (r) => (
                <span className="text-xs font-mono text-muted-foreground">
                  {r.durationMs !== null ? `${r.durationMs}ms` : "—"}
                </span>
              ),
            },
            {
              key: "message",
              header: "Output / Summary",
              className: "max-w-md",
              render: (r) => (
                <span
                  className="text-xs text-muted-foreground block truncate"
                  title={r.message || ""}
                >
                  {r.message || "—"}
                </span>
              ),
            },
          ]}
        />
      </SectionCard>
    </div>
  );
}
