import { requireAdminSession } from "@/lib/admin-auth";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      gtmContainerId,
      gaMeasurementId,
      gaPropertyId,
      googleServiceAccountJson,
      gscSiteUrl,
      metaPixelId,
      metaAccessToken,
      metaAccountId,
    } = body;

    const envPath = path.resolve(process.cwd(), ".env.local");
    let envContent = "";

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    }

    const updates: Record<string, string | undefined> = {};

    if (typeof gtmContainerId === "string" && gtmContainerId.trim()) {
      updates["NEXT_PUBLIC_GTM_ID"] = gtmContainerId.trim();
    }
    if (typeof gaMeasurementId === "string" && gaMeasurementId.trim()) {
      updates["NEXT_PUBLIC_GA_ID"] = gaMeasurementId.trim();
    }
    if (typeof gaPropertyId === "string" && gaPropertyId.trim()) {
      updates["GA_PROPERTY_ID"] = gaPropertyId.trim();
    }
    if (typeof gscSiteUrl === "string" && gscSiteUrl.trim()) {
      updates["GSC_SITE_URL"] = gscSiteUrl.trim();
    }
    if (typeof metaPixelId === "string" && metaPixelId.trim()) {
      updates["NEXT_PUBLIC_FB_PIXEL_ID"] = metaPixelId.trim();
    }
    if (typeof metaAccessToken === "string") {
      updates["META_ADS_ACCESS_TOKEN"] = metaAccessToken.trim();
    }
    if (typeof metaAccountId === "string") {
      updates["META_ADS_ACCOUNT_ID"] = metaAccountId.trim();
    }

    // Handle Google service account JSON
    if (typeof googleServiceAccountJson === "string" && googleServiceAccountJson.trim()) {
      const trimmed = googleServiceAccountJson.trim();
      if (trimmed.startsWith("{")) {
        // Validate JSON
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed.client_email && parsed.private_key) {
            // Write to google-credential.json for stability & standard SDK consumption
            const credPath = path.resolve(process.cwd(), "google-credential.json");
            fs.writeFileSync(credPath, JSON.stringify(parsed, null, 2), "utf8");
            updates["GOOGLE_APPLICATION_CREDENTIALS"] = "google-credential.json";
          }
        } catch {
          return NextResponse.json(
            { error: "Invalid Google Service Account JSON provided" },
            { status: 400 },
          );
        }
      }
    }

    // Apply updates to env content
    let newEnvContent = envContent;
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) continue;
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(newEnvContent)) {
        newEnvContent = newEnvContent.replace(regex, `${key}=${value}`);
      } else {
        newEnvContent += `\n${key}=${value}`;
      }
      process.env[key] = value;
    }

    fs.writeFileSync(envPath, newEnvContent.trim() + "\n", "utf8");

    return NextResponse.json({
      success: true,
      message: "Credentials updated and applied successfully",
      updatedKeys: Object.keys(updates),
    });
  } catch (error) {
    console.error("[POST /api/admin/analytics/update-credentials]", error);
    return NextResponse.json(
      { error: "Failed to update credentials" },
      { status: 500 },
    );
  }
}
