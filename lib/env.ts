import { z } from "zod";

export const KNOWN_WEAK_PASSWORDS = new Set([
  "admin@123",
  "admin123",
  "admin",
  "password",
  "12345678",
  "password123",
  "changeme",
  "laptoppoint",
  "laptoppointbd",
  "qwerty1234",
]);

/**
 * Server-side Environment Schema.
 * Evaluates variables that must only exist in server runtimes (never exposed to client).
 */
export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ADMIN_EMAIL: z.string().email().default("admin@laptoppointbd.com"),
  ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters").optional(),
  ADMIN_SESSION_SECRET: z.string().min(32, "ADMIN_SESSION_SECRET must be at least 32 characters").optional(),
  SETTINGS_ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, "SETTINGS_ENCRYPTION_KEY must be a 64-character hex string")
    .optional(),
  DATA_CACHE_TTL_MS: z.coerce.number().nonnegative().default(15000),
  TRUSTED_PROXY: z.enum(["vercel", "cloudflare", "xff"]).optional(),
  RATE_LIMIT_STORE: z.enum(["memory", "redis"]).default("memory"),

  IMAGEKIT_PUBLIC_KEY: z.string().optional(),
  IMAGEKIT_PRIVATE_KEY: z.string().optional(),
  IMAGEKIT_URL_ENDPOINT: z.string().optional(),
  ALLOW_LOCAL_UPLOADS: z.enum(["0", "1"]).default("0"),

  // Cron & Background jobs
  CRON_SECRET: z.string().optional(),

  // Third-Party Services
  STEADFAST_API_KEY: z.string().optional(),
  STEADFAST_SECRET_KEY: z.string().optional(),
  BKASH_APP_KEY: z.string().optional(),
  BKASH_APP_SECRET: z.string().optional(),
  BKASH_USERNAME: z.string().optional(),
  BKASH_PASSWORD: z.string().optional(),

  // Analytics (Server-side access)
  GA_PROPERTY_ID: z.string().optional(),
  GA4_PROPERTY_ID: z.string().optional(),
  GSC_SITE_URL: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS_JSON: z.string().optional(),
  GA_SERVICE_ACCOUNT: z.string().optional(),
  GSC_SERVICE_ACCOUNT: z.string().optional(),
  META_ADS_ACCESS_TOKEN: z.string().optional(),
  META_ADS_ACCOUNT_ID: z.string().optional(),

  // Social OAuth
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  AUTH_FACEBOOK_ID: z.string().optional(),
  AUTH_FACEBOOK_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),

  // Staging database guard allow-lists
  STAGING_DB_HOST: z.string().optional(),
  STAGING_DB_FINGERPRINT: z.string().optional(),
});

/**
 * Client-side Environment Schema.
 * Variables prefixed with NEXT_PUBLIC_ safe to be exposed in browser bundles.
 */
export const clientEnvSchema = z.object({
  NEXT_PUBLIC_GTM_ID: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_FB_PIXEL_ID: z.string().optional(),
  NEXT_PUBLIC_ENABLE_VARIANTS: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_MAX_UPLOAD_MB: z.coerce.number().positive().default(16),
  NEXT_PUBLIC_BING_SITE_VERIFICATION: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

let validatedEnv: ServerEnv | null = null;

/**
 * Core validation logic that can be tested with arbitrary env dictionaries.
 */
export function validateEnvConfig(
  env: Record<string, string | undefined>,
  isProd = env.NODE_ENV === "production"
): { data: ServerEnv; errors: string[] } {
  const parsedServer = serverEnvSchema.safeParse(env);
  const parsedClient = clientEnvSchema.safeParse(env);

  const errors: string[] = [];

  if (!parsedServer.success) {
    for (const issue of parsedServer.error.issues) {
      errors.push(`[SERVER] ${issue.path.join(".")}: ${issue.message}`);
    }
  }

  if (!parsedClient.success) {
    for (const issue of parsedClient.error.issues) {
      errors.push(`[CLIENT] ${issue.path.join(".")}: ${issue.message}`);
    }
  }

  // Strict production requirements
  if (isProd) {
    if (!env.DATABASE_URL) {
      errors.push("[PRODUCTION] DATABASE_URL is required in production.");
    }

    if (!env.ADMIN_SESSION_SECRET || env.ADMIN_SESSION_SECRET.length < 32) {
      errors.push("[PRODUCTION] ADMIN_SESSION_SECRET must be configured with at least 32 characters.");
    }

    const adminPassword = env.ADMIN_PASSWORD;
    if (!adminPassword || adminPassword.length < 8) {
      errors.push("[PRODUCTION] ADMIN_PASSWORD must be configured with at least 8 characters.");
    } else if (KNOWN_WEAK_PASSWORDS.has(adminPassword.toLowerCase())) {
      errors.push("[PRODUCTION] ADMIN_PASSWORD cannot be a known weak or default password (e.g. admin@123).");
    }

    if (!env.TRUSTED_PROXY) {
      errors.push("[PRODUCTION] TRUSTED_PROXY must be set to 'vercel', 'cloudflare', or 'xff' in production.");
    }

    if (!env.CRON_SECRET || env.CRON_SECRET.trim().length === 0) {
      errors.push("[PRODUCTION] CRON_SECRET is required in production for authenticated background jobs.");
    }
  }

  return {
    data: (parsedServer.data || env) as unknown as ServerEnv,
    errors,
  };
}

/**
 * Fail-fast startup environment validator.
 * In production/staging, immediately throws if critical secrets or database configurations are invalid.
 * In development/test, prints actionable diagnostics without aborting test harnesses.
 */
export function validateEnv(): ServerEnv {
  if (validatedEnv) return validatedEnv;

  const isProd = process.env.NODE_ENV === "production";
  const { data, errors } = validateEnvConfig(process.env, isProd);

  if (errors.length > 0) {
    const errorMsg = [
      "==================================================================",
      "❌ FATAL: ENVIRONMENT CONFIGURATION VALIDATION FAILED",
      "==================================================================",
      ...errors.map((e) => `  - ${e}`),
      "==================================================================",
      "Please verify your environment variables (.env.local or deployment settings).",
      "Refer to .env.example for required schemas and instructions.",
      "==================================================================",
    ].join("\n");

    if (isProd) {
      console.error(errorMsg);
      throw new Error(`Environment validation failed with ${errors.length} error(s). Halting application startup.`);
    } else {
      console.warn(errorMsg);
    }
  }

  validatedEnv = data;
  return validatedEnv;
}
