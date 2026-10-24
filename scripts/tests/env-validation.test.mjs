import test from "node:test";
import assert from "node:assert/strict";

// Register @/ module alias loader
await import("../lib/register.mjs");

const { validateEnvConfig, KNOWN_WEAK_PASSWORDS } = await import("../../lib/env.ts");

test("Environment Configuration & Fail-Fast Validation (Phase 2)", async (t) => {
  const baseValidProdEnv = {
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://postgres:securepass@ep-staging.us-east-2.aws.neon.tech/laptoppoint?sslmode=require",
    ADMIN_EMAIL: "admin@laptoppointbd.com",
    ADMIN_PASSWORD: "SuperSecureProductionPassword2026!#",
    ADMIN_SESSION_SECRET: "0123456789abcdef0123456789abcdef0123456789abcdef",
    TRUSTED_PROXY: "vercel",
    CRON_SECRET: "valid-vercel-cron-secret-12345",
    DATA_CACHE_TTL_MS: "15000",
    RATE_LIMIT_STORE: "memory",
    ALLOW_LOCAL_UPLOADS: "0",
    NEXT_PUBLIC_MAX_UPLOAD_MB: "16",
    NEXT_PUBLIC_ENABLE_VARIANTS: "false",
  };

  await t.test("1. Complete valid production configuration passes with 0 errors", () => {
    const { data, errors } = validateEnvConfig(baseValidProdEnv, true);
    assert.equal(errors.length, 0, `Expected 0 errors, got: ${errors.join(", ")}`);
    assert.equal(data.DATABASE_URL, baseValidProdEnv.DATABASE_URL);
    assert.equal(data.TRUSTED_PROXY, "vercel");
    assert.equal(data.DATA_CACHE_TTL_MS, 15000);
  });

  await t.test("2. Production mode without DATABASE_URL reports fatal error", () => {
    const env = { ...baseValidProdEnv, DATABASE_URL: "" };
    const { errors } = validateEnvConfig(env, true);
    assert.ok(
      errors.some((e) => e.includes("DATABASE_URL is required")),
      "Must flag missing DATABASE_URL"
    );
  });

  await t.test("3. Production mode with short ADMIN_SESSION_SECRET (< 32 chars) fails", () => {
    const env = { ...baseValidProdEnv, ADMIN_SESSION_SECRET: "short_secret_only_24_ch" };
    const { errors } = validateEnvConfig(env, true);
    assert.ok(
      errors.some((e) => e.includes("ADMIN_SESSION_SECRET must be configured with at least 32 characters")),
      "Must flag session secret under 32 chars"
    );
  });

  await t.test("4. Production mode with known default/weak passwords fails", () => {
    for (const weak of ["admin@123", "admin123", "password", "12345678"]) {
      const env = { ...baseValidProdEnv, ADMIN_PASSWORD: weak };
      const { errors } = validateEnvConfig(env, true);
      assert.ok(
        errors.some((e) => e.includes("known weak or default password")),
        `Must reject weak password '${weak}'`
      );
    }
  });

  await t.test("5. Production mode without TRUSTED_PROXY fails", () => {
    const env = { ...baseValidProdEnv, TRUSTED_PROXY: undefined };
    const { errors } = validateEnvConfig(env, true);
    assert.ok(
      errors.some((e) => e.includes("TRUSTED_PROXY must be set")),
      "Must require TRUSTED_PROXY in production"
    );
  });

  await t.test("6. Invalid hex SETTINGS_ENCRYPTION_KEY fails schema validation", () => {
    const env = { ...baseValidProdEnv, SETTINGS_ENCRYPTION_KEY: "not-a-64-character-hex-string" };
    const { errors } = validateEnvConfig(env, true);
    assert.ok(
      errors.some((e) => e.includes("SETTINGS_ENCRYPTION_KEY must be a 64-character hex string")),
      "Must validate hex format of SETTINGS_ENCRYPTION_KEY"
    );
  });

  await t.test("7. Client NEXT_PUBLIC_MAX_UPLOAD_MB coerces to positive number", () => {
    const env = { ...baseValidProdEnv, NEXT_PUBLIC_MAX_UPLOAD_MB: "25" };
    const { errors } = validateEnvConfig(env, false);
    assert.equal(errors.length, 0);
  });

  await t.test("8. Development mode allows missing production secrets without throwing", () => {
    const devEnv = {
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://localhost:5432/dev",
      // No TRUSTED_PROXY, no ADMIN_SESSION_SECRET, default password
      ADMIN_PASSWORD: "admin@123",
    };
    const { errors } = validateEnvConfig(devEnv, false);
    // In dev (isProd = false), production-only strict guards are skipped
    assert.equal(
      errors.filter((e) => e.includes("[PRODUCTION]")).length,
      0,
      "Dev mode should not trigger [PRODUCTION] fatal errors"
    );
  });
});
