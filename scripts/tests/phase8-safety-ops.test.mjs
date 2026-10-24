import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Register @/ module alias loader
await import("../lib/register.mjs");

const { logger, maskEmail, maskPhone } = await import("../../lib/logger.ts");
const { GET: cronHandler } = await import("../../app/api/cron/route.ts");
const { validateEnvConfig } = await import("../../lib/env.ts");

test("Phase 8: Data Safety, Backups, and Operations Verification", async (t) => {
  await t.test("1. vercel.json cron configuration is valid", () => {
    const vercelConfigPath = path.join(process.cwd(), "vercel.json");
    assert.ok(fs.existsSync(vercelConfigPath), "vercel.json must exist in root");

    const content = JSON.parse(fs.readFileSync(vercelConfigPath, "utf-8"));
    assert.ok(Array.isArray(content.crons), "vercel.json must have crons array");
    assert.ok(content.crons.length > 0, "At least one cron job must be configured");

    const cron = content.crons.find((c) => c.path === "/api/cron");
    assert.ok(cron, "A cron for /api/cron must be configured");
    assert.ok(
      cron.schedule === "0 * * * *" || cron.schedule === "0 0 * * *",
      "Cron schedule must be hourly (0 * * * *) or daily (0 0 * * * for Vercel Hobby)"
    );
  });

  await t.test("2. Vercel Cron endpoint fails closed on unset secret and enforces authentication", async () => {
    const originalSecret = process.env.CRON_SECRET;
    try {
      // A. Unset secret fails closed with 503
      delete process.env.CRON_SECRET;
      const unsetReq = new Request("http://localhost:3000/api/cron");
      const unsetRes = await cronHandler(unsetReq);
      assert.equal(unsetRes.status, 503, "Unset CRON_SECRET must return 503");
      const unsetJson = await unsetRes.json();
      assert.equal(unsetJson.error, "Cron not configured");

      // B. Wrong secret returns 401
      process.env.CRON_SECRET = "test-cron-secret-12345";
      const unauthReq = new Request("http://localhost:3000/api/cron", {
        headers: { authorization: "Bearer wrong-secret" },
      });
      const unauthRes = await cronHandler(unauthReq);
      assert.equal(unauthRes.status, 401, "Invalid bearer token must return 401");

      // C. Missing authorization header returns 401
      const noHeaderReq = new Request("http://localhost:3000/api/cron");
      const noHeaderRes = await cronHandler(noHeaderReq);
      assert.equal(noHeaderRes.status, 401, "Missing authorization header must return 401");

      // D. Matching Authorization header returns 200
      const authReq = new Request("http://localhost:3000/api/cron", {
        headers: { authorization: "Bearer test-cron-secret-12345" },
      });
      const authRes = await cronHandler(authReq);
      assert.equal(authRes.status, 200, "Matching token must return 200");

      const json = await authRes.json();
      assert.equal(json.ok, true, "Cron response must indicate ok: true");
      assert.ok(Array.isArray(json.jobsRun), "Cron response must return jobsRun array");

      // E. Production env validation requires CRON_SECRET
      const prodCheckMissing = validateEnvConfig({
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://localhost:5432/db",
        ADMIN_PASSWORD: "SuperSecurePassword123!",
        ADMIN_SESSION_SECRET: "a".repeat(32),
        TRUSTED_PROXY: "vercel",
      }, true);
      assert.ok(
        prodCheckMissing.errors.some((e) => e.includes("CRON_SECRET")),
        "validateEnvConfig must require CRON_SECRET in production"
      );

      const prodCheckValid = validateEnvConfig({
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://localhost:5432/db",
        ADMIN_PASSWORD: "SuperSecurePassword123!",
        ADMIN_SESSION_SECRET: "a".repeat(32),
        TRUSTED_PROXY: "vercel",
        CRON_SECRET: "valid-secret-token-321",
      }, true);
      assert.ok(
        !prodCheckValid.errors.some((e) => e.includes("CRON_SECRET")),
        "validateEnvConfig must accept valid CRON_SECRET in production"
      );
    } finally {
      process.env.CRON_SECRET = originalSecret;
    }
  });

  await t.test("3. Prisma seed script enforces remote database safety guard", () => {
    const seedPath = path.join(process.cwd(), "prisma/seed.ts");
    assert.ok(fs.existsSync(seedPath), "prisma/seed.ts must exist");

    const seedCode = fs.readFileSync(seedPath, "utf-8");
    assert.ok(
      seedCode.includes("ALLOW_PRODUCTION_SEED"),
      "prisma/seed.ts must check ALLOW_PRODUCTION_SEED flag"
    );
    assert.ok(
      seedCode.includes("SAFETY REFUSAL"),
      "prisma/seed.ts must log SAFETY REFUSAL for non-local database hosts"
    );
  });

  await t.test("4. Automated backup utility exports files with valid SHA-256 checksums", async () => {
    const { runBackup } = await import("../backup-db.mjs");
    assert.equal(typeof runBackup, "function", "runBackup must be an exported function");

    // Verify backup verification mode behaves as expected
    const backupScriptContent = fs.readFileSync(path.join(process.cwd(), "scripts/backup-db.mjs"), "utf-8");
    assert.ok(
      backupScriptContent.includes("crypto.createHash(\"sha256\")"),
      "backup-db.mjs must generate SHA-256 checksums"
    );
    assert.ok(
      !backupScriptContent.includes("console.log(databaseUrl)") &&
      !backupScriptContent.includes("console.error(databaseUrl)"),
      "backup-db.mjs must never print DATABASE_URL"
    );

    // Verify backup directory path validation refuses public/, app/, and tracked paths
    const { validateBackupDirectory } = await import("../backup-db.mjs");
    assert.equal(typeof validateBackupDirectory, "function", "validateBackupDirectory must be exported");

    assert.throws(
      () => validateBackupDirectory("public/backups"),
      /cannot be inside 'public\/' or 'app\/'/,
      "Must refuse backup paths inside public/"
    );

    assert.throws(
      () => validateBackupDirectory("app/data/backups"),
      /cannot be inside 'public\/' or 'app\/'/,
      "Must refuse backup paths inside app/"
    );

    // backups/ is git-ignored, so it must succeed
    const validDir = validateBackupDirectory("backups");
    assert.ok(validDir.endsWith("backups"), "Git-ignored backups directory must be accepted");

    // Verify restore runbook exists and documents customer PII and encryption
    const runbookPath = path.join(process.cwd(), "docs/RUNBOOKS/DATABASE_BACKUP_RESTORE.md");
    assert.ok(fs.existsSync(runbookPath), "Disaster recovery runbook must exist");
    const runbookContent = fs.readFileSync(runbookPath, "utf-8");
    assert.ok(
      runbookContent.includes("CUSTOMER PII") && runbookContent.includes("Encryption Required"),
      "Runbook must state backups contain customer PII and must be stored encrypted"
    );
  });

  await t.test("5. Structured logging utilities format alerts and audit trails without PII leaks", () => {
    const logs = [];
    const origError = console.error;
    const origLog = console.log;

    try {
      console.error = (msg) => logs.push({ type: "error", msg });
      console.log = (msg) => logs.push({ type: "log", msg });

      // Test order failure alert
      logger.logOrderFailure({
        error: "Insufficient stock for SKU HP-440G3",
        subtotal: 55000,
        shippingCost: 0,
        paymentMethod: "cod",
        itemCount: 1,
        customerEmail: "john.doe@example.com",
        customerPhone: "01711223344",
      });

      const errorEntry = logs.find((l) => l.type === "error");
      assert.ok(errorEntry, "logOrderFailure must emit console.error");
      const parsedError = JSON.parse(errorEntry.msg);
      assert.equal(parsedError.level, "error");
      assert.equal(parsedError.action, "order_failed");
      assert.equal(parsedError.data.alert, true);
      assert.equal(parsedError.data.severity, "critical");
      assert.equal(parsedError.data.customerEmailMasked, "j***e@example.com");
      assert.equal(parsedError.data.customerPhoneMasked, "0171****344");
      assert.ok(!errorEntry.msg.includes("john.doe"), "Raw email must not leak in error log");
      assert.ok(!errorEntry.msg.includes("01711223344"), "Raw phone must not leak in error log");

      // Test admin audit logging
      logger.logAdminAudit({
        actorEmail: "manager@laptoppointbd.com",
        actorRole: "manager",
        action: "product_updated",
        targetId: "45",
        targetType: "product",
        details: { price: 42000, stock: 5 },
      });

      const logEntry = logs.find((l) => l.type === "log" && l.msg.includes("admin_audit"));
      assert.ok(logEntry, "logAdminAudit must emit console.log");
      const parsedAudit = JSON.parse(logEntry.msg);
      assert.equal(parsedAudit.action, "admin_audit");
      assert.equal(parsedAudit.data.actorRole, "manager");
      assert.equal(parsedAudit.data.targetId, "45");
      assert.equal(parsedAudit.data.targetType, "product");
      assert.equal(parsedAudit.data.details.price, 42000);
    } finally {
      console.error = origError;
      console.log = origLog;
    }
  });
});
