import { NextResponse } from "next/server";
import { getAdminSession, type AdminRole } from "@/lib/admin-auth";
import { getAdminUsers, type AdminUserRecord } from "@/lib/admin-users-storage";

export type { AdminRole };

export interface AuthAdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface RequireAdminOptions {
  roles?: AdminRole[];
}

export type RequireAdminResult =
  | { user: AuthAdminUser; error: null }
  | { user: null; error: NextResponse };

interface CachedUserEntry {
  user: AdminUserRecord | null;
  fetchedAt: number;
}

const userCache = new Map<string, CachedUserEntry>();
const CACHE_TTL_MS = 30 * 1000; // <= 30s in-memory freshness cache

/** Invalidate cache for a specific user (or all users) on account modification */
export function invalidateUserCache(userId?: string) {
  if (userId) {
    userCache.delete(userId);
  } else {
    userCache.clear();
  }
}

export async function requireAdmin(
  request: Request,
  options?: RequireAdminOptions
): Promise<RequireAdminResult> {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return {
        user: null,
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    let resolvedRole: AdminRole = session.role;
    let resolvedEmail: string = session.email;
    let resolvedName: string = session.name;

    // For any non-owner staff session, verify freshness against storage (cached <= 30s)
    if (session.userId !== "usr-owner-1") {
      const now = Date.now();
      const cached = userCache.get(session.userId);
      let storedUser: AdminUserRecord | null = null;

      if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
        storedUser = cached.user;
      } else {
        const allUsers = await getAdminUsers();
        storedUser = allUsers.find((u) => u.id === session.userId) || null;
        userCache.set(session.userId, { user: storedUser, fetchedAt: now });
      }

      // Reject if user was deleted or deactivated
      if (!storedUser || !storedUser.active) {
        return {
          user: null,
          error: NextResponse.json(
            { error: "Unauthorized: account deactivated or removed" },
            { status: 401 }
          ),
        };
      }

      // Authoritative stored role overrides whatever was in the signed cookie
      resolvedRole = storedUser.role;
      resolvedEmail = storedUser.email;
      resolvedName = storedUser.name;
    }

    const user: AuthAdminUser = {
      id: session.userId,
      email: resolvedEmail,
      name: resolvedName,
      role: resolvedRole,
    };

    if (options?.roles && options.roles.length > 0) {
      if (!options.roles.includes(user.role)) {
        return {
          user: null,
          error: NextResponse.json(
            { error: `Forbidden: requires role ${options.roles.join(" or ")}` },
            { status: 403 }
          ),
        };
      }
    }

    return { user, error: null };
  } catch (error) {
    console.error("Authentication error in requireAdmin:", error);
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
}
