import dotenv from "dotenv";
import path from "node:path";
import { defineConfig } from "prisma/config";

// Load .env.local explicitly for Prisma config (no-op when file is absent)
dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

// Only override the datasource URL when DATABASE_URL is available.
// During `prisma generate` (e.g. postinstall on Vercel), a live URL is not
// required — the generator only reads the schema to produce TypeScript types.
const datasource = databaseUrl
  ? (() => {
      const url = new URL(databaseUrl);
      url.searchParams.set("sslmode", "require");
      url.searchParams.set("pgbouncer", "true");
      url.searchParams.set("connection_limit", "1");
      return { url: url.toString() };
    })()
  : undefined;

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  ...(datasource ? { datasource } : {}),
});
