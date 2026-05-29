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
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface HeroSlide {
  _key: string;
  imageUrl: string;
  alt: string;
  linkHref: string;
  active: boolean;
  /** local-only: file being uploaded */
  uploading?: boolean;
  uploadError?: string;
}

const genKey = () => `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function HeroBannersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
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

  // ── Load slides ──────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/admin/hero-banners")
      .then((r) => r.json())
      .then((data) => {
        const raw: HeroSlide[] = (data.slides ?? []).map(
          (s: Partial<HeroSlide>) => ({
            _key: s._key ?? genKey(),
            imageUrl: s.imageUrl ?? "",
            alt: s.alt ?? "",
            linkHref: s.linkHref ?? "",
            active: s.active !== false,
          }),
        );
        setSlides(raw);
      })
      .catch(() => showToast("error", "Failed to load banners"))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  // ── Upload image via ImageKit ──────────────────────────────
  const uploadImage = useCallback(
    async (file: File, index: number) => {
      setSlides((prev) =>
        prev.map((s, i) =>
          i === index ? { ...s, uploading: true, uploadError: undefined } : s,
        ),
      );

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "/laptop-point/hero-banners");

      try {
        const res = await fetch("/api/admin/imagekit/upload", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Upload failed");

        setSlides((prev) =>
          prev.map((s, i) =>
            i === index
              ? { ...s, imageUrl: json.url, uploading: false }
              : s,
          ),
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setSlides((prev) =>
          prev.map((s, i) =>
            i === index
              ? { ...s, uploading: false, uploadError: msg }
              : s,
          ),
        );
      }
    },
    [],
  );

  // ── Add slide ────────────────────────────────────────────────
  const addSlide = () => {
    setSlides((prev) => [
      ...prev,
      { _key: genKey(), imageUrl: "", alt: "", linkHref: "", active: true },
    ]);
  };

  // ── Remove slide ──────────────────────────────────────────────
  const removeSlide = (index: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Move slide ────────────────────────────────────────────────
  const moveSlide = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= slides.length) return;
    setSlides((prev) => {
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      return arr;
    });
  };

  // ── Field update ──────────────────────────────────────────────
  const updateField = <K extends keyof HeroSlide>(
    index: number,
    field: K,
    value: HeroSlide[K],
  ) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  // ── Drag-and-drop reorder ─────────────────────────────────────
  const onDragStart = (i: number) => setDragging(i);
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    dragOverRef.current = i;
  };
  const onDrop = () => {
    if (dragging === null || dragOverRef.current === null) return;
    const from = dragging;
    const to = dragOverRef.current;
    if (from === to) {
      setDragging(null);
      return;
    }
    setSlides((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    setDragging(null);
    dragOverRef.current = null;
  };

  // ── Save ─────────────────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    try {
      const payload = slides.map(({ uploading, uploadError, ...rest }) => rest);
      const res = await fetch("/api/admin/hero-banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: payload }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      showToast("success", `${slides.length} slide${slides.length !== 1 ? "s" : ""} saved successfully`);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Banners</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the homepage hero slider. Drag rows to reorder.
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-600">
            Recommended image size: 1920 &times; 600px (or similar wide aspect ratio).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={addSlide}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Add Slide
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 disabled:opacity-60"
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

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`mb-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-md ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            )}
            {toast.msg}
            <button onClick={() => setToast(null)} className="ml-auto text-gray-400 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {slides.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
          <ImageIcon className="mb-4 h-10 w-10 text-gray-300" />
          <p className="mb-1 text-base font-semibold text-gray-600">No banner slides yet</p>
          <p className="mb-4 text-sm text-gray-400">Add your first hero slide to get started</p>
          <button
            onClick={addSlide}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Add First Slide
          </button>
        </div>
      )}

      {/* Slides list */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {slides.map((slide, index) => (
            <motion.div
              key={slide._key}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDrop={onDrop}
              onDragEnd={() => setDragging(null)}
              className={`rounded-2xl border bg-white shadow-sm transition-shadow ${
                dragging === index
                  ? "opacity-50 shadow-lg ring-2 ring-black/10"
                  : "border-gray-200 hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-3 p-4">
                {/* Drag handle */}
                <div className="mt-1 flex cursor-grab flex-col items-center gap-1 text-gray-300 active:cursor-grabbing">
                  <GripVertical className="h-5 w-5" />
                  <span className="text-xs font-semibold text-gray-400">
                    {index + 1}
                  </span>
                </div>

                {/* Image preview / upload */}
                <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  {slide.uploading ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                  ) : slide.imageUrl ? (
                    <Image
                      src={slide.imageUrl}
                      alt={slide.alt || "Banner"}
                      fill
                      className="object-contain p-1"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-gray-300">
                      <ImageIcon className="h-6 w-6" />
                      <p className="mt-1 text-[10px]">No image</p>
                    </div>
                  )}

                  {/* Upload overlay button */}
                  <button
                    onClick={() => fileInputRefs.current[index]?.click()}
                    className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 transition-colors hover:bg-black/40"
                    title="Upload image"
                  >
                    <Upload className="h-5 w-5 text-transparent transition-colors hover:text-white group-hover:text-white" />
                  </button>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => { fileInputRefs.current[index] = el; }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file, index);
                      e.target.value = "";
                    }}
                  />
                </div>

                {/* Fields */}
                <div className="flex flex-1 flex-col gap-2 min-w-0">
                  {/* Image URL input */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Image URL (paste or upload)"
                      value={slide.imageUrl}
                      onChange={(e) => updateField(index, "imageUrl", e.target.value)}
                      className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-gray-400 focus:bg-white"
                    />
                    <button
                      onClick={() => fileInputRefs.current[index]?.click()}
                      title="Upload image"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-all hover:border-gray-400 hover:text-black"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                  </div>

                  {slide.uploadError && (
                    <p className="text-xs text-red-500">{slide.uploadError}</p>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Alt text"
                      value={slide.alt}
                      onChange={(e) => updateField(index, "alt", e.target.value)}
                      className="h-9 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-gray-400 focus:bg-white"
                    />
                    <input
                      type="url"
                      placeholder="Link (optional)"
                      value={slide.linkHref}
                      onChange={(e) => updateField(index, "linkHref", e.target.value)}
                      className="h-9 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-gray-400 focus:bg-white"
                    />
                  </div>

                  {/* Active toggle */}
                  <label className="flex cursor-pointer items-center gap-2 self-start">
                    <div
                      onClick={() => updateField(index, "active", !slide.active)}
                      className={`relative h-5 w-9 rounded-full transition-colors ${
                        slide.active ? "bg-black" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          slide.active ? "translate-x-4" : ""
                        }`}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {slide.active ? "Active" : "Hidden"}
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveSlide(index, -1)}
                    disabled={index === 0}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
                    title="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveSlide(index, 1)}
                    disabled={index === slides.length - 1}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
                    title="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeSlide(index)}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Remove slide"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {slides.length > 0 && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={addSlide}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Add Slide
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
