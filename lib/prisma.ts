
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Use ws constructor for robust Node.js WebSocket communication
neonConfig.webSocketConstructor = ws;

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

  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  });

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
    const val = (
      globalForPrisma.prisma as unknown as Record<string | symbol, unknown>
    )[prop];
    if (typeof val === "function") {
      return val.bind(globalForPrisma.prisma);
    }
    return val;
  },
});
