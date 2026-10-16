import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  role: "owner" | "manager" | "marketing" | "support";
  passwordHash?: string;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!storedHash) return false;
  const parts = storedHash.split(":");
  if (parts.length !== 2) {
    // Constant-time legacy plaintext compare via fixed-length SHA-256 digests
    try {
      const hashProvided = crypto.createHash("sha256").update(password).digest();
      const hashStored = crypto.createHash("sha256").update(storedHash).digest();
      return crypto.timingSafeEqual(hashProvided, hashStored);
    } catch {
      return false;
    }
  }
  const [salt, hash] = parts;
  try {
    const verifyHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(verifyHash, "hex"));
  } catch {
    return false;
  }
}

const adminUsersFilePath = path.join(process.cwd(), "app", "data", "admin-users.json");
let inMemoryUsers: AdminUserRecord[] | null = null;

export function resetAdminUsersCache(): void {
  inMemoryUsers = null;
}

function getDefaultOwner(): AdminUserRecord {
  const email = process.env.ADMIN_EMAIL || "admin@laptoppointbd.com";
  return {
    id: "usr-owner-1",
    email,
    name: "Primary Store Owner",
    role: "owner",
    active: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
  const tmp = `${filePath}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tmp, filePath);
}

export async function readAdminUsers(): Promise<AdminUserRecord[]> {
  if (inMemoryUsers) return inMemoryUsers;

  // 1. Try DB ProductOverride FIRST (authoritative in production/serverless)
  try {
    const record = await prisma.productOverride.findUnique({
      where: { sku: "system:admin_users" },
    });
    if (record && record.data && Array.isArray(record.data) && record.data.length > 0) {
      inMemoryUsers = record.data as unknown as AdminUserRecord[];
      return inMemoryUsers;
    }
  } catch (dbErr) {
    console.warn("[readAdminUsers] DB fetch warning:", dbErr);
  }

  // 2. Try file fallback
  try {
    const raw = await fs.readFile(adminUsersFilePath, "utf-8");
    if (raw && raw.trim().length > 0) {
      const parsed = JSON.parse(raw) as AdminUserRecord[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryUsers = parsed;
        return inMemoryUsers;
      }
    }
  } catch {
    // File not created yet or invalid JSON
  }

  // 3. Fallback to default owner
  inMemoryUsers = [getDefaultOwner()];
  await writeAdminUsers(inMemoryUsers).catch(() => {});
  return inMemoryUsers;
}

export async function writeAdminUsers(users: AdminUserRecord[]): Promise<void> {
  inMemoryUsers = users;

  // 1. Persist to PostgreSQL (source of truth for serverless instances)
  try {
    await prisma.productOverride.upsert({
      where: { sku: "system:admin_users" },
      create: {
        id: "system:admin_users",
        sku: "system:admin_users",
        data: users as any,
      },
      update: {
        data: users as any,
        isDeleted: false,
      },
    });
  } catch (dbErr) {
    console.error("[writeAdminUsers] DB persist failed:", dbErr);
  }

  // 2. Best-effort write to local file for dev (catches EROFS)
  try {
    await fs.mkdir(path.dirname(adminUsersFilePath), { recursive: true });
    await writeJsonAtomic(adminUsersFilePath, users);
  } catch {
    try {
      await fs.writeFile(adminUsersFilePath, JSON.stringify(users, null, 2), "utf-8");
    } catch {
      // Read-only filesystem in serverless
    }
  }
}

let migrationRan = false;

/**
 * One-time migration that scans all users and upgrades any legacy non-salt:hash
 * plaintext passwords to scrypt hashes. Runs lazily on first getAdminUsers().
 */
export async function migratePlaintextPasswords(): Promise<number> {
  const users = await readAdminUsers();
  let migratedCount = 0;
  for (const user of users) {
    if (user.passwordHash && !user.passwordHash.includes(":")) {
      user.passwordHash = hashPassword(user.passwordHash);
      user.updatedAt = new Date().toISOString();
      migratedCount++;
    }
  }
  if (migratedCount > 0) {
    await writeAdminUsers(users);
  }
  migrationRan = true;
  return migratedCount;
}

export async function getAdminUsers(): Promise<AdminUserRecord[]> {
  if (!migrationRan) {
    await migratePlaintextPasswords().catch(() => {});
  }
  return await readAdminUsers();
}

export async function createAdminUser(data: {
  name: string;
  email: string;
  role: "owner" | "manager" | "marketing" | "support";
  password?: string;
}): Promise<AdminUserRecord> {
  const users = await readAdminUsers();
  const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
  if (existing) {
    throw new Error(`User with email "${data.email}" already exists.`);
  }

  const now = new Date().toISOString();
  const newUser: AdminUserRecord = {
    id: `usr-${Date.now()}`,
    name: data.name,
    email: data.email.toLowerCase().trim(),
    role: data.role,
    passwordHash: data.password ? hashPassword(data.password) : undefined,
    active: true,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
  };

  users.push(newUser);
  await writeAdminUsers(users);
  return newUser;
}

export async function updateAdminUser(
  id: string,
  updates: Partial<Pick<AdminUserRecord, "role" | "active" | "name">> & { password?: string }
): Promise<AdminUserRecord> {
  const users = await readAdminUsers();
  const user = users.find((u) => u.id === id);
  if (!user) {
    throw new Error("User not found");
  }

  if (updates.role !== undefined) user.role = updates.role;
  if (updates.active !== undefined) user.active = updates.active;
  if (updates.name !== undefined) user.name = updates.name;
  if (updates.password) user.passwordHash = hashPassword(updates.password);
  user.updatedAt = new Date().toISOString();

  await writeAdminUsers(users);
  return user;
}

export async function recordLogin(id: string): Promise<void> {
  const users = await readAdminUsers();
  const user = users.find((u) => u.id === id);
  if (user) {
    user.lastLoginAt = new Date().toISOString();
    await writeAdminUsers(users);
  }
}

export async function deleteAdminUser(id: string): Promise<boolean> {
  const users = await readAdminUsers();
  const user = users.find((u) => u.id === id);
  if (user && user.role === "owner" && users.filter((u) => u.role === "owner").length <= 1) {
    throw new Error("Cannot delete the only owner account.");
  }

  const initialLen = users.length;
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length !== initialLen) {
    await writeAdminUsers(filtered);
    return true;
  }
  return false;
}
