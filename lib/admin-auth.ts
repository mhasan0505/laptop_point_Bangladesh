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

async function sign(payload: string): Promise<Uint8Array> {
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
    textEncoder.encode(payload),
  );
  return new Uint8Array(signature);
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

/** Create a signed `payload.signature` session token. */
export async function createAdminSession(): Promise<string> {
  const payload = toBase64Url(
    textEncoder.encode(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS })),
  );
  const signature = toBase64Url(await sign(payload));
  return `${payload}.${signature}`;
}

/** Constant-time verify of a session token (also checks expiry). */
export async function verifyAdminSession(
  token: string | null | undefined,
): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = await sign(payload);
  const provided = fromBase64Url(signature);
  if (expected.length !== provided.length) return false;

  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected[i] ^ provided[i];
  }
  if (diff !== 0) return false;

  try {
    const { exp } = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payload)),
    ) as { exp: number };
    return typeof exp === "number" && exp > Date.now();
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

/** Route-handler guard: `false` means the caller should respond 401. */
export async function requireAdminSession(request: Request): Promise<boolean> {
  return verifyAdminSession(readCookie(request, ADMIN_SESSION_COOKIE));
}
