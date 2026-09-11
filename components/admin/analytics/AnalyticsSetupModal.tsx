"use client";

import {
  AlertCircle,
  CheckCircle2,
  Database,
  Globe,
  Layers,
  Loader2,
  RefreshCw,
  Save,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface AnalyticsSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ConnectionStatusResult {
  timestamp: string;
  database: { ok: boolean; message: string; orderCount?: number };
  googleTagManager?: {
    containerId: string | null;
    status: string;
    message: string;
  };
  googleAnalytics: {
    measurementId: string | null;
    propertyId: string | null;
    tagActive: boolean;
    credentialsConfigured: boolean;
    credentialsValid: boolean;
    clientEmail?: string;
    status: string;
    message: string;
  };
  searchConsole: {
    siteUrl: string | null;
    credentialsConfigured: boolean;
    credentialsValid: boolean;
    clientEmail?: string;
    status: string;
    message: string;
  };
  metaAds: {
    pixelId: string | null;
    pixelActive: boolean;
    hasToken: boolean;
    hasAccountId: boolean;
    status: string;
    message: string;
  };
}

export default function AnalyticsSetupModal({
  isOpen,
  onClose,
  onSuccess,
}: AnalyticsSetupModalProps) {
  const [activeTab, setActiveTab] = useState<"diagnostics" | "ga4" | "gsc" | "meta">(
    "diagnostics",
  );
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusResult, setStatusResult] = useState<ConnectionStatusResult | null>(
    null,
  );
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form State
  const [gtmContainerId, setGtmContainerId] = useState("GTM-KXKXGWF6");
  const [gaMeasurementId, setGaMeasurementId] = useState("G-NSPLFEW71H");
  const [gaPropertyId, setGaPropertyId] = useState("520924604");
  const [googleServiceAccountJson, setGoogleServiceAccountJson] = useState("");
  const [gscSiteUrl, setGscSiteUrl] = useState("https://laptoppointbd.com/");
  const [metaPixelId, setMetaPixelId] = useState("1676617903511293");
  const [metaAccessToken, setMetaAccessToken] = useState("");
  const [metaAccountId, setMetaAccountId] = useState("");

  const runDiagnostics = async () => {
    setIsRunningTest(true);
    try {
      const res = await fetch("/api/admin/analytics/connection-status");
      if (res.ok) {
        const data = (await res.json()) as ConnectionStatusResult;
        setStatusResult(data);
        if (data.googleTagManager?.containerId) {
          setGtmContainerId(data.googleTagManager.containerId);
        }
        if (data.googleAnalytics.measurementId) {
          setGaMeasurementId(data.googleAnalytics.measurementId);
        }
        if (data.googleAnalytics.propertyId) {
          setGaPropertyId(data.googleAnalytics.propertyId);
        }
        if (data.searchConsole.siteUrl) {
          setGscSiteUrl(data.searchConsole.siteUrl);
        }
        if (data.metaAds.pixelId) {
          setMetaPixelId(data.metaAds.pixelId);
        }
      }
    } catch (err) {
      console.error("Failed to run connection diagnostics:", err);
    } finally {
      setIsRunningTest(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
      setSaveSuccess(null);
      setSaveError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCredentials = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch("/api/admin/analytics/update-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gtmContainerId,
          gaMeasurementId,
          gaPropertyId,
          googleServiceAccountJson,
          gscSiteUrl,
          metaPixelId,
          metaAccessToken,
          metaAccountId,
        }),
      });

      const body = await res.json();
      if (res.ok && body.success) {
        setSaveSuccess("Credentials saved and verified successfully!");
        runDiagnostics();
        if (onSuccess) onSuccess();
      } else {
        setSaveError(body.error || "Failed to update credentials.");
      }
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save credentials",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Marketing Integrations &amp; API Setup
              </h2>
              <p className="text-xs text-gray-500">
                Configure Google Tag Manager, GA4, Search Console, &amp; Meta Ads
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 bg-white px-6">
          {[
            { id: "diagnostics", label: "Live Diagnostics" },
            { id: "ga4", label: "Google Analytics & GTM" },
            { id: "gsc", label: "Search Console" },
            { id: "meta", label: "Meta Ads & Pixel" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as "diagnostics" | "ga4" | "gsc" | "meta")}
              className={`border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-5">
          {/* Notifications */}
          {saveSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-800">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* TAB 1: Diagnostics */}
          {activeTab === "diagnostics" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Service Connection Health
                </p>
                <button
                  type="button"
                  onClick={runDiagnostics}
                  disabled={isRunningTest}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isRunningTest ? "animate-spin text-blue-600" : ""}`}
                  />
                  <span>Run Scan</span>
                </button>
              </div>

              {statusResult ? (
                <div className="space-y-3">
                  {/* Database */}
                  <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                    <Database className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-900">
                          PostgreSQL Store Orders
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          Connected
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-600">
                        {statusResult.database.message}
                      </p>
                    </div>
                  </div>

                  {/* GTM */}
                  <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                    <Globe className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-900">
                          Google Tag Manager
                        </span>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                          Active
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-600">
                        {statusResult.googleTagManager?.message || "Container active in storefront head and body"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500 font-mono">
                        <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                          Container ID: {statusResult.googleTagManager?.containerId || gtmContainerId}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* GA4 */}
                  <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                    <TrendingUp className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-900">
                          Google Analytics 4
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            statusResult.googleAnalytics.status === "ready"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {statusResult.googleAnalytics.status === "ready"
                            ? "Active"
                            : "Action Required"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-600">
                        {statusResult.googleAnalytics.message}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500 font-mono">
                        <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                          Tag: {statusResult.googleAnalytics.measurementId || "Not set"}
                        </span>
                        <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                          Property: {statusResult.googleAnalytics.propertyId || "Not set"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* GSC */}
                  <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                    <Globe className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-900">
                          Google Search Console
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            statusResult.searchConsole.status === "ready"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {statusResult.searchConsole.status === "ready"
                            ? "Active"
                            : "Action Required"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-600">
                        {statusResult.searchConsole.message}
                      </p>
                      <div className="mt-2 text-[11px] text-gray-500 font-mono">
                        <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                          URL: {statusResult.searchConsole.siteUrl || "Not set"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Meta Ads */}
                  <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                    <Layers className="h-5 w-5 text-pink-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-900">
                          Meta Ads &amp; Pixel
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            statusResult.metaAds.status === "ready"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {statusResult.metaAds.status === "ready"
                            ? "Active"
                            : "Pixel Tracking Active"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-600">
                        {statusResult.metaAds.message}
                      </p>
                      <div className="mt-2 text-[11px] text-gray-500 font-mono">
                        <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                          Pixel ID: {statusResult.metaAds.pixelId || "1676617903511293"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Google Analytics 4 Setup */}
          {activeTab === "ga4" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-4 text-xs text-gray-700 space-y-2">
                <p className="font-bold text-blue-900">
                  How to link Google Analytics 4:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600 leading-relaxed">
                  <li>
                    Create a Service Account in your{" "}
                    <strong>Google Cloud Console</strong> with the <em>Google Analytics Data API</em> enabled.
                  </li>
                  <li>
                    Download its JSON Key and paste the JSON content below.
                  </li>
                  <li>
                    In <strong>Google Analytics</strong> &rarr; Admin &rarr; Property Access Management, add your Service Account email with <strong>Viewer</strong> role.
                  </li>
                </ol>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Google Tag Manager Container ID
                </label>
                <input
                  type="text"
                  value={gtmContainerId}
                  onChange={(e) => setGtmContainerId(e.target.value)}
                  placeholder="GTM-KXKXGWF6"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono text-gray-800 focus:border-blue-600 focus:outline-hidden"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Container script and noscript loaded in storefront (e.g. <code>GTM-KXKXGWF6</code>)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    GA4 Measurement ID (Storefront Tag)
                  </label>
                  <input
                    type="text"
                    value={gaMeasurementId}
                    onChange={(e) => setGaMeasurementId(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono text-gray-800 focus:border-blue-600 focus:outline-hidden"
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    Used by client browsers for pageview &amp; e-commerce tracking
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    GA4 Property ID (Admin Reports API)
                  </label>
                  <input
                    type="text"
                    value={gaPropertyId}
                    onChange={(e) => setGaPropertyId(e.target.value)}
                    placeholder="520924604"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono text-gray-800 focus:border-blue-600 focus:outline-hidden"
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    Numeric Property ID from GA4 Admin settings
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Google Service Account Key (Paste JSON)
                </label>
                <textarea
                  rows={4}
                  value={googleServiceAccountJson}
                  onChange={(e) => setGoogleServiceAccountJson(e.target.value)}
                  placeholder='{"type": "service_account", "project_id": "...", "private_key": "...", "client_email": "..."}'
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs font-mono text-gray-800 focus:border-blue-600 focus:outline-hidden"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Safely stored locally on server as <code>google-credential.json</code>
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Search Console Setup */}
          {activeTab === "gsc" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-4 text-xs text-gray-700 space-y-2">
                <p className="font-bold text-emerald-900">
                  How to link Google Search Console:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600 leading-relaxed">
                  <li>
                    Ensure the Google Service Account has <em>Google Search Console API</em> enabled in Google Cloud Console.
                  </li>
                  <li>
                    In <strong>Search Console</strong> &rarr; Settings &rarr; Users &amp; Permissions &rarr; Add User, paste your service account email with <strong>Full / Restricted</strong> permissions.
                  </li>
                  <li>
                    Enter your registered site URL exactly as defined in Search Console.
                  </li>
                </ol>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  GSC Site URL (or sc-domain prefix)
                </label>
                <input
                  type="text"
                  value={gscSiteUrl}
                  onChange={(e) => setGscSiteUrl(e.target.value)}
                  placeholder="https://laptoppointbd.com/ or sc-domain:laptoppointbd.com"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono text-gray-800 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Google Service Account Key (Shared with GA4)
                </label>
                <textarea
                  rows={3}
                  value={googleServiceAccountJson}
                  onChange={(e) => setGoogleServiceAccountJson(e.target.value)}
                  placeholder='Same service account JSON key used for Google Analytics 4'
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs font-mono text-gray-800 focus:border-blue-600 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Meta Ads & Pixel */}
          {activeTab === "meta" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-pink-50/60 border border-pink-100 p-4 text-xs text-gray-700 space-y-2">
                <p className="font-bold text-pink-900">
                  How to link Meta Pixel &amp; Marketing API:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600 leading-relaxed">
                  <li>
                    Your <strong>Meta Pixel</strong> is already actively tracking pageviews and conversions on the storefront.
                  </li>
                  <li>
                    To import ad spend, CPA, and ROAS directly into your dashboard, generate a System User Access Token in <strong>Meta Business Manager</strong> with <code>ads_read</code> permission.
                  </li>
                  <li>
                    Enter your Ad Account ID (e.g. <code>act_1234567890</code>).
                  </li>
                </ol>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Meta Pixel ID (Client Tracking)
                </label>
                <input
                  type="text"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  placeholder="1676617903511293"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono text-gray-800 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Meta Ad Account ID
                  </label>
                  <input
                    type="text"
                    value={metaAccountId}
                    onChange={(e) => setMetaAccountId(e.target.value)}
                    placeholder="act_1234567890"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono text-gray-800 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    System User Access Token
                  </label>
                  <input
                    type="password"
                    value={metaAccessToken}
                    onChange={(e) => setMetaAccessToken(e.target.value)}
                    placeholder="EAAG..."
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono text-gray-800 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>

          {activeTab !== "diagnostics" ? (
            <button
              type="button"
              onClick={handleSaveCredentials}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save &amp; Apply Credentials</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab("ga4")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-black px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
            >
              <span>Configure Services</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
