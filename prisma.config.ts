import dotenv from "dotenv";
import path from "node:path";
import { defineConfig } from "prisma/config";

// Load .env.local explicitly for Prisma config
dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Check your .env.local file or create one from .env.example",
  );
}

const prismaDatasourceUrl = new URL(databaseUrl);
prismaDatasourceUrl.searchParams.set("sslmode", "require");
prismaDatasourceUrl.searchParams.set("pgbouncer", "true");
prismaDatasourceUrl.searchParams.set("connection_limit", "1");

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: prismaDatasourceUrl.toString(),
  },
});
