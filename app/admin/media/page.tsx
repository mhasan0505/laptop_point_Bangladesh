"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Search,
  Filter,
  Trash2,
  Edit2,
  Check,
  X,
  Copy,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileImage,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";
import { MEDIA_PRESETS } from "@/lib/media/presets-config";

interface AssetUsage {
  type: "banner" | "product";
  id: string;
  name: string;
}

interface MediaAssetItem {
  id: string;
  originalFilename: string;
  storageKey: string;
  mime: string;
  width: number;
  height: number;
  bytes: number;
  alt: string;
  preset: string | null;
  variants: Array<{
    width: number;
    height: number;
    format: string;
    url: string;
    bytes: number;
  }>;
  createdAt: string;
  usages: AssetUsage[];
  isUsed: boolean;
}

export default function MediaLibraryPage() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [assets, setAssets] = useState<MediaAssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("all");
  const [unusedOnly, setUnusedOnly] = useState(false);

  // Uploading state
  const [uploadPreset, setUploadPreset] = useState("card");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detail / Edit modal state
  const [selectedAsset, setSelectedAsset] = useState<MediaAssetItem | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [isSavingAlt, setIsSavingAlt] = useState(false);

  // Delete modal state
  const [assetToDelete, setAssetToDelete] = useState<MediaAssetItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedPreset !== "all") params.set("preset", selectedPreset);
      if (unusedOnly) params.set("unused", "true");

      const res = await fetch(`/api/admin/media?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load assets");
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Failed to load media assets");
    } finally {
      setLoading(false);
    }
  }, [search, selectedPreset, unusedOnly]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssets();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchAssets]);

  // Failed uploads tracking
  const [failedUploads, setFailedUploads] = useState<
    Array<{ filename: string; stage: string; detail: string }>
  >([]);

  const handleBulkUpload = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setIsUploading(true);
    setFailedUploads([]);
    let successCount = 0;
    const failures: Array<{ filename: string; stage: string; detail: string }> = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setUploadProgress(`Processing ${i + 1} of ${fileList.length}: ${file.name}...`);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("preset", uploadPreset);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const stage = errData.stage || "upload_error";
          const detail = errData.detail || errData.error || `HTTP ${res.status}`;
          failures.push({ filename: file.name, stage, detail });
          toastError(`${file.name} failed [${stage}]: ${detail}`);
          continue;
        }

        successCount++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Network error";
        failures.push({ filename: file.name, stage: "network", detail: msg });
        toastError(`${file.name} failed [network]: ${msg}`);
        console.error("Upload error:", err);
      }
    }

    setIsUploading(false);
    setUploadProgress("");
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (successCount > 0) {
      toastSuccess(`Successfully uploaded ${successCount} asset(s) with WebP & AVIF variants.`);
      fetchAssets();
    }
    if (failures.length > 0) {
      setFailedUploads(failures);
    }
  };

  const handleSaveAlt = async () => {
    if (!selectedAsset) return;
    setIsSavingAlt(true);
    try {
      const res = await fetch(`/api/admin/media/${selectedAsset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt: editAlt }),
      });
      if (!res.ok) throw new Error("Failed to update alt text");
      toastSuccess("Alt text updated successfully");
      setSelectedAsset((prev) => (prev ? { ...prev, alt: editAlt } : null));
      setAssets((prev) =>
        prev.map((a) => (a.id === selectedAsset.id ? { ...a, alt: editAlt } : a))
      );
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Failed to save alt text");
    } finally {
      setIsSavingAlt(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/media/${assetToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete asset");
      }
      toastSuccess("Media asset deleted successfully");
      setAssetToDelete(null);
      if (selectedAsset?.id === assetToDelete.id) {
        setSelectedAsset(null);
      }
      fetchAssets();
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Failed to delete asset");
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toastSuccess("URL copied to clipboard");
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Asset Storage & Optimization
            </p>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Media Library
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Store, inspect and organize image assets with automatic multi-resolution WebP and AVIF generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 shadow-xs"
          >
            <UploadCloud size={14} />
            Upload Assets
          </Button>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="rounded-xl border border-dashed border-border bg-card/60 p-6 transition-all hover:border-primary/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Drag and drop assets here, or click to browse
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Supported: WebP, AVIF, PNG, JPG, GIF (Max 16MB). Multi-file upload supported.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                Optimization Preset:
              </span>
              <select
                value={uploadPreset}
                onChange={(e) => setUploadPreset(e.target.value)}
                className="h-9 px-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {Object.values(MEDIA_PRESETS).map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.label} ({p.widths.join(", ")}px)
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-9 text-xs font-semibold gap-1.5 shrink-0"
            >
              Browse Files
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleBulkUpload(e.target.files)}
        />

        {isUploading && (
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-3 text-xs text-primary font-medium">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{uploadProgress || "Uploading..."}</span>
          </div>
        )}

        {failedUploads.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-danger flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {failedUploads.length} File(s) Failed to Upload
              </span>
              <button
                type="button"
                onClick={() => setFailedUploads([])}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <div className="space-y-1.5">
              {failedUploads.map((f, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-danger/30 bg-danger-soft text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                >
                  <span className="font-medium text-foreground truncate max-w-sm">
                    {f.filename}
                  </span>
                  <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                    <span className="px-1.5 py-0.5 rounded font-mono font-bold bg-danger/10 text-danger uppercase tracking-wider">
                      stage: {f.stage}
                    </span>
                    <span className="text-foreground/80">{f.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename or alt text..."
              className="h-9 pl-9 text-xs bg-background"
            />
          </div>

          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="h-9 px-3 text-xs rounded-lg border border-border bg-background text-foreground"
          >
            <option value="all">All Presets</option>
            {Object.values(MEDIA_PRESETS).map((p) => (
              <option key={p.name} value={p.name}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setUnusedOnly(!unusedOnly)}
            className={`flex items-center gap-1.5 h-9 px-3 text-xs font-medium border transition-colors ${
              unusedOnly
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <span>Unused Assets Only</span>
            {unusedOnly && <Check className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className="min-h-64 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-medium">Loading media assets...</p>
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center flex flex-col items-center justify-center gap-3">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <h3 className="text-sm font-bold text-foreground">Failed to load media assets</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {loadError}. The server might be temporarily unreachable.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchAssets()}
            className="gap-2 mt-1 border-destructive/30 hover:bg-destructive/10"
          >
            Retry
          </Button>
        </div>
      ) : assets.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <FileImage className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-sm font-semibold text-foreground">No media assets found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {search || selectedPreset !== "all" || unusedOnly
              ? "No assets match your search or filter criteria. Try resetting filters."
              : "No media assets have been uploaded yet. Upload images above to populate the library."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {assets.map((asset) => {
            const displayUrl = `/uploads/${asset.storageKey}`;
            const variantCount = Array.isArray(asset.variants) ? asset.variants.length : 0;

            return (
              <div
                key={asset.id}
                onClick={() => {
                  setSelectedAsset(asset);
                  setEditAlt(asset.alt || "");
                }}
                className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-xs hover:border-primary/60 hover:shadow-md transition-all cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative aspect-square w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                  <Image
                    src={displayUrl}
                    alt={asset.alt || asset.originalFilename}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />

                  {/* Preset & Usage Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                    {asset.preset && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white backdrop-blur-xs uppercase tracking-wider">
                        {asset.preset}
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2 right-2">
                    {asset.isUsed ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-600/90 text-white backdrop-blur-xs">
                        In Use ({asset.usages.length})
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-neutral-800/80 text-neutral-300 backdrop-blur-xs">
                        Unused
                      </span>
                    )}
                  </div>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(displayUrl);
                      }}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-neutral-800 shadow-sm transition-transform hover:scale-110"
                      title="Copy URL"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAsset(asset);
                        setEditAlt(asset.alt || "");
                      }}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-neutral-800 shadow-sm transition-transform hover:scale-110"
                      title="Edit metadata"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAssetToDelete(asset);
                      }}
                      className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white shadow-sm transition-transform hover:scale-110"
                      title="Delete asset"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info Bar */}
                <div className="p-2.5 flex flex-col justify-between flex-1">
                  <div>
                    <p className="text-xs font-semibold text-foreground truncate" title={asset.originalFilename}>
                      {asset.originalFilename}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {asset.width}×{asset.height} px · {(asset.bytes / 1024).toFixed(0)} KB
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3 text-primary" />
                      {variantCount} variants
                    </span>
                    <span className="text-foreground/70 font-mono">WebP/AVIF</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Asset Inspection & Edit Alt Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <FileImage className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground truncate max-w-md">
                  {selectedAsset.originalFilename}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Preview Box */}
              <div className="relative w-full aspect-video rounded-xl bg-neutral-900 overflow-hidden flex items-center justify-center border border-border">
                <Image
                  src={`/uploads/${selectedAsset.storageKey}`}
                  alt={selectedAsset.alt || selectedAsset.originalFilename}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Alt Text Edit */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Accessible Alt Text
                </label>
                <div className="flex gap-2">
                  <Input
                    value={editAlt}
                    onChange={(e) => setEditAlt(e.target.value)}
                    placeholder="Describe this image for screen readers and search engines..."
                    className="h-9 text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveAlt}
                    disabled={isSavingAlt}
                    className="h-9 text-xs font-bold shrink-0"
                  >
                    {isSavingAlt ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                    Save Alt
                  </Button>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">Dimensions</span>
                  <span className="font-semibold">{selectedAsset.width} × {selectedAsset.height} px</span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">File Size</span>
                  <span className="font-semibold">{(selectedAsset.bytes / 1024).toFixed(1)} KB</span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">Preset</span>
                  <span className="font-semibold uppercase">{selectedAsset.preset || "standard"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">Storage Key</span>
                  <span className="font-mono text-[11px] truncate block" title={selectedAsset.storageKey}>
                    {selectedAsset.storageKey}
                  </span>
                </div>
              </div>

              {/* Generated Variants */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Generated Formats & Variants ({selectedAsset.variants?.length || 0})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedAsset.variants?.map((v, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-border bg-card/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold uppercase text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary mr-1.5">
                          {v.format}
                        </span>
                        <span className="font-medium">{v.width}w</span>
                        <span className="text-[10px] text-muted-foreground ml-1.5">
                          ({((v.bytes || 0) / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(v.url)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Copy variant URL"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Information */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-foreground">
                  Where is this asset used?
                </h4>
                {selectedAsset.usages.length === 0 ? (
                  <div className="p-3 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground">
                    This asset is currently not referenced by any banners or products. Safe to delete.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {selectedAsset.usages.map((u, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-muted/40 border border-border flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-foreground">{u.name}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600">
                          {u.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-border flex items-center justify-between bg-card">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setAssetToDelete(selectedAsset)}
                className="text-xs gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Asset
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAsset(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(assetToDelete)}
        onOpenChange={(open) => !open && setAssetToDelete(null)}
        title="Delete Media Asset"
        variant="danger"
        confirmLabel="Delete Permanently"
        loading={isDeleting}
        description={
          assetToDelete?.isUsed ? (
            <div className="space-y-2 text-danger">
              <p className="font-semibold">
                ⚠️ Warning: This asset is currently in use!
              </p>
              <p className="text-xs text-muted-foreground">
                It is referenced in: {assetToDelete.usages.map((u) => u.name).join(", ")}.
                You must remove this asset from the associated banner or product before deleting it.
              </p>
            </div>
          ) : (
            `Are you sure you want to permanently delete "${assetToDelete?.originalFilename}" and all its WebP/AVIF variants? This action cannot be undone.`
          )
        }
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
