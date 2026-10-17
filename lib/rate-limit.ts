export interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil: number;
}

export const MAX_ATTEMPTS = 5;
export const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

export const GLOBAL_EMAIL_MAX_ATTEMPTS = 10; // 10 failures / 15 min across all IPs
export const GLOBAL_EMAIL_WINDOW_MS = 15 * 60 * 1000; // 15 minutes window

export interface GlobalEmailRecord {
  failures: number;
  firstFailureAt: number;
}

export interface CachedUserRecord {
  user: unknown;
  fetchedAt: number;
}

/**
 * Adapter interface for rate-limiting counters and the 30s user freshness cache.
 * Enables zero-dependency local in-memory storage while supporting distributed stores
 * (such as Upstash Redis) in multi-instance or serverless production deployments.
 */
export interface RateLimitStore {
  getIpAttempt(ip: string): RateLimitRecord | null;
  setIpAttempt(ip: string, record: RateLimitRecord, ttlMs?: number): void;
  deleteIpAttempt(ip: string): void;

  getIpEmailAttempt(key: string): RateLimitRecord | null;
  setIpEmailAttempt(key: string, record: RateLimitRecord, ttlMs?: number): void;
  deleteIpEmailAttempt(key: string): void;

  getGlobalEmailFailure(email: string): GlobalEmailRecord | null;
  setGlobalEmailFailure(email: string, record: GlobalEmailRecord, ttlMs?: number): void;
  deleteGlobalEmailFailure(email: string): void;

  getUserCache(userId: string): CachedUserRecord | null;
  setUserCache(userId: string, entry: CachedUserRecord, ttlMs?: number): void;
  invalidateUserCache(userId?: string): void;
}

export class MemoryRateLimitStore implements RateLimitStore {
  private ipAttempts = new Map<string, RateLimitRecord>();
  private ipEmailAttempts = new Map<string, RateLimitRecord>();
  private globalEmailFailures = new Map<string, GlobalEmailRecord>();
  private userCache = new Map<string, CachedUserRecord>();

  getIpAttempt(ip: string): RateLimitRecord | null {
    const rec = this.ipAttempts.get(ip);
    if (!rec) return null;
    const now = Date.now();
    if (now > rec.lockedUntil && now - rec.firstAttemptAt > WINDOW_MS) {
      this.ipAttempts.delete(ip);
      return null;
    }
    return rec;
  }

  setIpAttempt(ip: string, record: RateLimitRecord): void {
    this.ipAttempts.set(ip, record);
  }

  deleteIpAttempt(ip: string): void {
    this.ipAttempts.delete(ip);
  }

  getIpEmailAttempt(key: string): RateLimitRecord | null {
    const rec = this.ipEmailAttempts.get(key);
    if (!rec) return null;
    const now = Date.now();
    if (now > rec.lockedUntil && now - rec.firstAttemptAt > WINDOW_MS) {
      this.ipEmailAttempts.delete(key);
      return null;
    }
    return rec;
  }

  setIpEmailAttempt(key: string, record: RateLimitRecord): void {
    this.ipEmailAttempts.set(key, record);
  }

  deleteIpEmailAttempt(key: string): void {
    this.ipEmailAttempts.delete(key);
  }

  getGlobalEmailFailure(email: string): GlobalEmailRecord | null {
    const rec = this.globalEmailFailures.get(email);
    if (!rec) return null;
    const now = Date.now();
    if (now - rec.firstFailureAt > GLOBAL_EMAIL_WINDOW_MS) {
      this.globalEmailFailures.delete(email);
      return null;
    }
    return rec;
  }

  setGlobalEmailFailure(email: string, record: GlobalEmailRecord): void {
    this.globalEmailFailures.set(email, record);
  }

  deleteGlobalEmailFailure(email: string): void {
    this.globalEmailFailures.delete(email);
  }

  getUserCache(userId: string): CachedUserRecord | null {
    const rec = this.userCache.get(userId);
    if (!rec) return null;
    const now = Date.now();
    if (now - rec.fetchedAt > 30 * 1000) {
      this.userCache.delete(userId);
      return null;
    }
    return rec;
  }

  setUserCache(userId: string, entry: CachedUserRecord): void {
    this.userCache.set(userId, entry);
  }

  invalidateUserCache(userId?: string): void {
    if (userId) {
      this.userCache.delete(userId);
    } else {
      this.userCache.clear();
    }
  }
}

/**
 * Documented Upstash / Redis implementation stub.
 * Activated via environment variable `RATE_LIMIT_STORE=upstash` or `RATE_LIMIT_STORE=redis`.
 *
 * To connect to live Upstash Redis:
 * 1. Install client: `pnpm add @upstash/redis`
 * 2. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.production
 * 3. Replace the fallback calls below with:
 *    - `redis.get<RateLimitRecord>(key)`
 *    - `redis.set(key, value, { px: ttlMs })`
 *    - `redis.del(key)`
 */
export class UpstashRedisRateLimitStoreStub implements RateLimitStore {
  private fallback = new MemoryRateLimitStore();

  constructor() {
    if (process.env.NODE_ENV === "production") {
      console.info(
        "[RateLimitStore] Upstash Redis store activated via RATE_LIMIT_STORE env. (Using memory fallback stub until confirmed by administrator)."
      );
    }
  }

  getIpAttempt(ip: string): RateLimitRecord | null {
    // Example: return await redis.get<RateLimitRecord>(`rl:ip:${ip}`);
    return this.fallback.getIpAttempt(ip);
  }

  setIpAttempt(ip: string, record: RateLimitRecord, ttlMs: number = LOCKOUT_MS): void {
    // Example: await redis.set(`rl:ip:${ip}`, record, { px: ttlMs });
    this.fallback.setIpAttempt(ip, record);
  }

  deleteIpAttempt(ip: string): void {
    // Example: await redis.del(`rl:ip:${ip}`);
    this.fallback.deleteIpAttempt(ip);
  }

  getIpEmailAttempt(key: string): RateLimitRecord | null {
    // Example: return await redis.get<RateLimitRecord>(`rl:ipe:${key}`);
    return this.fallback.getIpEmailAttempt(key);
  }

  setIpEmailAttempt(key: string, record: RateLimitRecord, ttlMs: number = LOCKOUT_MS): void {
    // Example: await redis.set(`rl:ipe:${key}`, record, { px: ttlMs });
    this.fallback.setIpEmailAttempt(key, record);
  }

  deleteIpEmailAttempt(key: string): void {
    // Example: await redis.del(`rl:ipe:${key}`);
    this.fallback.deleteIpEmailAttempt(key);
  }

  getGlobalEmailFailure(email: string): GlobalEmailRecord | null {
    // Example: return await redis.get<GlobalEmailRecord>(`rl:ge:${email}`);
    return this.fallback.getGlobalEmailFailure(email);
  }

  setGlobalEmailFailure(email: string, record: GlobalEmailRecord, ttlMs: number = GLOBAL_EMAIL_WINDOW_MS): void {
    // Example: await redis.set(`rl:ge:${email}`, record, { px: ttlMs });
    this.fallback.setGlobalEmailFailure(email, record);
  }

  deleteGlobalEmailFailure(email: string): void {
    // Example: await redis.del(`rl:ge:${email}`);
    this.fallback.deleteGlobalEmailFailure(email);
  }

  getUserCache(userId: string): CachedUserRecord | null {
    // Example: return await redis.get<CachedUserRecord>(`cache:user:${userId}`);
    return this.fallback.getUserCache(userId);
  }

  setUserCache(userId: string, entry: CachedUserRecord, ttlMs: number = 30 * 1000): void {
    // Example: await redis.set(`cache:user:${userId}`, entry, { px: ttlMs });
    this.fallback.setUserCache(userId, entry);
  }

  invalidateUserCache(userId?: string): void {
    // Example: if (userId) await redis.del(`cache:user:${userId}`);
    this.fallback.invalidateUserCache(userId);
  }
}

export function createRateLimitStore(): RateLimitStore {
  const store = (process.env.RATE_LIMIT_STORE || "").trim().toLowerCase();
  if (store === "upstash" || store === "redis") {
    return new UpstashRedisRateLimitStoreStub();
  }
  return new MemoryRateLimitStore();
}

export const rateLimitStore = createRateLimitStore();

let hasWarnedProxy = false;

export function warnIfTrustedProxyUnsetInProduction() {
  if (
    !hasWarnedProxy &&
    process.env.NODE_ENV === "production" &&
    !process.env.TRUSTED_PROXY
  ) {
    hasWarnedProxy = true;
    console.warn(
      "[SECURITY WARNING] TRUSTED_PROXY is unset in production. All clients will share the IP identity 'unknown', meaning 5 failed login attempts will lock all untrusted-device logins globally for 15 minutes. Set TRUSTED_PROXY=vercel (or cloudflare/xff) to resolve client IPs securely."
    );
  }
}

// Initial startup warning check
warnIfTrustedProxyUnsetInProduction();

/**
 * Checks whether global failures for this email across all IPs reached or exceeded the cap.
 * Used to reject requests before password verification.
 */
export function isGlobalEmailCapExceeded(
  email: string
): { exceeded: boolean; retryAfterSeconds?: number } {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return { exceeded: false };

  const record = rateLimitStore.getGlobalEmailFailure(normalizedEmail);
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
  const now = Date.now();
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Coarser cap: pure-IP limit blocks aggressive botnet/bruteforce IPs (only if IP is known)
  if (ip !== "unknown") {
    const ipRecord = rateLimitStore.getIpAttempt(ip);
    if (ipRecord && now < ipRecord.lockedUntil) {
      const retryAfter = Math.ceil((ipRecord.lockedUntil - now) / 1000);
      return { allowed: false, retryAfterSeconds: retryAfter };
    }
  }

  // 2. Finer cap: key on ${ip}|${email} so a remote attacker cannot lock out
  // the legitimate store owner from logging in from their own IP.
  if (normalizedEmail) {
    const ipEmailKey = `${ip}|${normalizedEmail}`;
    const ipEmailRecord = rateLimitStore.getIpEmailAttempt(ipEmailKey);
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
  const record = normalizedEmail ? rateLimitStore.getIpEmailAttempt(key) : rateLimitStore.getIpAttempt(key);
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
    const currentIpRecord = rateLimitStore.getIpAttempt(ip);
    if (!currentIpRecord || now - currentIpRecord.firstAttemptAt > WINDOW_MS) {
      rateLimitStore.setIpAttempt(ip, {
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
      rateLimitStore.setIpAttempt(ip, currentIpRecord);
      if (!normalizedEmail) attemptsForDelay = currentIpRecord.attempts;
    }
  }

  // 2. Record for ${ip}|${email} (fine-grained attempt tracking per IP + target user)
  if (normalizedEmail) {
    const ipEmailKey = `${ip}|${normalizedEmail}`;
    const currentIpEmailRecord = rateLimitStore.getIpEmailAttempt(ipEmailKey);
    if (
      !currentIpEmailRecord ||
      now - currentIpEmailRecord.firstAttemptAt > WINDOW_MS
    ) {
      rateLimitStore.setIpEmailAttempt(ipEmailKey, {
        attempts: 1,
        firstAttemptAt: now,
        lockedUntil: 0,
      });
      attemptsForDelay = 1;
    } else {
      currentIpEmailRecord.attempts += 1;
      if (currentIpEmailRecord.attempts >= MAX_ATTEMPTS) {
        currentIpEmailRecord.lockedUntil = now + LOCKOUT_MS;
      }
      rateLimitStore.setIpEmailAttempt(ipEmailKey, currentIpEmailRecord);
      attemptsForDelay = currentIpEmailRecord.attempts;
    }

    // 3. Record for global per-email failure cap across all IPs
    const globalRecord = rateLimitStore.getGlobalEmailFailure(normalizedEmail);
    if (!globalRecord || now - globalRecord.firstFailureAt > GLOBAL_EMAIL_WINDOW_MS) {
      rateLimitStore.setGlobalEmailFailure(normalizedEmail, {
        failures: 1,
        firstFailureAt: now,
      });
    } else {
      globalRecord.failures += 1;
      rateLimitStore.setGlobalEmailFailure(normalizedEmail, globalRecord);
    }
  }

  // Progressive delay: min(200ms * 2^(n-1), 3000ms)
  return Math.min(200 * Math.pow(2, Math.max(0, attemptsForDelay - 1)), 3000);
}

export function resetLoginRateLimit(ip: string, email: string) {
  rateLimitStore.deleteIpAttempt(ip);
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail) {
    rateLimitStore.deleteIpEmailAttempt(`${ip}|${normalizedEmail}`);
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
  warnIfTrustedProxyUnsetInProduction();
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

function cleanExpiredRecords(
  map: Map<string, RateLimitRecord>,
  windowMs: number = ORDER_LOOKUP_WINDOW_MS
) {
  const now = Date.now();
  for (const [key, record] of map.entries()) {
    if (now > record.lockedUntil && now - record.firstAttemptAt > windowMs) {
      map.delete(key);
    }
  }
}

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

interface SlidingWindowRecord {
  timestamps: number[];
}

function checkSlidingWindow(
  map: Map<string, SlidingWindowRecord>,
  ip: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = map.get(ip) ?? { timestamps: [] };
  const recent = entry.timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= maxAttempts) {
    const oldest = recent[0];
    const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    map.set(ip, { timestamps: recent });
    return { allowed: false, retryAfterSeconds: retryAfter };
  }

  recent.push(now);
  map.set(ip, { timestamps: recent });
  return { allowed: true };
}

const orderCreationAttempts = new Map<string, SlidingWindowRecord>();
const questionSubmissionAttempts = new Map<string, SlidingWindowRecord>();
const contactSubmissionAttempts = new Map<string, SlidingWindowRecord>();

export function checkOrderCreationRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  return checkSlidingWindow(orderCreationAttempts, ip, 10, 10 * 60 * 1000); // 10 orders per 10m
}

export function checkQuestionSubmissionRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  return checkSlidingWindow(questionSubmissionAttempts, ip, 5, 10 * 60 * 1000); // 5 questions per 10m
}

export function checkContactSubmissionRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  return checkSlidingWindow(contactSubmissionAttempts, ip, 5, 10 * 60 * 1000); // 5 contact submits per 10m
}

/**
 * Validates bot friction tokens:
 * - Honeypot fields (_hp, hp_field, website, fax) must be empty.
 * - Minimum submission time (_t): if present, must be >= minSeconds (default 2s) to block automated instant scripts.
 */
export function verifyBotFriction(
  data: Record<string, unknown>,
  options?: { minSeconds?: number }
): { isBot: boolean; reason?: string } {
  const honeypots = ["_hp", "hp_field", "website", "fax"];
  for (const field of honeypots) {
    const val = data[field];
    if (typeof val === "string" && val.trim().length > 0) {
      return { isBot: true, reason: `Honeypot field '${field}' was populated` };
    }
  }

  const t = data._t;
  if (t !== undefined && t !== null && t !== "") {
    const timestamp = Number(t);
    if (!Number.isNaN(timestamp)) {
      const minMs = (options?.minSeconds ?? 2) * 1000;
      const elapsed = Date.now() - timestamp;
      if (elapsed < minMs) {
        return { isBot: true, reason: "Form submitted unnaturally quickly (automated bot submission)" };
      }
      if (elapsed > 24 * 60 * 60 * 1000) {
        return { isBot: true, reason: "Form submission token expired (older than 24 hours)" };
      }
    }
  }

  return { isBot: false };
}


