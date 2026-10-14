"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SaveBar } from "@/components/admin/ui/SaveBar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSetup } from "../setup-context";
import {
  type SeoSettings,
  SETTINGS_GROUP_REGISTRY,
} from "@/lib/settings-base";

export default function SeoSetupPage() {
  const { canWrite, isDirty, setIsDirty, refreshSettings } = useSetup();
  const canEdit = canWrite("seo");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [seo, setSeo] = useState<SeoSettings>(
    SETTINGS_GROUP_REGISTRY.seo.default
  );

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/setup?group=seo");
      if (res.ok) {
        const data = await res.json();
        if (data.value) {
          setSeo(data.value as SeoSettings);
        }
      }
    } catch (err) {
      console.error("Error loading SEO settings:", err);
    } finally {
      setLoading(false);
      setIsDirty(false);
    }
  }, [setIsDirty]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/admin/setup?group=seo");
        if (res.ok && !ignore) {
          const data = await res.json();
          if (data.value) {
            setSeo(data.value as SeoSettings);
          }
        }
      } catch (err) {
        console.error("Error loading SEO settings:", err);
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

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: "seo",
          value: seo,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save SEO settings");
      }

      setIsDirty(false);
      await refreshSettings();
      setStatusMessage("SEO metadata saved successfully.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-foreground text-sm">
        Loading SEO configuration...
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto w-full space-y-8 pb-16">
      <PageHeader
        title="SEO & Metadata"
        description="Search engine indexing defaults, title templates, and webmaster verification tokens."
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

      {/* SECTION 1: TITLE & META DESCRIPTION */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Page Titles & Description</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Default titles and snippets displayed on Google and social search previews
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground">Default Store Title</label>
            <Input
              value={seo.defaultTitle || ""}
              placeholder="e.g. Laptop Point BD | Premium Laptops in Bangladesh"
              onChange={(e) => {
                setSeo({ ...seo, defaultTitle: e.target.value });
                setIsDirty(true);
              }}
              className="mt-1"
              disabled={!canEdit}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Title Format Template</label>
            <Input
              value={seo.titleTemplate || ""}
              placeholder="%s | Laptop Point BD"
              onChange={(e) => {
                setSeo({ ...seo, titleTemplate: e.target.value });
                setIsDirty(true);
              }}
              className="mt-1 font-mono text-xs"
              disabled={!canEdit}
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Use <code className="text-foreground font-mono">%s</code> as the placeholder for dynamic page and product titles.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Default Meta Description</label>
            <Textarea
              rows={4}
              value={seo.defaultDescription || ""}
              placeholder="Store overview snippet displayed when a specific page has no custom meta description..."
              onChange={(e) => {
                setSeo({ ...seo, defaultDescription: e.target.value });
                setIsDirty(true);
              }}
              className="mt-1 text-xs leading-relaxed"
              disabled={!canEdit}
            />
          </div>
        </div>
      </section>

      <div className="border-t border-border" />

      {/* SECTION 2: WEBMASTER SITE VERIFICATION */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Search Engine Verification</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Site ownership verification meta tags
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-foreground">Google Search Console</label>
            <Input
              value={seo.googleVerification || ""}
              placeholder="google-site-verification token"
              onChange={(e) => {
                setSeo({ ...seo, googleVerification: e.target.value });
                setIsDirty(true);
              }}
              className="mt-1 font-mono text-xs"
              disabled={!canEdit}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Bing Webmaster Tools</label>
            <Input
              value={seo.bingVerification || ""}
              placeholder="msvalidate.01 token"
              onChange={(e) => {
                setSeo({ ...seo, bingVerification: e.target.value });
                setIsDirty(true);
              }}
              className="mt-1 font-mono text-xs"
              disabled={!canEdit}
            />
          </div>
        </div>
      </section>

      {/* SAVE BAR */}
      {canEdit && (
        <SaveBar
          open={isDirty}
          onSave={handleSave}
          onDiscard={() => {
            loadData();
          }}
          isSaving={saving}
        />
      )}
    </div>
  );
}
