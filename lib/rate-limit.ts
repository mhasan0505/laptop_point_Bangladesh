interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil: number;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

const GLOBAL_EMAIL_MAX_ATTEMPTS = 10; // 10 failures / 15 min across all IPs
const GLOBAL_EMAIL_WINDOW_MS = 15 * 60 * 1000; // 15 minutes window

interface GlobalEmailRecord {
  failures: number;
  firstFailureAt: number;
}

const ipAttempts = new Map<string, RateLimitRecord>();
const ipEmailAttempts = new Map<string, RateLimitRecord>();
const globalEmailFailures = new Map<string, GlobalEmailRecord>();

function cleanExpiredRecords(map: Map<string, RateLimitRecord>) {
  const now = Date.now();
  for (const [key, record] of map.entries()) {
    if (now > record.lockedUntil && now - record.firstAttemptAt > WINDOW_MS) {
      map.delete(key);
    }
  }
}

function cleanGlobalEmailRecords() {
  const now = Date.now();
  for (const [email, record] of globalEmailFailures.entries()) {
    if (now - record.firstFailureAt > GLOBAL_EMAIL_WINDOW_MS) {
      globalEmailFailures.delete(email);
    }
  }
}

/**
 * Checks whether global failures for this email across all IPs reached or exceeded the cap.
 * Used to reject requests before password verification.
 */
export function isGlobalEmailCapExceeded(
  email: string
): { exceeded: boolean; retryAfterSeconds?: number } {
  cleanGlobalEmailRecords();
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return { exceeded: false };

  const record = globalEmailFailures.get(normalizedEmail);
  if (record && record.failures >= GLOBAL_EMAIL_MAX_ATTEMPTS) {
    const elapsed = Date.now() - record.firstFailureAt;
    const remaining = Math.max(1, Math.ceil((GLOBAL_EMAIL_WINDOW_MS - elapsed) / 1000));
    return { exceeded: true, retryAfterSeconds: remaining };
  }
  return { exceeded: false };
}

export function checkLoginRateLimit(
  ip: string,
  email: string
): { allowed: boolean; retryAfterSeconds?: number } {
  cleanExpiredRecords(ipAttempts);
  cleanExpiredRecords(ipEmailAttempts);

  const now = Date.now();
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Coarser cap: pure-IP limit blocks aggressive botnet/bruteforce IPs (only if IP is known)
  if (ip !== "unknown") {
    const ipRecord = ipAttempts.get(ip);
    if (ipRecord && now < ipRecord.lockedUntil) {
      const retryAfter = Math.ceil((ipRecord.lockedUntil - now) / 1000);
      return { allowed: false, retryAfterSeconds: retryAfter };
    }
  }

  // 2. Finer cap: key on ${ip}|${email} so a remote attacker cannot lock out
  // the legitimate store owner from logging in from their own IP.
  if (normalizedEmail) {
    const ipEmailKey = `${ip}|${normalizedEmail}`;
    const ipEmailRecord = ipEmailAttempts.get(ipEmailKey);
    if (ipEmailRecord && now < ipEmailRecord.lockedUntil) {
      const retryAfter = Math.ceil((ipEmailRecord.lockedUntil - now) / 1000);
      return { allowed: false, retryAfterSeconds: retryAfter };
    }
  }

  return { allowed: true };
}

/**
 * Calculates progressive delay for failed attempts on ${ip}|${email}:
 * min(200ms * 2^(n-1), 3000ms).
 */
export function getProgressiveDelayMs(ip: string, email: string): number {
  const normalizedEmail = email.trim().toLowerCase();
  const key = normalizedEmail ? `${ip}|${normalizedEmail}` : ip;
  const record = normalizedEmail ? ipEmailAttempts.get(key) : ipAttempts.get(key);
  const n = record ? record.attempts : 1;
  return Math.min(200 * Math.pow(2, Math.max(0, n - 1)), 3000);
}

/**
 * Records a failed login attempt and returns the progressive delay in ms:
 * min(200ms * 2^(n-1), 3000ms) for the ${ip}|${email} key.
 */
export function recordFailedLogin(ip: string, email: string): number {
  const now = Date.now();
  const normalizedEmail = email.trim().toLowerCase();
  let attemptsForDelay = 1;

  // 1. Record for pure IP (coarser cap, if ip is known)
  if (ip !== "unknown") {
    const currentIpRecord = ipAttempts.get(ip);
    if (!currentIpRecord || now - currentIpRecord.firstAttemptAt > WINDOW_MS) {
      ipAttempts.set(ip, {
        attempts: 1,
        firstAttemptAt: now,
        lockedUntil: 0,
      });
      if (!normalizedEmail) attemptsForDelay = 1;
    } else {
      currentIpRecord.attempts += 1;
      if (currentIpRecord.attempts >= MAX_ATTEMPTS) {
        currentIpRecord.lockedUntil = now + LOCKOUT_MS;
      }
      if (!normalizedEmail) attemptsForDelay = currentIpRecord.attempts;
    }
  }

  // 2. Record for ${ip}|${email} (fine-grained attempt tracking per IP + target user)
  if (normalizedEmail) {
    const ipEmailKey = `${ip}|${normalizedEmail}`;
    const currentIpEmailRecord = ipEmailAttempts.get(ipEmailKey);
    if (
      !currentIpEmailRecord ||
      now - currentIpEmailRecord.firstAttemptAt > WINDOW_MS
    ) {
      ipEmailAttempts.set(ipEmailKey, {
        attempts: 1,
        firstAttemptAt: now,
        lockedUntil: 0,
      });
      attemptsForDelay = 1;
    } else {
      currentIpEmailRecord.attempts += 1;
      attemptsForDelay = currentIpEmailRecord.attempts;
      if (currentIpEmailRecord.attempts >= MAX_ATTEMPTS) {
        currentIpEmailRecord.lockedUntil = now + LOCKOUT_MS;
      }
    }

    // 3. Record for global per-email failure cap across all IPs
    cleanGlobalEmailRecords();
    const globalRecord = globalEmailFailures.get(normalizedEmail);
    if (!globalRecord || now - globalRecord.firstFailureAt > GLOBAL_EMAIL_WINDOW_MS) {
      globalEmailFailures.set(normalizedEmail, {
        failures: 1,
        firstFailureAt: now,
      });
    } else {
      globalRecord.failures += 1;
    }
  }

  // Progressive delay: min(200ms * 2^(n-1), 3000ms)
  return Math.min(200 * Math.pow(2, Math.max(0, attemptsForDelay - 1)), 3000);
}

export function resetLoginRateLimit(ip: string, email: string) {
  ipAttempts.delete(ip);
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail) {
    ipEmailAttempts.delete(`${ip}|${normalizedEmail}`);
  }
}

/**
 * Extracts client IP address based on configured TRUSTED_PROXY:
 * - unset / empty: do not read any forwarding header; return "unknown" (or platform socket address if Next exposes it).
 * - "vercel": reads x-vercel-forwarded-for only.
 * - "cloudflare": reads cf-connecting-ip only.
 * - "xff": reads the LAST entry of x-forwarded-for only.
 * Any other value or missing expected header falls back to "unknown".
 */
export function getClientIp(request: Request): string {
  const proxyMode = (process.env.TRUSTED_PROXY || "").trim().toLowerCase();

  if (proxyMode === "vercel") {
    const vercelIp = request.headers.get("x-vercel-forwarded-for");
    if (vercelIp && vercelIp.trim()) {
      return vercelIp.trim();
    }
    return "unknown";
  }

  if (proxyMode === "cloudflare") {
    const cfIp = request.headers.get("cf-connecting-ip");
    if (cfIp && cfIp.trim()) {
      return cfIp.trim();
    }
    return "unknown";
  }

  if (proxyMode === "xff") {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded && forwarded.trim()) {
      const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
      if (parts.length > 0) {
        return parts[parts.length - 1];
      }
    }
    return "unknown";
  }

  // Unset / default: do NOT trust or read forwarding headers.
  // Check if Next.js or platform provides socket address on the request object.
  const socketIp =
    (request as unknown as { ip?: string; socket?: { remoteAddress?: string } }).ip ||
    (request as unknown as { socket?: { remoteAddress?: string } }).socket?.remoteAddress;
  if (socketIp && typeof socketIp === "string" && socketIp.trim()) {
    return socketIp.trim();
  }

  return "unknown";
}

const orderLookupAttempts = new Map<string, RateLimitRecord>();
const ORDER_LOOKUP_MAX_ATTEMPTS = 15;
const ORDER_LOOKUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const ORDER_LOOKUP_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

export function checkOrderLookupRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  cleanExpiredRecords(orderLookupAttempts);
  const now = Date.now();
  const record = orderLookupAttempts.get(ip);
  if (record && now < record.lockedUntil) {
    const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds: retryAfter };
  }
  return { allowed: true };
}

export function recordFailedOrderLookup(ip: string) {
  cleanExpiredRecords(orderLookupAttempts);
  const now = Date.now();
  const record = orderLookupAttempts.get(ip);

  if (!record || now - record.firstAttemptAt > ORDER_LOOKUP_WINDOW_MS) {
    orderLookupAttempts.set(ip, {
      attempts: 1,
      firstAttemptAt: now,
      lockedUntil: 0,
    });
  } else {
    record.attempts += 1;
    if (record.attempts >= ORDER_LOOKUP_MAX_ATTEMPTS) {
      record.lockedUntil = now + ORDER_LOOKUP_LOCKOUT_MS;
    }
  }
}

