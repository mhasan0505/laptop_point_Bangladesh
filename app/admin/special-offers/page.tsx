"use client";

import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface OfferCard {
  _key: string;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeColor: string;
  imageUrl: string;
  bgGradient: string;
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
  uploading?: boolean;
  uploadError?: string;
}

interface SpecialOffersData {
  sectionHeading: string;
  sectionSubheading: string;
  offers: OfferCard[];
}

const genKey = () => `offer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const GRADIENT_OPTIONS = [
  { value: "slate",  label: "Dark Slate",     preview: "bg-gradient-to-br from-slate-800 to-slate-950" },
  { value: "blue",   label: "Deep Blue",      preview: "bg-gradient-to-br from-blue-700 to-blue-950" },
  { value: "violet", label: "Rich Violet",    preview: "bg-gradient-to-br from-violet-700 to-violet-950" },
  { value: "green",  label: "Forest Green",   preview: "bg-gradient-to-br from-emerald-600 to-emerald-900" },
  { value: "red",    label: "Crimson Red",    preview: "bg-gradient-to-br from-red-600 to-red-900" },
  { value: "amber",  label: "Amber Gold",     preview: "bg-gradient-to-br from-amber-400 to-orange-600" },
];

const BADGE_OPTIONS = [
  { value: "red",    label: "Red",    preview: "bg-red-500 text-white" },
  { value: "amber",  label: "Amber",  preview: "bg-amber-400 text-amber-950" },
  { value: "green",  label: "Green",  preview: "bg-emerald-500 text-white" },
  { value: "blue",   label: "Blue",   preview: "bg-blue-500 text-white" },
  { value: "purple", label: "Purple", preview: "bg-violet-500 text-white" },
  { value: "rose",   label: "Rose",   preview: "bg-rose-500 text-white" },
];

const DEFAULTS: SpecialOffersData = {
  sectionHeading: "Special Offers",
  sectionSubheading: "Handpicked deals you don't want to miss",
  offers: [],
};

export default function SpecialOffersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const [data, setData] = useState<SpecialOffersData>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const dragOverRef = useRef<number | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/admin/special-offers")
      .then((r) => r.json())
      .then((d: SpecialOffersData) => {
        setData({
          sectionHeading: d.sectionHeading ?? DEFAULTS.sectionHeading,
          sectionSubheading: d.sectionSubheading ?? DEFAULTS.sectionSubheading,
          offers: (d.offers ?? []).map((o) => ({ ...o })),
        });
      })
      .catch(() => showToast("error", "Failed to load offers"))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const uploadImage = useCallback(async (file: File, index: number) => {
    setData((prev) => ({
      ...prev,
      offers: prev.offers.map((o, i) =>
        i === index ? { ...o, uploading: true, uploadError: undefined } : o,
      ),
    }));
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "/laptop-point/special-offers");
    try {
      const res = await fetch("/api/admin/imagekit/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setData((prev) => ({
        ...prev,
        offers: prev.offers.map((o, i) =>
          i === index ? { ...o, imageUrl: json.url, uploading: false } : o,
        ),
      }));
    } catch (err) {
      setData((prev) => ({
        ...prev,
        offers: prev.offers.map((o, i) =>
          i === index ? { ...o, uploading: false, uploadError: err instanceof Error ? err.message : "Upload failed" } : o,
        ),
      }));
    }
  }, []);

  const addOffer = () => {
    setData((prev) => ({
      ...prev,
      offers: [
        ...prev.offers,
        {
          _key: genKey(), title: "", subtitle: "", badgeText: "",
          badgeColor: "red", imageUrl: "", bgGradient: "slate",
          ctaLabel: "Shop Now", ctaHref: "/shop", active: true,
        },
      ],
    }));
  };

  const removeOffer = (i: number) =>
    setData((prev) => ({ ...prev, offers: prev.offers.filter((_, idx) => idx !== i) }));

  const moveOffer = (i: number, dir: -1 | 1) => {
    const n = i + dir;
    if (n < 0 || n >= data.offers.length) return;
    setData((prev) => {
      const arr = [...prev.offers];
      [arr[i], arr[n]] = [arr[n], arr[i]];
      return { ...prev, offers: arr };
    });
  };

  const updateOffer = <K extends keyof OfferCard>(i: number, key: K, val: OfferCard[K]) =>
    setData((prev) => ({
      ...prev,
      offers: prev.offers.map((o, idx) => (idx === i ? { ...o, [key]: val } : o)),
    }));

  const onDragStart = (i: number) => setDragging(i);
  const onDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); dragOverRef.current = i; };
  const onDrop = () => {
    if (dragging === null || dragOverRef.current === null || dragging === dragOverRef.current) {
      setDragging(null); return;
    }
    const from = dragging, to = dragOverRef.current;
    setData((prev) => {
      const arr = [...prev.offers];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { ...prev, offers: arr };
    });
    setDragging(null); dragOverRef.current = null;
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        sectionHeading: data.sectionHeading,
        sectionSubheading: data.sectionSubheading,
        offers: data.offers.map(({ uploading, uploadError, ...rest }) => rest),
      };
      const res = await fetch("/api/admin/special-offers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      showToast("success", `${data.offers.length} offer${data.offers.length !== 1 ? "s" : ""} saved`);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Special Offers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the homepage offer cards. Drag to reorder.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={addOffer} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <Plus className="h-4 w-4" /> Add Offer
          </button>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className={`mb-4 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-md ${toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
            {toast.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />}
            {toast.msg}
            <button onClick={() => setToast(null)} className="ml-auto text-gray-400 hover:text-gray-700"><X className="h-4 w-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section settings */}
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Section Labels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Heading</label>
            <input type="text" value={data.sectionHeading}
              onChange={(e) => setData((p) => ({ ...p, sectionHeading: e.target.value }))}
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-gray-400 focus:bg-white" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Subheading</label>
            <input type="text" value={data.sectionSubheading}
              onChange={(e) => setData((p) => ({ ...p, sectionSubheading: e.target.value }))}
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-gray-400 focus:bg-white" />
          </div>
        </div>
      </div>

      {/* Empty state */}
      {data.offers.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
          <Tag className="mb-4 h-10 w-10 text-gray-300" />
          <p className="mb-1 text-base font-semibold text-gray-600">No offer cards yet</p>
          <p className="mb-4 text-sm text-gray-400">Add your first special offer to display on the homepage</p>
          <button onClick={addOffer} className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">
            <Plus className="h-4 w-4" /> Add First Offer
          </button>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {data.offers.map((offer, index) => {
            const grad = GRADIENT_OPTIONS.find((g) => g.value === offer.bgGradient) ?? GRADIENT_OPTIONS[0];
            const badge = BADGE_OPTIONS.find((b) => b.value === offer.badgeColor) ?? BADGE_OPTIONS[0];

            return (
              <motion.div key={offer._key} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                draggable onDragStart={() => onDragStart(index)} onDragOver={(e) => onDragOver(e, index)} onDrop={onDrop} onDragEnd={() => setDragging(null)}
                className={`rounded-2xl border bg-white shadow-sm transition-shadow ${dragging === index ? "opacity-50 ring-2 ring-black/10" : "border-gray-200 hover:shadow-md"}`}>

                {/* Card header bar */}
                <div className={`flex items-center gap-2 rounded-t-2xl px-4 py-2 ${grad.preview}`}>
                  <GripVertical className="h-4 w-4 text-white/60 cursor-grab" />
                  <span className="text-xs font-bold text-white/80 flex-1 truncate">{offer.title || "Untitled offer"}</span>
                  {offer.badgeText && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.preview}`}>{offer.badgeText}</span>
                  )}
                  <span className="text-[10px] font-semibold text-white/60">#{index + 1}</span>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {/* Image preview */}
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      {offer.uploading ? (
                        <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-gray-400" /></div>
                      ) : offer.imageUrl ? (
                        <Image src={offer.imageUrl} alt={offer.title || "Offer"} fill className="object-contain p-1" unoptimized />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center text-gray-300">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                      <button onClick={() => fileInputRefs.current[index]?.click()}
                        className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 hover:bg-black/30 transition-colors">
                        <Upload className="h-4 w-4 text-transparent hover:text-white" />
                      </button>
                      <input type="file" accept="image/*" className="hidden" ref={(el) => { fileInputRefs.current[index] = el; }}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, index); e.target.value = ""; }} />
                    </div>

                    {/* Fields */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Title *" value={offer.title}
                          onChange={(e) => updateOffer(index, "title", e.target.value)}
                          className="h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-gray-400 focus:bg-white" />
                        <input type="text" placeholder="Subtitle" value={offer.subtitle}
                          onChange={(e) => updateOffer(index, "subtitle", e.target.value)}
                          className="h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-gray-400 focus:bg-white" />
                      </div>
                      <div className="flex gap-2">
                        <input type="url" placeholder="Image URL or upload →" value={offer.imageUrl}
                          onChange={(e) => updateOffer(index, "imageUrl", e.target.value)}
                          className="h-9 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-gray-400 focus:bg-white" />
                        <button onClick={() => fileInputRefs.current[index]?.click()}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:text-black">
                          <Upload className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {offer.uploadError && <p className="text-xs text-red-500">{offer.uploadError}</p>}
                    </div>

                    {/* Reorder / remove */}
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveOffer(index, -1)} disabled={index === 0} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
                      <button onClick={() => moveOffer(index, 1)} disabled={index === data.offers.length - 1} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
                      <button onClick={() => removeOffer(index)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>

                  {/* Second row: badge, colors, cta */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input type="text" placeholder='Badge e.g. "30% OFF"' value={offer.badgeText}
                      onChange={(e) => updateOffer(index, "badgeText", e.target.value)}
                      className="h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-gray-400 focus:bg-white" />
                    <input type="text" placeholder="Button label" value={offer.ctaLabel}
                      onChange={(e) => updateOffer(index, "ctaLabel", e.target.value)}
                      className="h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-gray-400 focus:bg-white" />
                    <input type="text" placeholder="Button link e.g. /deals" value={offer.ctaHref}
                      onChange={(e) => updateOffer(index, "ctaHref", e.target.value)}
                      className="h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm col-span-2 sm:col-span-1 outline-none focus:border-gray-400 focus:bg-white" />

                    {/* Active toggle */}
                    <label className="flex cursor-pointer items-center gap-2 self-center">
                      <div onClick={() => updateOffer(index, "active", !offer.active)}
                        className={`relative h-5 w-9 rounded-full transition-colors ${offer.active ? "bg-black" : "bg-gray-200"}`}>
                        <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${offer.active ? "translate-x-4" : ""}`} />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{offer.active ? "Active" : "Hidden"}</span>
                    </label>
                  </div>

                  {/* Card background + badge color pickers */}
                  <div className="flex flex-wrap gap-4 pt-1">
                    <div>
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Card Background</p>
                      <div className="flex gap-1.5">
                        {GRADIENT_OPTIONS.map((g) => (
                          <button key={g.value} onClick={() => updateOffer(index, "bgGradient", g.value)} title={g.label}
                            className={`h-6 w-6 rounded-full ${g.preview} transition-transform hover:scale-110 ${offer.bgGradient === g.value ? "ring-2 ring-offset-1 ring-black scale-110" : ""}`} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Badge Color</p>
                      <div className="flex gap-1.5">
                        {BADGE_OPTIONS.map((b) => (
                          <button key={b.value} onClick={() => updateOffer(index, "badgeColor", b.value)} title={b.label}
                            className={`h-6 w-6 rounded-full ${b.preview} transition-transform hover:scale-110 ${offer.badgeColor === b.value ? "ring-2 ring-offset-1 ring-black scale-110" : ""}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {data.offers.length > 0 && (
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={addOffer} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Plus className="h-4 w-4" /> Add Offer
          </button>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
