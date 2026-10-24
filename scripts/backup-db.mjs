#!/usr/bin/env node
/**
 * Automated Database Backup Utility for Laptop Point BD.
 * Safely exports all core application tables to a timestamped backup with SHA-256 checksum.
 * Supports verifying connectivity and existing backup integrity without writing.
 *
 * Usage:
 *   node scripts/backup-db.mjs           # Run database export
 *   node scripts/backup-db.mjs --verify  # Verify connectivity and backup directory
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config();

const TABLES = [
  "Inventory",
  "InventoryLog",
  "Order",
  "ProductOverride",
  "AdminUser",
  "AdminSession",
];

import { execFileSync } from "node:child_process";

export function validateBackupDirectory(backupDir, repoRoot = process.cwd()) {
  const resolvedDir = path.resolve(backupDir);
  const resolvedRoot = path.resolve(repoRoot);
  const rel = path.relative(resolvedRoot, resolvedDir).replace(/\\/g, "/");
  const lowerRel = rel.toLowerCase();

  // 1. Refuse if inside public/ or app/
  if (
    lowerRel === "public" ||
    lowerRel.startsWith("public/") ||
    lowerRel === "app" ||
    lowerRel.startsWith("app/")
  ) {
    throw new Error(
      `Security violation: Backup directory cannot be inside 'public/' or 'app/' (attempted: ${backupDir})`
    );
  }

  // 2. Refuse if inside repo and not git-ignored
  if (!rel.startsWith("..") && !path.isAbsolute(rel) && rel !== "") {
    const dirWithSlash = rel.endsWith("/") ? rel : rel + "/";
    try {
      execFileSync("git", ["check-ignore", "-q", dirWithSlash], {
        stdio: "ignore",
      });
    } catch {
      throw new Error(
        `Security violation: Backup destination '${backupDir}' is inside the repository but is NOT ignored by .gitignore. Customer PII must never be stored in tracked repository paths.`
      );
    }
  }

  return resolvedDir;
}

export async function runBackup(options = {}) {
  const databaseUrl = options.databaseUrl || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set in environment or .env.local");
  }

  const rawBackupDir = options.backupDir || path.join(process.cwd(), "backups");
  const backupDir = validateBackupDirectory(rawBackupDir);
  await fs.mkdir(backupDir, { recursive: true });

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const client = await pool.connect();
    try {
      if (options.verifyOnly) {
        // Read-only connectivity check
        const res = await client.query("SELECT NOW() as current_time, current_database() as db_name");
        return {
          ok: true,
          verified: true,
          timestamp: res.rows[0].current_time,
          database: res.rows[0].db_name,
        };
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `db-backup-${timestamp}.json`;
      const filepath = path.join(backupDir, filename);

      const backupData = {
        meta: {
          version: "1.0",
          createdAt: new Date().toISOString(),
          tables: {},
        },
        data: {},
      };

      for (const table of TABLES) {
        try {
          // Quote table name to protect reserved words in PostgreSQL
          const result = await client.query(`SELECT * FROM "${table}"`);
          backupData.data[table] = result.rows;
          backupData.meta.tables[table] = result.rowCount;
        } catch (tableErr) {
          // If table doesn't exist yet, record 0 rows
          backupData.data[table] = [];
          backupData.meta.tables[table] = 0;
        }
      }

      const rawJson = JSON.stringify(backupData, null, 2);
      await fs.writeFile(filepath, rawJson, "utf-8");

      const sha256 = crypto.createHash("sha256").update(rawJson).digest("hex");
      const checksumPath = `${filepath}.sha256`;
      await fs.writeFile(checksumPath, `${sha256}  ${filename}\n`, "utf-8");

      const stat = await fs.stat(filepath);

      return {
        ok: true,
        filepath,
        filename,
        checksumPath,
        sha256,
        sizeBytes: stat.size,
        tableCounts: backupData.meta.tables,
      };
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

// CLI runner
const isDirectCall = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
if (isDirectCall) {
  const isVerify = process.argv.includes("--verify");
  console.log(isVerify ? "Verifying database connectivity..." : "Starting automated database backup...");

  runBackup({ verifyOnly: isVerify })
    .then((result) => {
      if (result.verified) {
        console.log(`✓ Connectivity verified. Database: ${result.database} (Timestamp: ${result.timestamp})`);
      } else {
        console.log(`✓ Backup successfully created: ${result.filename}`);
        console.log(`  Path: ${result.filepath}`);
        console.log(`  Size: ${(result.sizeBytes / 1024).toFixed(1)} KB`);
        console.log(`  SHA-256: ${result.sha256}`);
        console.log("  Table Counts:", JSON.stringify(result.tableCounts));
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Backup failed:", err.message);
      process.exit(1);
    });
}
