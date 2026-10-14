import { NextRequest, NextResponse } from "next/server";
import {
  getSettingsWithRecovery,
  saveSettings,
  SETTINGS_GROUP_REGISTRY,
  type SettingsGroupKey,
} from "@/lib/settings";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group") as SettingsGroupKey | null;

    if (group && group in SETTINGS_GROUP_REGISTRY) {
      const result = await getSettingsWithRecovery(group);
      return NextResponse.json({
        group,
        value: result.data,
        warnings: result.warnings,
      });
    }

    // Return all groups for setup context
    const allSettings: Record<string, unknown> = {};
    const allWarnings: unknown[] = [];

    const keys = Object.keys(SETTINGS_GROUP_REGISTRY) as SettingsGroupKey[];
    for (const key of keys) {
      const res = await getSettingsWithRecovery(key);
      allSettings[key] = res.data;
      if (res.warnings && res.warnings.length > 0) {
        allWarnings.push(...res.warnings);
      }
    }

    return NextResponse.json({
      userRole: auth.user.role,
      settings: allSettings,
      warnings: allWarnings,
    });
  } catch (err) {
    console.error("[api/admin/setup GET] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager"] });
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const group = body.group as SettingsGroupKey;
    const value = body.value;

    if (!group || !(group in SETTINGS_GROUP_REGISTRY)) {
      return NextResponse.json(
        { error: `Invalid settings group "${group}"` },
        { status: 400 }
      );
    }

    const saved = await saveSettings(group, value);
    return NextResponse.json({
      ok: true,
      group,
      value: saved,
    });
  } catch (err) {
    console.error("[api/admin/setup POST] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save settings" },
      { status: 500 }
    );
  }
}
