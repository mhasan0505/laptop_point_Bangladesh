import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { TtlCache } from "@/lib/cache/ttl-cache";

export type ContactMessageStatus = "unread" | "read" | "handled";

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ipHash: string; // SHA-256 hash of IP address; never raw IP
  userAgent: string; // Truncated to safe length (<= 150 chars)
  createdAt: string; // ISO 8601 string
  status: ContactMessageStatus;
}

const MAX_MESSAGES_CAP = 2000;
const messagesFilePath = path.join(process.cwd(), "app", "data", "contact-messages.json");
const messagesCache = new TtlCache<ContactMessageRecord[]>();

export function resetContactMessagesCache(): void {
  messagesCache.invalidate();
}

/**
 * Read contact messages from the authoritative store.
 * DB ProductOverride (sku: 'system:contact_messages') is checked first for serverless coherence.
 * Falls back to local file if DB is unavailable.
 */
export async function readContactMessages(): Promise<ContactMessageRecord[]> {
  const cached = messagesCache.get();
  if (cached) return cached;

  // 1. Try DB ProductOverride FIRST (authoritative in production/serverless)
  try {
    const record = await prisma.productOverride.findUnique({
      where: { sku: "system:contact_messages" },
    });
    if (record && record.data && Array.isArray(record.data)) {
      const list = record.data as unknown as ContactMessageRecord[];
      messagesCache.set(list);
      return list;
    }
  } catch (dbErr) {
    // DB not connected (e.g. dev/test mode without remote DB)
    if (process.env.NODE_ENV !== "test") {
      console.warn("[readContactMessages] DB fetch warning:", dbErr);
    }
  }

  // 2. Try local file fallback (catches EROFS)
  try {
    const raw = await fs.readFile(messagesFilePath, "utf-8");
    const parsed = JSON.parse(raw) as ContactMessageRecord[];
    if (Array.isArray(parsed)) {
      messagesCache.set(parsed);
      return parsed;
    }
  } catch {
    // File not created yet
  }

  // 3. Default empty
  const empty: ContactMessageRecord[] = [];
  messagesCache.set(empty);
  return empty;
}

/**
 * Persist contact messages to PostgreSQL and local file.
 * Returns true if at least one persistence layer succeeded.
 * Throws if all storage mechanisms fail so the caller can return 500.
 */
export async function writeContactMessages(items: ContactMessageRecord[]): Promise<void> {
  // Cap at 2000 with oldest dropped
  const capped = items.length > MAX_MESSAGES_CAP ? items.slice(items.length - MAX_MESSAGES_CAP) : items;
  messagesCache.set(capped);

  let dbSuccess = false;
  let dbError: unknown = null;

  // 1. Persist to PostgreSQL ProductOverride (source of truth for serverless instances)
  try {
    const jsonPayload = capped as unknown as Prisma.InputJsonValue;
    await prisma.productOverride.upsert({
      where: { sku: "system:contact_messages" },
      create: {
        id: "system:contact_messages",
        sku: "system:contact_messages",
        data: jsonPayload,
      },
      update: {
        data: jsonPayload,
        isDeleted: false,
      },
    });
    dbSuccess = true;
  } catch (err) {
    dbError = err;
  }

  // 2. Best-effort write to local file for dev/test (catches EROFS in serverless environments)
  let fileSuccess = false;
  try {
    await fs.mkdir(path.dirname(messagesFilePath), { recursive: true });
    await fs.writeFile(messagesFilePath, JSON.stringify(capped, null, 2), "utf-8");
    fileSuccess = true;
  } catch {
    // EROFS-safe: serverless readonly filesystem ignore
  }

  // If BOTH PostgreSQL and local disk persistence failed, throw an error
  if (!dbSuccess && !fileSuccess) {
    throw new Error(
      `Failed to persist contact messages: ${dbError instanceof Error ? dbError.message : "All storage mechanisms failed"}`
    );
  }
}

/**
 * Return all contact messages sorted newest first.
 */
export async function getContactMessages(): Promise<ContactMessageRecord[]> {
  const items = await readContactMessages();
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Add a new contact message submission to the store.
 */
export async function addContactMessage(params: {
  name: string;
  email: string;
  subject?: string;
  message: string;
  ipHash: string;
  userAgent?: string;
}): Promise<ContactMessageRecord> {
  const all = await readContactMessages();
  const newMsg: ContactMessageRecord = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: params.name.trim(),
    email: params.email.trim(),
    subject: (params.subject || "General Inquiry").trim().slice(0, 150),
    message: params.message.trim(),
    ipHash: params.ipHash,
    userAgent: (params.userAgent || "unknown").slice(0, 150),
    createdAt: new Date().toISOString(),
    status: "unread",
  };

  const updated = [...all, newMsg];
  await writeContactMessages(updated);
  return newMsg;
}

/**
 * Update the status of a contact message ('unread' | 'read' | 'handled').
 */
export async function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus
): Promise<ContactMessageRecord | null> {
  const all = await readContactMessages();
  const idx = all.findIndex((m) => m.id === id);
  if (idx === -1) return null;

  all[idx] = { ...all[idx], status };
  await writeContactMessages(all);
  return all[idx];
}

/**
 * Delete a contact message by ID.
 */
export async function deleteContactMessage(id: string): Promise<boolean> {
  const all = await readContactMessages();
  const filtered = all.filter((m) => m.id !== id);
  if (filtered.length === all.length) return false;

  await writeContactMessages(filtered);
  return true;
}

/**
 * Get count of unread messages for sidebar badge.
 */
export async function getUnreadMessagesCount(): Promise<number> {
  const all = await readContactMessages();
  return all.filter((m) => m.status === "unread").length;
}
