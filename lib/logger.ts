/**
 * Structured Server Logging Utility (PII-Safe)
 * Formats structured server events as JSON without leaking passwords, tokens, full phone numbers, or unmasked emails.
 */

export function maskEmail(email: string | null | undefined): string {
  if (!email || typeof email !== "string") return "unknown";
  const parts = email.trim().split("@");
  if (parts.length !== 2) return "***";
  const [user, domain] = parts;
  if (user.length <= 2) return `${user[0] || "*"}***@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

export function maskPhone(phone: string | null | undefined): string {
  if (!phone || typeof phone !== "string") return "unknown";
  const clean = phone.trim();
  if (clean.length < 6) return "***";
  const start = clean.slice(0, 4);
  const end = clean.slice(-3);
  return `${start}****${end}`;
}

interface LogEntry {
  level: "info" | "warn" | "error";
  category: "order" | "auth" | "upload" | "system";
  action: string;
  timestamp: string;
  data: Record<string, unknown>;
}

function emitLog(entry: LogEntry) {
  const line = JSON.stringify(entry);
  if (entry.level === "error") {
    console.error(line);
  } else if (entry.level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  /**
   * Log order placement without PII (customer full phone/address omitted or masked).
   */
  logOrderCreated(params: {
    orderNumber: string;
    totalAmount: number;
    subtotal: number;
    shippingCost: number;
    paymentMethod: string;
    itemCount: number;
    customerEmail?: string;
    customerPhone?: string;
    city?: string;
    suspect?: boolean;
  }) {
    emitLog({
      level: "info",
      category: "order",
      action: "order_created",
      timestamp: new Date().toISOString(),
      data: {
        orderNumber: params.orderNumber,
        totalAmount: params.totalAmount,
        subtotal: params.subtotal,
        shippingCost: params.shippingCost,
        paymentMethod: params.paymentMethod,
        itemCount: params.itemCount,
        city: params.city || "unknown",
        customerEmailMasked: maskEmail(params.customerEmail),
        customerPhoneMasked: maskPhone(params.customerPhone),
        suspect: Boolean(params.suspect),
      },
    });
  },

  /**
   * Log administrative authentication failure without passwords.
   */
  logLoginFailure(params: {
    reason: string;
    ip: string;
    email?: string;
    userAgent?: string;
  }) {
    emitLog({
      level: "warn",
      category: "auth",
      action: "login_failed",
      timestamp: new Date().toISOString(),
      data: {
        reason: params.reason,
        ip: params.ip,
        attemptedEmailMasked: maskEmail(params.email),
        userAgent: params.userAgent || "unknown",
      },
    });
  },

  /**
   * Log administrative authentication success.
   */
  logLoginSuccess(params: {
    userId: string;
    role: string;
    ip: string;
    email?: string;
  }) {
    emitLog({
      level: "info",
      category: "auth",
      action: "login_success",
      timestamp: new Date().toISOString(),
      data: {
        userId: params.userId,
        role: params.role,
        ip: params.ip,
        emailMasked: maskEmail(params.email),
      },
    });
  },

  /**
   * Log upload failure.
   */
  logUploadError(params: {
    stage: string;
    error: string;
    fileName?: string;
    sizeBytes?: number;
    mimeType?: string;
  }) {
    emitLog({
      level: "error",
      category: "upload",
      action: "upload_failed",
      timestamp: new Date().toISOString(),
      data: {
        stage: params.stage,
        error: params.error,
        fileName: params.fileName || "unknown",
        sizeBytes: params.sizeBytes ?? null,
        mimeType: params.mimeType || "unknown",
      },
    });
  },

  /**
   * Log upload success.
   */
  logUploadSuccess(params: {
    fileId?: string;
    storage: "imagekit" | "local";
    fileName: string;
    sizeBytes: number;
    url: string;
  }) {
    emitLog({
      level: "info",
      category: "upload",
      action: "upload_success",
      timestamp: new Date().toISOString(),
      data: {
        fileId: params.fileId || null,
        storage: params.storage,
        fileName: params.fileName,
        sizeBytes: params.sizeBytes,
        url: params.url,
      },
    });
  },

  /**
   * Log suspect bot/submission activity (e.g. missing _t render token).
   */
  logSuspectSubmission(params: {
    form: string;
    ip?: string;
    reason: string;
    metadata?: Record<string, unknown>;
  }) {
    emitLog({
      level: "warn",
      category: "system",
      action: "suspect_submission",
      timestamp: new Date().toISOString(),
      data: {
        form: params.form,
        ip: params.ip || "unknown",
        reason: params.reason,
        metadata: params.metadata || {},
      },
    });
  },

  warn(action: string, data?: Record<string, unknown>) {
    emitLog({
      level: "warn",
      category: "system",
      action,
      timestamp: new Date().toISOString(),
      data: data || {},
    });
  },
};
