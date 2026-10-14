export interface JobResult {
  message: string;
  data?: Record<string, any>;
}

export interface JobDefinition {
  id: string;
  name: string;
  description: string;
  schedule: string; // Cron expression, e.g. "0 3 * * *" (daily at 3 AM)
  run: () => Promise<JobResult>;
}
