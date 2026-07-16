// Prisma singleton — shared across all hot-reload module instances in dev.
// See: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Copy .env.example → .env.local and supply your PostgreSQL connection string.",
    );
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
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

// Use a Proxy so the PrismaClient is only instantiated on the first actual
// database call, not at module-import time. This lets Next.js import route
// handlers during the build phase without DATABASE_URL being present.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createClient();
    }
    return (
      globalForPrisma.prisma as unknown as Record<string | symbol, unknown>
    )[prop];
  },
});
