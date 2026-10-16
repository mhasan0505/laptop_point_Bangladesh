/**
 * Staging Database Guard for Write-Capable Test Scripts.
 * Enforces strict database isolation: refuses any write operation unless
 * the target database (both local script env AND the remote server's active database)
 * matches the explicit staging allow-list (STAGING_DB_FINGERPRINT or STAGING_DB_HOST).
 */

import crypto from "node:crypto";

/**
 * Computes a deterministic SHA-256 fingerprint for a database URL or hostname.
 * Extracts the lowercase hostname and digests with SHA-256.
 * Never stores or returns credentials or ports.
 */
export function computeDbHostFingerprint(urlOrHost) {
  if (!urlOrHost) return "";
  let host = String(urlOrHost).trim();
  try {
    if (host.includes("://")) {
      const u = new URL(host);
      host = u.hostname;
    }
  } catch {
    // keep as raw host if URL parser throws
  }
  return crypto.createHash("sha256").update(host.toLowerCase().trim()).digest("hex");
}

/**
 * Parses and returns the Set of allowed SHA-256 fingerprints from env or options.
 */
export function getAllowedFingerprints(options = {}) {
  const allowed = new Set();

  const envFingerprint = options.allowedFingerprint || process.env.STAGING_DB_FINGERPRINT || "";
  if (envFingerprint) {
    for (const fp of envFingerprint.split(/[\s,]+/)) {
      if (fp.trim()) allowed.add(fp.trim().toLowerCase());
    }
  }

  const envHost = options.allowedHost || process.env.STAGING_DB_HOST || "";
  if (envHost) {
    for (const host of envHost.split(/[\s,]+/)) {
      const trimmed = host.trim();
      if (!trimmed) continue;
      allowed.add(computeDbHostFingerprint(trimmed));
      // If localhost is specified, automatically allow 127.0.0.1 and vice versa
      if (trimmed === "localhost") {
        allowed.add(computeDbHostFingerprint("127.0.0.1"));
      } else if (trimmed === "127.0.0.1") {
        allowed.add(computeDbHostFingerprint("localhost"));
      }
    }
  }

  return allowed;
}

/**
 * Verifies that the server and/or script environment connects exclusively to an allow-listed database.
 *
 * @throws {Error} with descriptive message and code on mismatch, missing allow-list, or unreachable server.
 */
export async function verifyStagingGuard(options = {}) {
  const {
    serverUrl,
    dbUrl = process.env.DATABASE_URL,
    token = process.env.STAGING_GUARD_TOKEN || process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD,
    timeoutMs = 4000,
    allowSimulator = false,
  } = options;

  const allowedFingerprints = getAllowedFingerprints(options);

  // 1. Check for Missing Allow-list
  if (allowedFingerprints.size === 0) {
    if (allowSimulator) {
      return { ok: true, simulated: true };
    }
    const err = new Error("MISSING_ALLOW_LIST: Neither STAGING_DB_FINGERPRINT nor STAGING_DB_HOST is configured in the environment.");
    err.code = "MISSING_ALLOW_LIST";
    throw err;
  }

  // 2. Check local script DATABASE_URL if present
  if (dbUrl && !allowSimulator) {
    const localFp = computeDbHostFingerprint(dbUrl);
    if (!allowedFingerprints.has(localFp)) {
      const err = new Error(`FINGERPRINT_MISMATCH: Script DATABASE_URL host fingerprint (${localFp}) does not match allow-list.`);
      err.code = "FINGERPRINT_MISMATCH";
      throw err;
    }
  }

  // 3. Check Server DATABASE_URL fingerprint via GET /api/admin/health/db if serverUrl is specified
  if (serverUrl) {
    const healthUrl = `${serverUrl.replace(/\/+$/, "")}/api/admin/health/db`;
    let response;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const headers = {
        accept: "application/json",
      };
      if (token) {
        headers["x-staging-guard-token"] = token;
        headers["authorization"] = `Bearer ${token}`;
      }

      response = await fetch(healthUrl, {
        method: "GET",
        headers,
        signal: controller.signal,
      });
      clearTimeout(timer);
    } catch (fetchErr) {
      const err = new Error(`SERVER_UNREACHABLE: Could not connect to staging guard at ${healthUrl} (${fetchErr.message}).`);
      err.code = "SERVER_UNREACHABLE";
      err.cause = fetchErr;
      throw err;
    }

    if (!response.ok) {
      const err = new Error(`SERVER_AUTH_FAILED: Staging guard request failed with HTTP ${response.status} ${response.statusText}.`);
      err.code = response.status === 401 ? "SERVER_UNAUTHORIZED" : "SERVER_ERROR";
      throw err;
    }

    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      const err = new Error(`INVALID_RESPONSE: Could not parse JSON from ${healthUrl}.`);
      err.code = "INVALID_RESPONSE";
      throw err;
    }

    if (!data || !data.ok || typeof data.fingerprint !== "string") {
      const err = new Error(`INVALID_RESPONSE: Server did not return a valid database fingerprint.`);
      err.code = "INVALID_RESPONSE";
      throw err;
    }

    const serverFp = data.fingerprint.toLowerCase().trim();
    if (!allowedFingerprints.has(serverFp)) {
      const err = new Error(`FINGERPRINT_MISMATCH: Server DATABASE_URL host fingerprint (${serverFp}) does not match allow-list.`);
      err.code = "FINGERPRINT_MISMATCH";
      throw err;
    }

    return { ok: true, fingerprint: serverFp };
  }

  return { ok: true };
}

/**
 * Asserts staging database safety. Exits process with code 1 on failure.
 */
export async function assertStagingDatabase(options = {}) {
  try {
    return await verifyStagingGuard(options);
  } catch (err) {
    console.error(`\n❌ SAFETY REFUSAL: ${err.message}`);
    console.error("Aborting script execution to protect database integrity.\n");
    if (options.throwOnError) {
      throw err;
    }
    process.exit(1);
  }
}
