// Prisma client — uses Cloudflare Hyperdrive in Workers (per-request) and
// a shared global singleton with DATABASE_URL in local Node.js / scripts.
// See: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Cache one PrismaClient per Cloudflare Worker request (keyed by ExecutionContext)
// so I/O connections are never shared across different Worker requests.
const requestPrismaCache = new WeakMap<object, PrismaClient>();

interface HyperdriveContext {
  connectionString: string;
  ctx: object | null;
}

function isCloudflareWorkersRuntime(): boolean {
  return typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
}

function getHyperdriveContext(): HyperdriveContext | null {
  try {
    const cf = getCloudflareContext();
    const env = cf?.env as { HYPERDRIVE?: { connectionString?: string } } | undefined;
    const connectionString = env?.HYPERDRIVE?.connectionString;
    if (connectionString) {
      // In local `next dev` (Node.js), `initOpenNextCloudflareForDev()` populates
      // `env.HYPERDRIVE.connectionString` with `wrangler.jsonc`'s placeholder
      // `localConnectionString` (`localhost:5432`) because `getPlatformProxy`
      // does not load `.env.local`. Prefer `process.env.DATABASE_URL` in local Node.js.
      if (!isCloudflareWorkersRuntime() && process.env.DATABASE_URL) {
        return null;
      }
      return {
        connectionString,
        ctx: (cf?.ctx as object | undefined) ?? null,
      };
    }
  } catch {
    // Not running inside a Cloudflare Workers / OpenNext request context
    // (e.g., local `next dev` without Hyperdrive, build phase, or CLI scripts).
  }
  return null;
}

function createHyperdriveClient(connectionString: string): PrismaClient {
  // Strip SSL query params before handing the URL to `pg`, because pg-connection-string
  // overrides `config.ssl` whenever `sslmode` / `ssl` is present in the URL.
  // - In production Cloudflare Workers, `env.HYPERDRIVE.connectionString` connects to
  //   Cloudflare's local edge Hyperdrive proxy, which terminates TLS upstream to Aiven
  //   and rejects client SSL handshakes with `'N'` ("The server does not support SSL connections").
  //   We MUST explicitly pass `ssl: false` so `pg` never sends an SSLRequest to Hyperdrive.
  // - In local `next dev` (initOpenNextCloudflareForDev), Wrangler may pass through the
  //   raw remote Aiven URL (`CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE`),
  //   which requires `ssl: { rejectUnauthorized: false }` for Aiven's self-signed CA.
  let normalizedUrl = connectionString;
  let useRemoteDevSsl = false;

  try {
    const parsed = new URL(connectionString);
    const host = parsed.hostname.toLowerCase();
    const isHyperdriveOrLocalProxy =
      host === "hyperdrive.local" ||
      host.endsWith(".hyperdrive.local") ||
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1";

    parsed.searchParams.delete("sslmode");
    parsed.searchParams.delete("ssl");
    parsed.searchParams.delete("sslcert");
    parsed.searchParams.delete("sslkey");
    parsed.searchParams.delete("sslrootcert");
    parsed.searchParams.delete("uselibpqcompat");
    normalizedUrl = parsed.toString();

    if (process.env.NODE_ENV !== "production" && !isHyperdriveOrLocalProxy) {
      useRemoteDevSsl = true;
    }
  } catch {
    // Keep original connectionString if not a standard URL
  }

  if (useRemoteDevSsl) {
    const pool = new Pool({
      connectionString: normalizedUrl,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      allowExitOnIdle: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = new PrismaPg(pool as any);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  // Production Cloudflare Hyperdrive manages connection pooling and upstream TLS at the edge.
  const adapter = new PrismaPg({
    connectionString: normalizedUrl,
    ssl: false,
    max: 5,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function createLocalClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL environment variable is not set and Cloudflare HYPERDRIVE binding is unavailable. " +
        "Copy .env.example → .env.local and supply your PostgreSQL connection string.",
    );
  }
  // pg v8.20+ treats ?sslmode=require as verify-full and overrides pool.ssl,
  // which rejects Aiven's self-signed CA. Strip sslmode so ssl.rejectUnauthorized: false applies.
  let connectionString = process.env.DATABASE_URL;
  let isLocalHost = false;
  try {
    const parsed = new URL(connectionString);
    const host = parsed.hostname.toLowerCase();
    isLocalHost = host === "localhost" || host === "127.0.0.1" || host === "::1";
    parsed.searchParams.delete("sslmode");
    parsed.searchParams.delete("ssl");
    parsed.searchParams.delete("uselibpqcompat");
    connectionString = parsed.toString();
  } catch {
    // Keep original connectionString if not a standard URL
  }
  const pool = new Pool({
    connectionString,
    ssl: isLocalHost ? false : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    allowExitOnIdle: true,
  });
  // Pool type cast resolves a @types/pg version conflict between
  // @prisma/adapter-pg's bundled types and the project's @types/pg.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaPg(pool as any);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export function hasDatabaseConfig(): boolean {
  return getHyperdriveContext() !== null || Boolean(process.env.DATABASE_URL);
}

/**
 * Returns the active PrismaClient:
 * - In Cloudflare Workers with HYPERDRIVE: a per-request client bound to Hyperdrive.
 * - In local Node.js / scripts: a cached singleton connected via DATABASE_URL.
 */
export function getPrisma(): PrismaClient {
  const hyperdrive = getHyperdriveContext();
  if (hyperdrive) {
    if (hyperdrive.ctx) {
      const existing = requestPrismaCache.get(hyperdrive.ctx);
      if (existing) return existing;
      const client = createHyperdriveClient(hyperdrive.connectionString);
      requestPrismaCache.set(hyperdrive.ctx, client);
      return client;
    }
    return createHyperdriveClient(hyperdrive.connectionString);
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createLocalClient();
  }
  return globalForPrisma.prisma;
}

// Use a Proxy so the PrismaClient is resolved lazily on actual database calls,
// not at module-import time. This preserves compatibility with all existing
// `import { prisma } from "@/lib/prisma"` callers while supporting per-request
// Hyperdrive clients in Cloudflare Workers and build-time imports without DATABASE_URL.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const val = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof val === "function") {
      return val.bind(client);
    }
    return val;
  },
});
