// Server-only admin session helpers.
// Uses the Web Crypto API (crypto.subtle) so the same module runs in both the
// Edge proxy (proxy.ts) and Node.js route handlers — no node:crypto imports.
//
// Replaces the old client-set `admin_authenticated=true` cookie, which anyone
// could forge, and the client-side comparison against NEXT_PUBLIC_* vars that
// shipped the admin password into the browser bundle.

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const textEncoder = new TextEncoder();

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  return secret;
}

async function sign(
  payload: string,
  domain: "session" | "trusted",
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(`${domain}.${payload}`),
  );
  return new Uint8Array(signature);
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const aBytes = textEncoder.encode(a);
  const bBytes = textEncoder.encode(b);
  return timingSafeEqualBytes(aBytes, bBytes);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export const VALID_ADMIN_ROLES = [
  "owner",
  "manager",
  "marketing",
  "support",
] as const;

export type AdminRole = (typeof VALID_ADMIN_ROLES)[number];

export function isValidAdminRole(role: unknown): role is AdminRole {
  return typeof role === "string" && (VALID_ADMIN_ROLES as readonly string[]).includes(role);
}

export interface AdminSessionUser {
  userId: string;
  role: AdminRole;
  email: string;
  name: string;
}

/** Create a signed `payload.signature` session token with role and user metadata. */
export async function createAdminSession(user: AdminSessionUser): Promise<string> {
  if (!user.userId || !isValidAdminRole(user.role)) {
    throw new Error("Cannot create admin session: missing userId or valid role");
  }
  const sessionData = {
    exp: Date.now() + SESSION_TTL_MS,
    userId: user.userId,
    role: user.role,
    email: user.email || "",
    name: user.name || "",
  };
  const payload = toBase64Url(
    textEncoder.encode(JSON.stringify(sessionData)),
  );
  const signature = toBase64Url(await sign(payload, "session"));
  return `${payload}.${signature}`;
}

/** Constant-time verify of a session token (also checks expiry and role). */
export async function verifyAdminSession(
  token: string | null | undefined,
): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = await sign(payload, "session");
  const provided = fromBase64Url(signature);
  if (!timingSafeEqualBytes(expected, provided)) return false;

  try {
    const data = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payload)),
    );
    return (
      typeof data.exp === "number" &&
      data.exp > Date.now() &&
      typeof data.userId === "string" &&
      data.userId.trim().length > 0 &&
      isValidAdminRole(data.role)
    );
  } catch {
    return false;
  }
}

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const equals = trimmed.indexOf("=");
    if (equals === -1) continue;
    if (trimmed.slice(0, equals) === name) {
      return decodeURIComponent(trimmed.slice(equals + 1));
    }
  }
  return undefined;
}

/**
 * Extracts and strictly validates user session data from the signed admin cookie.
 * Rejects (returns null) if expired, or if userId is missing, or if role is missing
 * or not one of "owner" | "manager" | "marketing" | "support".
 * No default fallbacks are applied.
 */
export async function getAdminSession(
  request: Request,
): Promise<(AdminSessionUser & { exp: number }) | null> {
  const token = readCookie(request, ADMIN_SESSION_COOKIE);
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = await sign(payload, "session");
  const provided = fromBase64Url(signature);
  if (!timingSafeEqualBytes(expected, provided)) return null;

  try {
    const data = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payload)),
    );
    if (
      typeof data.exp === "number" &&
      data.exp > Date.now() &&
      typeof data.userId === "string" &&
      data.userId.trim().length > 0 &&
      isValidAdminRole(data.role)
    ) {
      return {
        exp: data.exp,
        userId: data.userId.trim(),
        role: data.role,
        email: typeof data.email === "string" ? data.email : "",
        name: typeof data.name === "string" ? data.name : "",
      };
    }
  } catch {
    return null;
  }
  return null;
}

/** Route-handler guard: `false` means the caller should respond 401. */
export async function requireAdminSession(request: Request): Promise<boolean> {
  return verifyAdminSession(readCookie(request, ADMIN_SESSION_COOKIE));
}

export const TRUSTED_DEVICE_COOKIE = "trusted_device";
const TRUSTED_DEVICE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface TrustedDevicePayload {
  userId: string;
  exp: number;
  fingerprint?: string;
}

/**
 * Computes a keyed HMAC-SHA256 fingerprint of the password or passwordHash via ADMIN_SESSION_SECRET.
 * Yields 43 base64url chars (satisfies 22+ char requirement).
 * Embedded in the trusted_device payload so password changes automatically revoke existing device cookies.
 */
export async function computePasswordFingerprint(passwordOrHash: string): Promise<string> {
  if (!passwordOrHash) return "";
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(passwordOrHash),
  );
  return toBase64Url(new Uint8Array(signature));
}

/**
 * Creates a signed HttpOnly trusted device token ({userId, exp 30d, fingerprint}).
 * Domain-separated from session tokens ("trusted." prefix).
 */
export async function createTrustedDeviceToken(
  userId: string,
  fingerprint: string
): Promise<string> {
  if (!userId || !userId.trim()) {
    throw new Error("Cannot create trusted device token: missing userId");
  }
  if (!fingerprint || !fingerprint.trim()) {
    throw new Error("Cannot create trusted device token: missing fingerprint");
  }
  const payloadData: TrustedDevicePayload = {
    userId: userId.trim(),
    exp: Date.now() + TRUSTED_DEVICE_TTL_MS,
    fingerprint: fingerprint.trim(),
  };
  const payload = toBase64Url(
    textEncoder.encode(JSON.stringify(payloadData))
  );
  const signature = toBase64Url(await sign(payload, "trusted"));
  return `${payload}.${signature}`;
}

/**
 * Verifies a trusted device token against an expected userId and expected fingerprint.
 * Fails closed: requires a non-empty stored fingerprint that matches the expected one.
 * Uses constant-time comparison for signature, userId, and fingerprint.
 */
export async function verifyTrustedDeviceToken(
  token: string | null | undefined,
  expectedUserId: string,
  expectedFingerprint?: string
): Promise<boolean> {
  if (
    !token ||
    !expectedUserId ||
    !expectedUserId.trim() ||
    !expectedFingerprint ||
    !expectedFingerprint.trim()
  ) {
    return false;
  }
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expectedSig = await sign(payload, "trusted");
  const providedSig = fromBase64Url(signature);
  if (!timingSafeEqualBytes(expectedSig, providedSig)) return false;

  try {
    const data = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payload))
    ) as TrustedDevicePayload;
    if (
      typeof data.exp === "number" &&
      data.exp > Date.now() &&
      typeof data.userId === "string" &&
      timingSafeEqualStr(data.userId, expectedUserId.trim()) &&
      typeof data.fingerprint === "string" &&
      data.fingerprint.trim().length > 0 &&
      timingSafeEqualStr(data.fingerprint, expectedFingerprint.trim())
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Helper to extract the trusted_device cookie token from a request.
 */
export function getTrustedDeviceToken(request: Request): string | undefined {
  return readCookie(request, TRUSTED_DEVICE_COOKIE);
}
