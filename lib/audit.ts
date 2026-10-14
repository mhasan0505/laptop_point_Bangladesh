export interface AuditParams {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  summary: string;
}

export async function audit(params: AuditParams): Promise<void> {
  // Graceful audit logging (persisting to stdout without requiring custom database schema)
  console.log(`[AUDIT] [${new Date().toISOString()}] ${params.action} on ${params.entity}${params.entityId ? ` (${params.entityId})` : ""}: ${params.summary}${params.userId ? ` by ${params.userId}` : ""}`);
}
