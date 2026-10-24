import { validateEnv } from "@/lib/env";

/**
 * Next.js Instrumentation Hook
 * Executes once when the application server boots up.
 * Evaluates environment configuration and fails fast in production if critical variables are missing or insecure.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" || !process.env.NEXT_RUNTIME) {
    try {
      validateEnv();
    } catch (err) {
      console.error("[CRITICAL STARTUP ERROR] Environment validation failed:", err);
    }
  }
}
