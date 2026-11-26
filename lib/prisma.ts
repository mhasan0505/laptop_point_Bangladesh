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

function getHyperdriveContext(): HyperdriveContext | null {
  try {
    const cf = getCloudflareContext();
    const env = cf?.env as { HYPERDRIVE?: { connectionString?: string } } | undefined;
    const connectionString = env?.HYPERDRIVE?.connectionString;
    if (connectionString) {
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
  // Hyperdrive manages connection pooling and upstream TLS at the edge.
  const adapter = new PrismaPg({ connectionString });
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
  try {
    const parsed = new URL(connectionString);
    if (parsed.searchParams.has("sslmode")) {
      parsed.searchParams.delete("sslmode");
      connectionString = parsed.toString();
    }
  } catch {
    // Keep original connectionString if not a standard URL
  }
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 1,
    idleTimeoutMillis: 1000,
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
