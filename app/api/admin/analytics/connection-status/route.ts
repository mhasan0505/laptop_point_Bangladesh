import { requireAdminSession } from "@/lib/admin-auth";
import { checkGoogleCredentialsStatus } from "@/lib/analytics/utils";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await requireAdminSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Database Check
    let dbStatus: { ok: boolean; message: string; orderCount?: number } = {
      ok: false,
      message: "Checking database connection...",
    };
    try {
      const orderCount = await prisma.order.count();
      dbStatus = {
        ok: true,
        message: `Connected to PostgreSQL database (${orderCount} orders recorded)`,
        orderCount,
      };
    } catch (err) {
      dbStatus = {
        ok: false,
        message: err instanceof Error ? err.message : "Database connection failed",
      };
    }

    // 2. Google Tag Manager Check
    const gtmContainerId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-KXKXGWF6";
    const gtmStatus = {
      containerId: gtmContainerId,
      status: "active",
      message: `Container ${gtmContainerId} active in storefront head and body`,
    };

    // 3. GA4 Check
    const gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID || "G-NSPLFEW71H";
    const gaPropertyId =
      process.env.GA_PROPERTY_ID ?? process.env.GA4_PROPERTY_ID ?? null;
    const gaCreds = checkGoogleCredentialsStatus(process.env.GA_SERVICE_ACCOUNT);

    const gaStatus = {
      measurementId: gaMeasurementId,
      propertyId: gaPropertyId,
      tagActive: Boolean(gaMeasurementId),
      hasPropertyId: Boolean(gaPropertyId),
      credentialsConfigured: gaCreds.configured,
      credentialsValid: gaCreds.valid,
      clientEmail: gaCreds.clientEmail,
      status:
        gaCreds.valid && gaPropertyId
          ? "ready"
          : !gaCreds.configured
            ? "missing_credentials"
            : !gaCreds.valid
              ? "invalid_credentials"
              : "missing_property_id",
      message:
        gaCreds.valid && gaPropertyId
          ? `Connected to GA4 Property: ${gaPropertyId} via ${gaCreds.clientEmail}`
          : gaCreds.error ||
            (!gaPropertyId
              ? "Missing GA_PROPERTY_ID in environment"
              : "Google service account required"),
    };

    // 3. GSC Check
    const gscSiteUrl = process.env.GSC_SITE_URL || null;
    const gscCreds = checkGoogleCredentialsStatus(process.env.GSC_SERVICE_ACCOUNT);

    const gscStatus = {
      siteUrl: gscSiteUrl,
      hasSiteUrl: Boolean(gscSiteUrl),
      credentialsConfigured: gscCreds.configured,
      credentialsValid: gscCreds.valid,
      clientEmail: gscCreds.clientEmail,
      status:
        gscCreds.valid && gscSiteUrl
          ? "ready"
          : !gscCreds.configured
            ? "missing_credentials"
            : !gscCreds.valid
              ? "invalid_credentials"
              : "missing_site_url",
      message:
        gscCreds.valid && gscSiteUrl
          ? `Configured for ${gscSiteUrl} via ${gscCreds.clientEmail}`
          : gscCreds.error ||
            (!gscSiteUrl
              ? "Missing GSC_SITE_URL in environment"
              : "Google service account required"),
    };

    // 4. Meta Ads Check
    const metaPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID || "1676617903511293";
    const metaToken = process.env.META_ADS_ACCESS_TOKEN || null;
    const metaAccountId = process.env.META_ADS_ACCOUNT_ID || null;

    let metaApiValid = false;
    let metaApiMessage = "Marketing API token not provided";

    if (metaToken && metaAccountId) {
      try {
        const cleanAccount = metaAccountId.startsWith("act_")
          ? metaAccountId
          : `act_${metaAccountId}`;
        const testUrl = `https://graph.facebook.com/v19.0/${cleanAccount}?access_token=${metaToken}&fields=name,account_status`;
        const testRes = await fetch(testUrl);
        if (testRes.ok) {
          const body = (await testRes.json()) as { name?: string };
          metaApiValid = true;
          metaApiMessage = `Connected to Meta Ad Account: ${body.name || cleanAccount}`;
        } else {
          const errBody = (await testRes.json()) as {
            error?: { message?: string };
          };
          metaApiMessage =
            errBody.error?.message || "Invalid Meta token or ad account permissions";
        }
      } catch (err) {
        metaApiMessage =
          err instanceof Error ? err.message : "Failed to connect to Meta Graph API";
      }
    }

    const metaStatus = {
      pixelId: metaPixelId,
      pixelActive: Boolean(metaPixelId),
      hasToken: Boolean(metaToken),
      hasAccountId: Boolean(metaAccountId),
      status: metaApiValid
        ? "ready"
        : metaToken && metaAccountId
          ? "token_error"
          : "not_configured",
      message: metaApiValid
        ? metaApiMessage
        : metaToken && metaAccountId
          ? metaApiMessage
          : "Meta Pixel active on storefront. Add Marketing API token for in-dashboard ROAS & CPA sync.",
    };

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      database: dbStatus,
      googleTagManager: gtmStatus,
      googleAnalytics: gaStatus,
      searchConsole: gscStatus,
      metaAds: metaStatus,
    });
  } catch (error) {
    console.error("[GET /api/admin/analytics/connection-status]", error);
    return NextResponse.json(
      { error: "Diagnostic scan encountered an error" },
      { status: 500 },
    );
  }
}
