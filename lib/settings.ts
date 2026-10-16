import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Re-export all client-safe schemas, types, defaults, and permission logic
export * from "./settings-base";

import {
  SETTINGS_GROUP_REGISTRY,
  type SettingsGroupKey,
  type FieldRecoveryWarning,
  latestRecoveryWarnings,
  recoverFields,
} from "./settings-base";

const settingsFilePath = path.join(process.cwd(), "app", "data", "settings.json");
let inMemorySettingsCache: Record<string, unknown> | null = null;

export function resetSettingsCache(): void {
  inMemorySettingsCache = null;
}

async function loadAllSettingsFile(): Promise<Record<string, unknown>> {
  if (inMemorySettingsCache) return inMemorySettingsCache;

  const merged: Record<string, unknown> = {};

  // 1. Load baseline from local JSON file if available
  try {
    const raw = await fs.readFile(settingsFilePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      Object.assign(merged, parsed);
    }
  } catch {
    // File not created yet or not present
  }

  // 2. Query DB overrides (authoritative source of truth for production/serverless)
  try {
    const records = await prisma.productOverride.findMany({
      where: { sku: { startsWith: "setting:" }, isDeleted: false },
    });
    for (const rec of records) {
      const group = rec.sku.replace("setting:", "");
      if (rec.data) {
        merged[group] = rec.data;
      }
    }
  } catch (dbErr) {
    console.warn("[loadAllSettingsFile] DB settings fetch warning:", dbErr);
  }

  inMemorySettingsCache = merged;
  return inMemorySettingsCache;
}

async function persistAllSettingsFile(data: Record<string, unknown>): Promise<void> {
  inMemorySettingsCache = data;

  try {
    await fs.mkdir(path.dirname(settingsFilePath), { recursive: true });
    await fs.writeFile(settingsFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Read-only filesystem in serverless
  }
}

// ─── getSettings (Cached & Safe Fallback with Field-Level Recovery) ─────────

export async function getSettingsWithRecovery<K extends SettingsGroupKey>(
  group: K
): Promise<{
  data: z.infer<(typeof SETTINGS_GROUP_REGISTRY)[K]["schema"]>;
  warnings: FieldRecoveryWarning[];
}> {
  const meta = SETTINGS_GROUP_REGISTRY[group];
  try {
    const all = await loadAllSettingsFile();
    let rawValue = all[group];

    // If not in cache, check individual PostgreSQL ProductOverride
    if (!rawValue) {
      try {
        const rec = await prisma.productOverride.findUnique({
          where: { sku: `setting:${group}` },
        });
        if (rec && rec.data) {
          rawValue = rec.data;
          all[group] = rec.data;
        }
      } catch {
        // DB fallback
      }
    }

    if (!rawValue) {
      latestRecoveryWarnings.delete(group);
      return {
        data: meta.default as z.infer<(typeof SETTINGS_GROUP_REGISTRY)[K]["schema"]>,
        warnings: [],
      };
    }

    const parsed = meta.schema.safeParse(rawValue);
    if (parsed.success) {
      latestRecoveryWarnings.delete(group);
      return {
        data: parsed.data as z.infer<(typeof SETTINGS_GROUP_REGISTRY)[K]["schema"]>,
        warnings: [],
      };
    }

    // Schema validation failed: Perform Field-Level Recovery
    const issues = parsed.error.issues;
    const warnings: FieldRecoveryWarning[] = issues.map((issue) => ({
      group,
      path: issue.path.join("."),
      message: issue.message,
    }));

    latestRecoveryWarnings.set(group, warnings);

    // Deep merge raw record with default fallback, preserving valid fields
    const recovered = recoverFields(meta.default, rawValue, issues);
    const rechecked = meta.schema.safeParse(recovered);
    if (rechecked.success) {
      return {
        data: rechecked.data as z.infer<(typeof SETTINGS_GROUP_REGISTRY)[K]["schema"]>,
        warnings,
      };
    }

    return {
      data: meta.default as z.infer<(typeof SETTINGS_GROUP_REGISTRY)[K]["schema"]>,
      warnings,
    };
  } catch (err) {
    console.warn(`[getSettings] Access failed for group "${group}". Using defaults:`, err);
    return {
      data: meta.default as z.infer<(typeof SETTINGS_GROUP_REGISTRY)[K]["schema"]>,
      warnings: [],
    };
  }
}

/**
 * Retrieves setting group from database with fallback to defaults and field-level recovery.
 */
export async function getSettings<K extends SettingsGroupKey>(
  group: K
): Promise<z.infer<(typeof SETTINGS_GROUP_REGISTRY)[K]["schema"]>> {
  const result = await getSettingsWithRecovery(group);
  return result.data;
}

/**
 * True when an admin has explicitly saved this group (as opposed to the code
 * defaults being served). Lets the storefront keep its own copy until the
 * admin takes ownership of the content.
 */
export async function hasSavedSettings(group: SettingsGroupKey): Promise<boolean> {
  try {
    const all = await loadAllSettingsFile();
    if (all[group]) return true;
    const rec = await prisma.productOverride.findUnique({
      where: { sku: `setting:${group}` },
    });
    return Boolean(rec?.data);
  } catch {
    return false;
  }
}

// ─── saveSettings ─────────────────────────────────────────────────────────

/**
 * Validates, writes to database/file, and revalidates cache paths.
 */
export async function saveSettings<K extends SettingsGroupKey>(
  group: K,
  payload: unknown,
  userId?: string
): Promise<z.infer<(typeof SETTINGS_GROUP_REGISTRY)[K]["schema"]>> {
  const meta = SETTINGS_GROUP_REGISTRY[group];
  const validated = meta.schema.parse(payload);

  const all = await loadAllSettingsFile();
  all[group] = validated;
  await persistAllSettingsFile(all);

  try {
    await prisma.productOverride.upsert({
      where: { sku: `setting:${group}` },
      create: {
        id: `setting:${group}`,
        sku: `setting:${group}`,
        data: validated as any,
      },
      update: {
        data: validated as any,
      },
    });
  } catch {
    // Ignore db fallback error
  }

  // Clear any past recovery warnings once cleanly saved
  latestRecoveryWarnings.delete(group);

  // Revalidate cache paths
  try {
    revalidatePath("/", "layout");
    revalidatePath("/delivery");
    revalidatePath("/emi");
    revalidatePath("/warranty");
    revalidatePath("/robots.txt");
  } catch {
    // In test / CLI environments, revalidatePath is a no-op
  }

  return validated as z.infer<(typeof SETTINGS_GROUP_REGISTRY)[K]["schema"]>;
}
