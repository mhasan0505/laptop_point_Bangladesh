import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 12 bytes recommended for AES-GCM
const AUTH_TAG_LENGTH = 16;

export class EncryptionKeyError extends Error {
  constructor(message = "SETTINGS_ENCRYPTION_KEY is missing or shorter than 32 characters") {
    super(message);
    this.name = "EncryptionKeyError";
  }
}

/**
 * Checks whether SETTINGS_ENCRYPTION_KEY is present and >= 32 characters.
 */
export function isEncryptionConfigured(): boolean {
  const rawKey = process.env.SETTINGS_ENCRYPTION_KEY;
  return Boolean(rawKey && rawKey.trim().length >= 32);
}

/**
 * Derives a deterministic 32-byte key buffer exclusively from SETTINGS_ENCRYPTION_KEY.
 * Throws EncryptionKeyError if missing or shorter than 32 characters.
 */
function getKey(): Buffer {
  const rawKey = process.env.SETTINGS_ENCRYPTION_KEY;
  if (!rawKey || rawKey.trim().length < 32) {
    throw new EncryptionKeyError(
      "SETTINGS_ENCRYPTION_KEY is missing or shorter than 32 characters"
    );
  }
  return crypto.createHash("sha256").update(rawKey.trim()).digest();
}

/**
 * Encrypts a plaintext string with AES-256-GCM.
 * Output format: `<ivHex>:<authTagHex>:<ciphertextHex>`
 */
export function encryptSecret(plainText: string): string {
  const key = getKey();
  if (!plainText) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM payload.
 */
export function decryptSecret(encryptedPayload: string): string {
  const key = getKey();
  if (!encryptedPayload) return "";
  const parts = encryptedPayload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload format");
  }

  const [ivHex, authTagHex, cipherHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(cipherHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Masks a secret so it is NEVER transmitted in plain text.
 * Returns { configured: boolean, preview: string }
 */
export function maskSecret(secretText: string | null | undefined): {
  configured: boolean;
  preview: string;
} {
  if (!secretText || secretText.trim() === "") {
    return { configured: false, preview: "Not configured" };
  }
  const clean = secretText.trim();
  const last4 = clean.length > 4 ? clean.slice(-4) : clean;
  return {
    configured: true,
    preview: `••••••••••••${last4}`,
  };
}
