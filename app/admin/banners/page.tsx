"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ImageIcon,
  Plus,
  ArrowUpDown,
  Calendar,
  Eye,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
  Loader2,
  AlertTriangle,
  MoveUp,
  MoveDown,
  Smartphone,
  Monitor,
  FolderOpen,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";
import { BANNER_PLACEMENTS, BannerPlacement } from "@/lib/banners/placements";

interface MediaAssetReference {
  id?: string;
  storageKey?: string;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

interface MediaAssetPickerItem {
  id: string;
  storageKey: string;
  alt?: string;
  originalFilename?: string;
  preset?: string | null;
  width?: number;
  height?: number;
  bytes?: number;
  variants?: Array<{
    width: number;
    height: number;
    format: string;
    url: string;
    bytes?: number;
  }>;
}

interface BannerItem {
  id: string;
  placement: string;
  title: string;
  desktopAssetId: string | null;
  desktopImageUrl: string | null;
  mobileAssetId: string | null;
  mobileImageUrl: string | null;
  alt: string;
  headline: string | null;
  subtext: string | null;
  ctaLabel: string | null;
  linkHref: string | null;
  theme: unknown;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  sortOrder: number;
  targetBrandId: string | null;
  targetCategoryId: string | null;
  status: "live" | "scheduled" | "expired" | "off";
  desktopAsset?: MediaAssetReference | null;
  mobileAsset?: MediaAssetReference | null;
  metrics?: {
    impressions: number;
    clicks: number;
    ctr: string;
  };
}

function BannerManagerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlacement = searchParams.get("placement") || "home.hero";

  const { success: toastSuccess, error: toastError } = useToast();

  const [selectedPlacementId, setSelectedPlacementId] = useState(initialPlacement);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [allPlacementCounts, setAllPlacementCounts] = useState<Record<string, number>>({});
  const [allPlacementLiveThumbs, setAllPlacementLiveThumbs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<BannerItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [aspectRatioWarning, setAspectRatioWarning] = useState<string | null>(null);

  // Media Library Picker inside Editor
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"desktop" | "mobile">("desktop");
  const [mediaAssets, setMediaAssets] = useState<MediaAssetPickerItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  // Delete State
  const [bannerToDelete, setBannerToDelete] = useState<BannerItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPlacement: BannerPlacement =
    BANNER_PLACEMENTS.find((p) => p.id === selectedPlacementId) || BANNER_PLACEMENTS[0];

  // Fetch all banners to populate sidebar counts & live thumbnails
  const fetchAllBannersSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/banners");
      if (res.ok) {
        const data = await res.json();
        const list: BannerItem[] = data.banners || [];
        const counts: Record<string, number> = {};
        const thumbs: Record<string, string> = {};

        for (const b of list) {
          counts[b.placement] = (counts[b.placement] || 0) + 1;
          if (b.status === "live" && !thumbs[b.placement]) {
            const thumbUrl = b.desktopAsset?.storageKey
              ? `/uploads/${b.desktopAsset.storageKey}`
              : b.desktopImageUrl || "";
            if (thumbUrl) thumbs[b.placement] = thumbUrl;
          }
        }
        setAllPlacementCounts(counts);
        setAllPlacementLiveThumbs(thumbs);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch banners for current selected placement
  const fetchPlacementBanners = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const res = await fetch(`/api/admin/banners?placement=${selectedPlacementId}`);
      if (!res.ok) throw new Error("Failed to load banners");
      const data = await res.json();
      setBanners(data.banners || []);
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, [selectedPlacementId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllBannersSummary();
      fetchPlacementBanners();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchPlacementBanners, fetchAllBannersSummary]);

  const handleSelectPlacement = (id: string) => {
    setSelectedPlacementId(id);
    setLoading(true);
    setLoadError(null);
    router.replace(`/admin/banners?placement=${id}`);
  };

  const handleToggleActive = async (banner: BannerItem) => {
    const nextActive = !banner.active;
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle banner status");
      toastSuccess(`Banner ${nextActive ? "activated" : "deactivated"}`);
      fetchPlacementBanners();
      fetchAllBannersSummary();
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Failed to toggle banner status");
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const reordered = [...banners];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const orders = reordered.map((b, i) => ({ id: b.id, sortOrder: i }));
    setBanners(reordered.map((b, i) => ({ ...b, sortOrder: i })));

    try {
      const res = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      });
      if (!res.ok) throw new Error("Failed to save reorder");
      toastSuccess("Banner order updated");
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Failed to save reorder");
      fetchPlacementBanners();
    }
  };

  const openNewBannerModal = () => {
    setEditingBanner({
      placement: selectedPlacementId,
      title: "",
      headline: "",
      subtext: "",
      ctaLabel: "Shop Now",
      linkHref: "/shop",
      alt: "",
      desktopImageUrl: "",
      mobileImageUrl: "",
      active: true,
      sortOrder: banners.length,
      theme: {
        badgeText: "Limited Offer",
        badgeColor: "blue",
        discount: "",
        bgGradient: "slate",
      },
    });
    setAspectRatioWarning(null);
    setIsEditorOpen(true);
  };

  const openEditBannerModal = (banner: BannerItem) => {
    setEditingBanner({
      ...banner,
      theme: banner.theme || {
        badgeText: "Limited Offer",
        badgeColor: "blue",
        discount: "",
        bgGradient: "slate",
      },
    });
    setAspectRatioWarning(null);
    setIsEditorOpen(true);
  };

  // Inspect image dimensions & warn on aspect ratio mismatch
  const checkAspectRatio = (imgUrl: string) => {
    if (!imgUrl || !currentPlacement.ratioValue) {
      setAspectRatioWarning(null);
      return;
    }
    const img = new window.Image();
    img.src = imgUrl;
    img.onload = () => {
      const imgRatio = img.width / img.height;
      const targetRatio = currentPlacement.ratioValue;
      const deviation = Math.abs(imgRatio - targetRatio) / targetRatio;
      if (deviation > 0.15) {
        setAspectRatioWarning(
          `Image aspect ratio (${img.width}×${img.height}, ~${imgRatio.toFixed(2)}:1) deviates from the recommended ${currentPlacement.aspectRatio} (~${targetRatio.toFixed(2)}:1). It may appear cropped or letterboxed.`
        );
      } else {
        setAspectRatioWarning(null);
      }
    };
  };

  const handleSaveBanner = async () => {
    if (!editingBanner || !editingBanner.title?.trim()) {
      toastError("Title is required");
      return;
    }

    setIsSaving(true);
    try {
      const isNew = !editingBanner.id;
      const url = isNew ? "/api/admin/banners" : `/api/admin/banners/${editingBanner.id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBanner),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save banner");
      }

      toastSuccess(`Banner ${isNew ? "created" : "updated"} successfully`);
      setIsEditorOpen(false);
      setEditingBanner(null);
      fetchPlacementBanners();
      fetchAllBannersSummary();
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Failed to save banner");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBannerConfirm = async () => {
    if (!bannerToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/banners/${bannerToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete banner");
      toastSuccess("Banner deleted");
      setBannerToDelete(null);
      fetchPlacementBanners();
      fetchAllBannersSummary();
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Failed to delete banner");
    } finally {
      setIsDeleting(false);
    }
  };

  const openMediaPicker = async (target: "desktop" | "mobile") => {
    setMediaPickerTarget(target);
    setIsMediaPickerOpen(true);
    setMediaLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setMediaAssets(data.assets || []);
      }
    } catch {
      // ignore
    } finally {
      setMediaLoading(false);
    }
  };

  const handleSelectMediaAsset = (asset: MediaAssetPickerItem) => {
    const assetUrl = `/uploads/${asset.storageKey}`;
    if (mediaPickerTarget === "desktop") {
      setEditingBanner((prev) => ({
        ...prev,
        desktopAssetId: asset.id,
        desktopImageUrl: assetUrl,
        alt: prev?.alt || asset.alt || prev?.title || "",
      }));
      checkAspectRatio(assetUrl);
    } else {
      setEditingBanner((prev) => ({
        ...prev,
        mobileAssetId: asset.id,
        mobileImageUrl: assetUrl,
      }));
    }
    setIsMediaPickerOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Live</span>;
      case "scheduled":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Scheduled</span>;
      case "expired":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Expired</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">Off</span>;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Omnichannel Campaign & Placement Manager
            </p>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Banner Manager
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure, schedule, and reorder promotional banners across all storefront slots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={openNewBannerModal}
            className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 shadow-xs"
          >
            <Plus size={14} />
            Create Banner
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left: Placements Navigation */}
        <div className="lg:col-span-1 space-y-2 rounded-2xl border border-border bg-card p-3 shadow-xs">
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Banner Placements ({BANNER_PLACEMENTS.length})
          </p>
          <div className="space-y-1">
            {BANNER_PLACEMENTS.map((p) => {
              const isSelected = p.id === selectedPlacementId;
              const count = allPlacementCounts[p.id] || 0;
              const liveThumb = allPlacementLiveThumbs[p.id];

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPlacement(p.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 border border-primary/30 text-primary font-bold shadow-2xs"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative h-8 w-12 rounded bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0 border border-border">
                      {liveThumb ? (
                        <Image src={liveThumb} alt={p.label} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">
                          {p.aspectRatio}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate text-xs">{p.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{p.recommendedSize}</p>
                    </div>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      count > 0 ? "bg-muted text-foreground" : "text-muted-foreground/50"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Placement Banners */}
        <div className="lg:col-span-3 space-y-5">
          {/* Placement Info Bar */}
          <div className="p-4 rounded-2xl border border-border bg-card/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">{currentPlacement.label}</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {currentPlacement.id}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600">
                  {currentPlacement.mode}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentPlacement.whereItShows} · Recommended:{" "}
                <strong className="text-foreground">{currentPlacement.recommendedSize} ({currentPlacement.aspectRatio})</strong>
              </p>
            </div>

            <Button
              size="sm"
              onClick={openNewBannerModal}
              className="h-8.5 text-xs font-semibold gap-1.5 shrink-0"
            >
              <Plus size={13} />
              Add Banner to Slot
            </Button>
          </div>

          {/* Banners List */}
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Loading placement banners...</span>
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center flex flex-col items-center justify-center gap-3">
              <AlertTriangle className="h-10 w-10 text-destructive" />
              <h3 className="text-sm font-bold text-foreground">Failed to load placement banners</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                {loadError}. The server might be temporarily unreachable.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  fetchPlacementBanners();
                  fetchAllBannersSummary();
                }}
                className="mt-1 text-xs font-semibold gap-1.5 border-destructive/30 hover:bg-destructive/10"
              >
                Retry
              </Button>
            </div>
          ) : banners.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
              <h3 className="text-sm font-semibold text-foreground">No active banners in this placement</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                The storefront currently shows its fallback default hardcoded content for this slot. Create a banner to display custom content.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={openNewBannerModal}
                className="mt-4 text-xs font-semibold gap-1.5"
              >
                <Plus size={13} />
                Create First Banner
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {banners.map((banner, index) => {
                const imgUrl = banner.desktopAsset?.storageKey
                  ? `/uploads/${banner.desktopAsset.storageKey}`
                  : banner.desktopImageUrl || "";

                return (
                  <div
                    key={banner.id}
                    className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-primary/40"
                  >
                    {/* Left: Drag / Order Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveOrder(index, "up")}
                          className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <MoveUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === banners.length - 1}
                          onClick={() => handleMoveOrder(index, "down")}
                          className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <MoveDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Image Thumbnail */}
                      <div className="relative h-14 w-24 rounded-lg bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0 border border-border">
                        {imgUrl ? (
                          <Image src={imgUrl} alt={banner.alt || banner.title} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Title & Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-foreground">{banner.title}</h4>
                          {getStatusBadge(banner.status)}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {banner.linkHref ? `Links to: ${banner.linkHref}` : "No link attached"}
                          {banner.startsAt ? ` · From ${new Date(banner.startsAt).toLocaleDateString()}` : ""}
                          {banner.endsAt ? ` · Until ${new Date(banner.endsAt).toLocaleDateString()}` : ""}
                        </p>
                        {banner.metrics && (
                          <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                            Impressions: {banner.metrics.impressions} · Clicks: {banner.metrics.clicks} · CTR: {banner.metrics.ctr}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(banner)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          banner.active
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {banner.active ? "Active" : "Inactive"}
                      </button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditBannerModal(banner)}
                        className="h-8 text-xs font-semibold gap-1"
                      >
                        <Edit2 size={12} />
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setBannerToDelete(banner)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Banner Editor Modal */}
      {isEditorOpen && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-3xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  {editingBanner.id ? `Edit Banner: ${editingBanner.title}` : `New Banner (${currentPlacement.label})`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Aspect Ratio Hint & Warning */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs flex items-center justify-between">
                <span>
                  Slot Recommended Dimensions: <strong>{currentPlacement.recommendedSize} ({currentPlacement.aspectRatio})</strong>
                </span>
                <span className="font-semibold text-primary uppercase text-[10px]">
                  Preset: {currentPlacement.preset}
                </span>
              </div>

              {aspectRatioWarning && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{aspectRatioWarning}</span>
                </div>
              )}

              {/* Title & Placement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Internal Title *</label>
                  <Input
                    value={editingBanner.title || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                    placeholder="e.g. Back to School Hero Slide 1"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Alt Text (Accessibility) *</label>
                  <Input
                    value={editingBanner.alt || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, alt: e.target.value })}
                    placeholder="e.g. High-performance gaming laptops deal banner"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Desktop Image Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Desktop Image URL / Asset</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => openMediaPicker("desktop")}
                    className="h-7 text-xs text-primary gap-1.5"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    Choose from Library
                  </Button>
                </div>
                <Input
                  value={editingBanner.desktopImageUrl || ""}
                  onChange={(e) => {
                    const url = e.target.value;
                    setEditingBanner({ ...editingBanner, desktopImageUrl: url });
                    checkAspectRatio(url);
                  }}
                  placeholder="https://... or /uploads/..."
                  className="h-9 text-xs font-mono"
                />
              </div>

              {/* Mobile Image Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Mobile Image URL (Optional)</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => openMediaPicker("mobile")}
                    className="h-7 text-xs text-primary gap-1.5"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    Choose Mobile Asset
                  </Button>
                </div>
                <Input
                  value={editingBanner.mobileImageUrl || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, mobileImageUrl: e.target.value })}
                  placeholder="Optional separate mobile banner image..."
                  className="h-9 text-xs font-mono"
                />
              </div>

              {/* Headline, Subtext & CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Headline (Overlay)</label>
                  <Input
                    value={editingBanner.headline || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, headline: e.target.value })}
                    placeholder="Mega Student Deal"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">CTA Label</label>
                  <Input
                    value={editingBanner.ctaLabel || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaLabel: e.target.value })}
                    placeholder="Shop Now"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Destination Link Href</label>
                  <Input
                    value={editingBanner.linkHref || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, linkHref: e.target.value })}
                    placeholder="/shop?deal=flash"
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Scheduling: StartsAt & EndsAt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    Start Schedule (Optional)
                  </label>
                  <Input
                    type="datetime-local"
                    value={editingBanner.startsAt ? editingBanner.startsAt.slice(0, 16) : ""}
                    onChange={(e) =>
                      setEditingBanner({
                        ...editingBanner,
                        startsAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    End Schedule (Optional)
                  </label>
                  <Input
                    type="datetime-local"
                    value={editingBanner.endsAt ? editingBanner.endsAt.slice(0, 16) : ""}
                    onChange={(e) =>
                      setEditingBanner({
                        ...editingBanner,
                        endsAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Live Preview Toggle */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Live Visual Preview</span>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted border border-border">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("desktop")}
                      className={`px-2 py-1 rounded text-xs flex items-center gap-1 cursor-pointer ${
                        previewDevice === "desktop" ? "bg-background font-bold shadow-2xs" : "text-muted-foreground"
                      }`}
                    >
                      <Monitor className="h-3 w-3" />
                      Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("mobile")}
                      className={`px-2 py-1 rounded text-xs flex items-center gap-1 cursor-pointer ${
                        previewDevice === "mobile" ? "bg-background font-bold shadow-2xs" : "text-muted-foreground"
                      }`}
                    >
                      <Smartphone className="h-3 w-3" />
                      Mobile
                    </button>
                  </div>
                </div>

                {/* Preview Box */}
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-border flex justify-center">
                  <div
                    className={`relative rounded-lg overflow-hidden border border-border bg-neutral-950 text-white ${
                      previewDevice === "desktop" ? "w-full aspect-[16/5]" : "w-[320px] aspect-[16/9]"
                    }`}
                  >
                    {editingBanner.desktopImageUrl ? (
                      <Image
                        src={
                          previewDevice === "mobile" && editingBanner.mobileImageUrl
                            ? editingBanner.mobileImageUrl
                            : editingBanner.desktopImageUrl
                        }
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                        No image specified
                      </div>
                    )}
                    {editingBanner.headline && (
                      <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4">
                        <p className="text-sm font-bold text-white drop-shadow">{editingBanner.headline}</p>
                        {editingBanner.ctaLabel && (
                          <span className="mt-1 text-[10px] font-bold px-2 py-1 bg-primary text-primary-foreground rounded w-fit">
                            {editingBanner.ctaLabel}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border flex items-center justify-between bg-card">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditorOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>

              <Button
                size="sm"
                onClick={handleSaveBanner}
                disabled={isSaving}
                className="text-xs font-bold gap-1.5"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Save Banner
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal inside Banner Editor */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Select Asset from Media Library</h3>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(false)}
                className="p-1 rounded hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {mediaLoading ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : mediaAssets.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">No media assets found.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => handleSelectMediaAsset(asset)}
                      className="group relative aspect-square rounded-lg border border-border overflow-hidden cursor-pointer hover:border-primary transition-all"
                    >
                      <Image
                        src={`/uploads/${asset.storageKey}`}
                        alt={asset.alt || asset.originalFilename || "Media asset"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center p-1 text-[10px] text-white text-center">
                        <span className="truncate">{asset.originalFilename}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border pt-3 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setIsMediaPickerOpen(false)} className="text-xs">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(bannerToDelete)}
        onOpenChange={(open) => !open && setBannerToDelete(null)}
        title="Delete Banner"
        variant="danger"
        confirmLabel="Delete Banner"
        loading={isDeleting}
        description={`Are you sure you want to delete banner "${bannerToDelete?.title}" from slot "${bannerToDelete?.placement}"? The slot will fall back to default content if no other banners remain.`}
        onConfirm={handleDeleteBannerConfirm}
      />
    </div>
  );
}

export default function BannerManagerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-64 flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Loading banner manager...</span>
        </div>
      }
    >
      <BannerManagerContent />
    </Suspense>
  );
}
