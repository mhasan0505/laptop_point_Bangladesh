"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SaveBar } from "@/components/admin/ui/SaveBar";
import { Textarea } from "@/components/ui/textarea";
import { useSetup } from "../setup-context";
import {
  type CommerceSettings,
  SETTINGS_GROUP_REGISTRY,
} from "@/lib/settings-base";

export default function PolicyPagesSetupPage() {
  const { canWrite, isDirty, setIsDirty, refreshSettings } = useSetup();
  const canEdit = canWrite("commerce");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [commerce, setCommerce] = useState<CommerceSettings>(
    SETTINGS_GROUP_REGISTRY.commerce.default
  );

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/setup?group=commerce");
      if (res.ok) {
        const data = await res.json();
        if (data.value) {
          setCommerce(data.value as CommerceSettings);
        }
      }
    } catch (err) {
      console.error("Error loading policy terms:", err);
    } finally {
      setLoading(false);
      setIsDirty(false);
    }
  }, [setIsDirty]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/admin/setup?group=commerce");
        if (res.ok && !ignore) {
          const data = await res.json();
          if (data.value) {
            setCommerce(data.value as CommerceSettings);
          }
        }
      } catch (err) {
        console.error("Error loading policy terms:", err);
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
          group: "commerce",
          value: commerce,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save policies");
      }

      setIsDirty(false);
      await refreshSettings();
      setStatusMessage("Policy terms saved successfully.");
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
        Loading policy content...
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto w-full space-y-8 pb-16">
      <PageHeader
        title="Policy Pages"
        description="Public policy content and terms rendered on customer-facing /emi and /warranty information pages."
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

      {/* SECTION 1: EMI TERMS */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">EMI Information & Terms</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rendered on the customer EMI policy page (/emi) and displayed under installment options
          </p>
        </div>

        <Textarea
          rows={6}
          value={commerce.emiTerms || ""}
          placeholder="Describe your bank EMI tenures, interest rates, eligibility criteria, and required paperwork..."
          onChange={(e) => {
            setCommerce({ ...commerce, emiTerms: e.target.value });
            setIsDirty(true);
          }}
          disabled={!canEdit}
          className="text-xs leading-relaxed"
        />
      </section>

      <div className="border-t border-border" />

      {/* SECTION 2: WARRANTY TERMS */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Warranty Policy Terms</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rendered on the official warranty page (/warranty) explaining coverage, claims, and inspection processes
          </p>
        </div>

        <Textarea
          rows={8}
          value={commerce.warrantyTerms || ""}
          placeholder="Describe physical inspection rules, manufacturer vs shop warranty terms, exclusions, and claim timeframes..."
          onChange={(e) => {
            setCommerce({ ...commerce, warrantyTerms: e.target.value });
            setIsDirty(true);
          }}
          disabled={!canEdit}
          className="text-xs leading-relaxed"
        />
      </section>

      <div className="border-t border-border" />

      {/* SECTION 3: PRIVACY POLICY */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Privacy Policy</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rendered on the customer privacy policy page (/privacy). Leave empty to use system default.
          </p>
        </div>

        <Textarea
          rows={8}
          value={commerce.privacyPolicy || ""}
          placeholder="Enter your customer data collection, use, and disclosure terms..."
          onChange={(e) => {
            setCommerce({ ...commerce, privacyPolicy: e.target.value });
            setIsDirty(true);
          }}
          disabled={!canEdit}
          className="text-xs leading-relaxed"
        />
      </section>

      <div className="border-t border-border" />

      {/* SECTION 4: TERMS OF SERVICE */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Terms of Service</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rendered on the customer terms of service page (/terms). Leave empty to use system default.
          </p>
        </div>

        <Textarea
          rows={8}
          value={commerce.termsOfService || ""}
          placeholder="Enter your website rules, purchase terms, and liability disclaimers..."
          onChange={(e) => {
            setCommerce({ ...commerce, termsOfService: e.target.value });
            setIsDirty(true);
          }}
          disabled={!canEdit}
          className="text-xs leading-relaxed"
        />
      </section>

      <div className="border-t border-border" />

      {/* SECTION 5: RETURNS & REFUND POLICY */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Returns & Refund Policy</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rendered on the customer returns and refund page (/returns). Leave empty to use system default.
          </p>
        </div>

        <Textarea
          rows={8}
          value={commerce.returnsPolicy || ""}
          placeholder="Describe your return period, condition eligibility, and refund timeline..."
          onChange={(e) => {
            setCommerce({ ...commerce, returnsPolicy: e.target.value });
            setIsDirty(true);
          }}
          disabled={!canEdit}
          className="text-xs leading-relaxed"
        />
      </section>

      <div className="border-t border-border" />

      {/* SECTION 6: SHIPPING INFORMATION */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Shipping Information</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rendered on the customer shipping information page (/shipping). Leave empty to use system default.
          </p>
        </div>

        <Textarea
          rows={8}
          value={commerce.shippingPolicy || ""}
          placeholder="Describe shipping methods, courier partners, dispatch timelines, and delivery areas..."
          onChange={(e) => {
            setCommerce({ ...commerce, shippingPolicy: e.target.value });
            setIsDirty(true);
          }}
          disabled={!canEdit}
          className="text-xs leading-relaxed"
        />
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
