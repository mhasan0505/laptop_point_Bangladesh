"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SaveBar } from "@/components/admin/ui/SaveBar";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { useSetup } from "../setup-context";
import {
  type TrackingSettings,
  SETTINGS_GROUP_REGISTRY,
} from "@/lib/settings-base";

interface CredentialItem {
  provider: string;
  label: string;
  isConfigured: boolean;
  preview: string;
}

export default function IntegrationsSetupPage() {
  const { userRole, canWrite, isDirty, setIsDirty, refreshSettings } = useSetup();
  const canEditTracking = canWrite("tracking");
  const isOwner = userRole === "owner";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [tracking, setTracking] = useState<TrackingSettings>(
    SETTINGS_GROUP_REGISTRY.tracking.default
  );
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);

  // Credential Sheet state
  const [credSheetOpen, setCredSheetOpen] = useState(false);
  const [activeCred, setActiveCred] = useState<CredentialItem | null>(null);
  const [credSecretPayload, setCredSecretPayload] = useState("");
  const [savingCred, setSavingCred] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [trackRes, credsRes] = await Promise.all([
        fetch("/api/admin/setup?group=tracking"),
        fetch("/api/admin/setup/credentials"),
      ]);

      if (trackRes.ok) {
        const data = await trackRes.json();
        if (data.value) {
          setTracking(data.value as TrackingSettings);
        }
      }

      if (credsRes.ok) {
        const data = await credsRes.json();
        setCredentials(data.credentials || []);
      }
    } catch (err) {
      console.error("Error loading integrations:", err);
    } finally {
      setLoading(false);
      setIsDirty(false);
    }
  }, [setIsDirty]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [trackRes, credsRes] = await Promise.all([
          fetch("/api/admin/setup?group=tracking"),
          fetch("/api/admin/setup/credentials"),
        ]);

        if (trackRes.ok && !ignore) {
          const data = await trackRes.json();
          if (data.value) {
            setTracking(data.value as TrackingSettings);
          }
        }

        if (credsRes.ok && !ignore) {
          const data = await credsRes.json();
          setCredentials(data.credentials || []);
        }
      } catch (err) {
        console.error("Error loading integrations:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
          setIsDirty(false);
        }
      }
    }
    void init();
    return () => {
      ignore = true;
    };
  }, [setIsDirty]);

  const handleSaveTracking = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: "tracking",
          value: tracking,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save tracking settings");
      }

      setIsDirty(false);
      await refreshSettings();
      setStatusMessage("Tracking IDs saved successfully.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditCred = (cred: CredentialItem) => {
    setActiveCred(cred);
    setCredSecretPayload("");
    setCredSheetOpen(true);
  };

  const handleSaveCredential = async () => {
    if (!activeCred || !credSecretPayload.trim()) return;
    setSavingCred(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/setup/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: activeCred.provider,
          payload: credSecretPayload,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save connected account secret");
      }

      setCredSheetOpen(false);
      setActiveCred(null);
      setCredSecretPayload("");
      await loadData();
      await refreshSettings();
      setStatusMessage(`Account key for ${activeCred.label} saved securely.`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Credential save failed";
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setSavingCred(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-foreground text-sm">
        Loading integration settings...
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto w-full space-y-8 pb-16">
      <PageHeader
        title="Tracking & Integrations"
        description="Connect marketing analytics, pixels, and server integrations."
      />

      {statusMessage && (
        <div
          className={`p-3 text-xs rounded-lg ${
            statusMessage.startsWith("Error")
              ? "bg-destructive/10 text-destructive border border-destructive/20"
              : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* SECTION 1: WEB ANALYTICS & PIXEL IDS */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Web Analytics & Tracking IDs</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Client-side tracking measurement identifiers
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground">Google Analytics 4 Measurement ID</label>
            <Input
              value={tracking.ga4MeasurementId || ""}
              placeholder="G-XXXXXXXXXX"
              onChange={(e) => {
                setTracking({ ...tracking, ga4MeasurementId: e.target.value.trim() });
                setIsDirty(true);
              }}
              className="mt-1 font-mono text-xs"
              disabled={!canEditTracking}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Meta Pixel ID</label>
            <Input
              value={tracking.metaPixelId || ""}
              placeholder="e.g. 123456789012345"
              onChange={(e) => {
                setTracking({ ...tracking, metaPixelId: e.target.value.trim() });
                setIsDirty(true);
              }}
              className="mt-1 font-mono text-xs"
              disabled={!canEditTracking}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Google Tag Manager Container ID</label>
            <Input
              value={tracking.gtmId || ""}
              placeholder="GTM-XXXXXXX"
              onChange={(e) => {
                setTracking({ ...tracking, gtmId: e.target.value.trim() });
                setIsDirty(true);
              }}
              className="mt-1 font-mono text-xs"
              disabled={!canEditTracking}
            />
          </div>
        </div>
      </section>

      <div className="border-t border-border" />

      {/* SECTION 2: CONNECTED ACCOUNTS (REWRITTEN & DEDUPED) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Connected accounts</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Backend service integrations for automated catalog sync and server-side marketing APIs
          </p>
        </div>

        {!isOwner ? (
          <div className="p-4 rounded-lg bg-card border border-border text-xs text-muted-foreground">
            Access to connected account credentials requires the store Owner role.
          </div>
        ) : (
          <div className="space-y-3">
            {credentials.map((cred) => (
              <div
                key={cred.provider}
                className="p-3.5 rounded-lg bg-card border border-border flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{cred.label}</span>
                    <StatusBadge status={cred.isConfigured ? "active" : "draft"} />
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">
                    {cred.preview}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEditCred(cred)}
                >
                  {cred.isConfigured ? "Update Secret" : "Connect"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CREDENTIAL EDIT SHEET */}
      <Sheet open={credSheetOpen} onOpenChange={setCredSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Configure {activeCred?.label}</SheetTitle>
            <SheetDescription>
              Enter the API access token or service account JSON. Secrets are encrypted and never shown in plain text.
            </SheetDescription>
          </SheetHeader>

          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground">Credential Payload</label>
              <Textarea
                rows={6}
                value={credSecretPayload}
                placeholder="Paste service account JSON or API access token here..."
                onChange={(e) => setCredSecretPayload(e.target.value)}
                className="mt-1 font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                This replaces any existing key securely.
              </p>
            </div>
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCredSheetOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveCredential}
              disabled={savingCred || !credSecretPayload.trim()}
            >
              {savingCred ? "Encrypting..." : "Save Credential"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* SAVE BAR FOR TRACKING */}
      {canEditTracking && (
        <SaveBar
          open={isDirty}
          onSave={handleSaveTracking}
          onDiscard={() => {
            loadData();
          }}
          isSaving={saving}
        />
      )}
    </div>
  );
}
