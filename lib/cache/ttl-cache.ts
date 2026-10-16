/**
 * Generic In-Memory TTL Cache for Serverless & Multi-Instance Environments.
 *
 * Provides a short-lived cache (default 15s, configurable via DATA_CACHE_TTL_MS).
 * Ensures that within a serverless container, frequent reads avoid hammering the database,
 * while expiring rapidly enough that updates made by other instances become visible
 * within the TTL window.
 *
 * If DATA_CACHE_TTL_MS is set to "0", caching is disabled completely (fresh fetch every time).
 */

export interface TtlCacheOptions {
  ttlMs?: number;
  now?: () => number;
}

export class TtlCache<T> {
  private value: T | null = null;
  private cachedAt = 0;
  private readonly defaultTtlMs: number;
  private nowFn: () => number;

  constructor(options: TtlCacheOptions = {}) {
    this.nowFn = options.now || (() => Date.now());
    if (options.ttlMs !== undefined) {
      this.defaultTtlMs = options.ttlMs;
    } else {
      const envTtl = process.env.DATA_CACHE_TTL_MS;
      if (envTtl !== undefined && !Number.isNaN(Number(envTtl))) {
        this.defaultTtlMs = Math.max(0, Number(envTtl));
      } else {
        this.defaultTtlMs = 15000; // 15 seconds default
      }
    }
  }

  get ttlMs(): number {
    const envTtl = process.env.DATA_CACHE_TTL_MS;
    if (envTtl !== undefined && !Number.isNaN(Number(envTtl))) {
      return Math.max(0, Number(envTtl));
    }
    return this.defaultTtlMs;
  }

  setNow(fn: () => number): void {
    this.nowFn = fn;
  }

  get(): T | null {
    if (this.value === null) return null;
    const ttl = this.ttlMs;
    if (ttl === 0) return null;
    if (this.nowFn() - this.cachedAt > ttl) {
      this.value = null;
      return null;
    }
    return this.value;
  }

  set(val: T): void {
    this.value = val;
    this.cachedAt = this.nowFn();
  }

  invalidate(): void {
    this.value = null;
    this.cachedAt = 0;
  }

  isExpired(): boolean {
    if (this.value === null) return true;
    const ttl = this.ttlMs;
    if (ttl === 0) return true;
    return this.nowFn() - this.cachedAt > ttl;
  }

  getCachedAt(): number {
    return this.cachedAt;
  }
}

