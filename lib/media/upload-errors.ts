export class UploadStageError extends Error {
  stage: string;
  code: string | null;
  detail: string;

  constructor(
    stage: string,
    detail: string,
    code?: string | null,
    originalError?: unknown
  ) {
    super(detail);
    this.name = "UploadStageError";
    this.stage = stage;
    this.code = code || (originalError as any)?.code || null;
    this.detail = detail;
    if (originalError instanceof Error && originalError.stack) {
      this.stack = originalError.stack;
    }
  }
}

/**
 * Sanitizes error messages to ensure no absolute system paths outside `/uploads`
 * and no environment variables or credentials are leaked to the client.
 */
export function sanitizeDetail(message: string): string {
  if (!message) return "An unexpected error occurred during image processing";
  let sanitized = String(message);

  // 1. Sanitize file system paths so only /uploads/<file> or /uploads is ever shown
  // Match single-quoted Windows paths
  sanitized = sanitized.replace(/'[A-Za-z]:\\[^'\n\r]+'/gi, (match) => {
    const raw = match.slice(1, -1);
    const filename = raw.split(/[/\\]/).pop() || "";
    return filename ? `'/uploads/${filename}'` : `'/uploads'`;
  });
  // Match double-quoted Windows paths
  sanitized = sanitized.replace(/"[A-Za-z]:\\[^"\n\r]+"/gi, (match) => {
    const raw = match.slice(1, -1);
    const filename = raw.split(/[/\\]/).pop() || "";
    return filename ? `"/uploads/${filename}"` : `"/uploads"`;
  });
  // Match single-quoted Unix paths not starting with /uploads
  sanitized = sanitized.replace(/'\/(?!uploads)(?:[^'\n\r]+\/)+([^'\n\r]+)'/gi, (_match, filename) => {
    return `'/uploads/${filename}'`;
  });
  // Match double-quoted Unix paths not starting with /uploads
  sanitized = sanitized.replace(/"\/(?!uploads)(?:[^"\n\r]+\/)+([^"\n\r]+)"/gi, (_match, filename) => {
    return `"/uploads/${filename}"`;
  });
  // Match any remaining Windows drive paths:
  sanitized = sanitized.replace(/[A-Za-z]:\\(?:[^\s,'";()]+[\\/])*(?:[^\s,'";()]+)?/gi, (match) => {
    const filename = match.split(/[/\\]/).pop() || "";
    return filename ? `/uploads/${filename}` : `/uploads`;
  });

  // 2. Sanitize database URLs and credentials
  sanitized = sanitized.replace(/postgres(?:ql)?:\/\/[^@\s]+@[^\s"']+/gi, "[database]");
  sanitized = sanitized.replace(/mongodb(?:\+srv)?:\/\/[^@\s]+@[^\s"']+/gi, "[database]");
  sanitized = sanitized.replace(/(bearer\s+)[a-zA-Z0-9_\-\.]+/gi, "$1[token]");
  sanitized = sanitized.replace(
    /([a-zA-Z0-9_-]*(?:secret|key|password|token)[a-zA-Z0-9_-]*\s*[:=]\s*)[^\s,"']+/gi,
    "$1[redacted]"
  );

  sanitized = sanitized.trim();
  if (sanitized.length > 200) {
    sanitized = sanitized.slice(0, 197) + "...";
  }

  return sanitized;
}
