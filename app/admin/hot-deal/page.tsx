"use client";

import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Save,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface HotDealData {
  headline: string;
  subtext: string;
  badgeText: string;
  bannerImageUrl: string;
  targetDate: string;
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
}

const DEFAULTS: HotDealData = {
  headline: "Flash Sale Ends In",
  subtext:
    "Grab your favourite laptops at unbeatable prices. Discounts up to 40% on selected premium models.",
  badgeText: "Limited Time Offer",
  bannerImageUrl: "",
  targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16),
  ctaLabel: "Shop Deals Now",
  ctaHref: "/shop",
  active: true,
};

/** Format ISO → datetime-local value */
function toDatetimeLocal(iso: string) {
  try {
    return new Date(iso).toISOString().slice(0, 16);
  } catch {
    return iso.slice(0, 16);
  }
}

export default function HotDealPage() {
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const [data, setData] = useState<HotDealData>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Load ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/admin/hot-deal")
      .then((r) => r.json())
      .then((d: HotDealData) => {
        setData({
          ...d,
          targetDate: toDatetimeLocal(d.targetDate),
        });
      })
      .catch(() => showToast("error", "Failed to load hot deal settings"))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  // ── Upload image ──────────────────────────────────────────────
  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "/laptop-point/hot-deal");

    try {
      const res = await fetch("/api/admin/imagekit/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setData((prev) => ({ ...prev, bannerImageUrl: json.url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ── Save ──────────────────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        // Convert datetime-local back to full ISO
        targetDate: new Date(data.targetDate).toISOString(),
      };
      const res = await fetch("/api/admin/hot-deal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      showToast("success", "Hot deal banner saved successfully");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof HotDealData>(k: K, v: HotDealData[K]) =>
    setData((prev) => ({ ...prev, [k]: v }));

  if (authLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hot Deal Banner</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the flash-sale banner shown on the /deals page.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`mb-4 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-md ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            )}
            {toast.msg}
            <button
              onClick={() => setToast(null)}
              className="ml-auto text-gray-400 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {/* Visibility toggle card */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Banner Visibility
            </p>
            <p className="text-xs text-gray-500">
              {data.active
                ? "Banner is visible on the deals page"
                : "Banner is hidden from visitors"}
            </p>
          </div>
          <button
            onClick={() => update("active", !data.active)}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              data.active
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {data.active ? (
              <>
                <Eye className="h-4 w-4" /> Visible
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" /> Hidden
              </>
            )}
          </button>
        </div>

        {/* Content card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
            Content
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Badge Text
              </label>
              <input
                type="text"
                value={data.badgeText}
                onChange={(e) => update("badgeText", e.target.value)}
                placeholder="Limited Time Offer"
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-gray-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Headline
              </label>
              <input
                type="text"
                value={data.headline}
                onChange={(e) => update("headline", e.target.value)}
                placeholder="Flash Sale Ends In"
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-gray-400 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Subtext
            </label>
            <textarea
              value={data.subtext}
              onChange={(e) => update("subtext", e.target.value)}
              rows={2}
              placeholder="Short description…"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-gray-400 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* Banner Image card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
            Promotional Image{" "}
            <span className="normal-case font-normal text-gray-400">
              (optional)
            </span>
          </h2>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Preview */}
            <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
              {uploading ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : data.bannerImageUrl ? (
                <Image
                  src={data.bannerImageUrl}
                  alt="Banner preview"
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-gray-300">
                  <ImageIcon className="h-6 w-6" />
                  <p className="mt-1 text-[10px]">No image</p>
                </div>
              )}
              {/* Overlay upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 transition-colors hover:bg-black/30"
                title="Upload image"
              >
                <Upload className="h-5 w-5 text-transparent hover:text-white transition-colors" />
              </button>
            </div>

            {/* URL + upload button */}
            <div className="flex-1 space-y-2 w-full">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={data.bannerImageUrl}
                  onChange={(e) => update("bannerImageUrl", e.target.value)}
                  placeholder="Paste image URL or upload →"
                  className="h-10 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-gray-400 focus:bg-white"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-black disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </button>
              </div>

              {uploadError && (
                <p className="text-xs text-red-500">{uploadError}</p>
              )}

              {data.bannerImageUrl && (
                <button
                  onClick={() => update("bannerImageUrl", "")}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
              e.target.value = "";
            }}
          />
        </div>

        {/* Countdown + CTA card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
            Countdown &amp; CTA
          </h2>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
              <Clock className="h-3.5 w-3.5" />
              Countdown Target Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={data.targetDate}
              onChange={(e) => update("targetDate", e.target.value)}
              className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 outline-none transition-all focus:border-gray-400 focus:bg-white"
            />
            <p className="mt-1 text-xs text-gray-400">
              Timer counts down to this moment. Set in future to activate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Button Label
              </label>
              <input
                type="text"
                value={data.ctaLabel}
                onChange={(e) => update("ctaLabel", e.target.value)}
                placeholder="Shop Deals Now"
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-gray-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Button Link
              </label>
              <input
                type="text"
                value={data.ctaHref}
                onChange={(e) => update("ctaHref", e.target.value)}
                placeholder="/shop or /deals"
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-gray-400 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Live Preview card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">
            Live Preview
          </h2>
          <div className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl p-5 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-semibold text-yellow-300">
                  <Clock size={12} className="animate-pulse" />
                  {data.badgeText || "Limited Time Offer"}
                </div>
                <p className="text-xl font-extrabold">
                  {data.headline || "Flash Sale Ends In"}
                </p>
                <p className="text-red-100 text-xs line-clamp-2">
                  {data.subtext}
                </p>
              </div>
              {data.bannerImageUrl && (
                <div className="relative h-20 w-32 shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={data.bannerImageUrl}
                    alt="preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
              <div className="shrink-0">
                <span className="px-4 py-2 bg-white text-red-600 font-bold rounded-lg text-sm shadow">
                  {data.ctaLabel || "Shop Deals Now"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom save */}
        <div className="flex justify-end pb-4">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
