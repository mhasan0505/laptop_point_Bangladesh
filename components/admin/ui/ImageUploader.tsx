"use client";

import * as React from "react";
import Image from "next/image";
import {
  UploadCloud,
  X,
  Loader2,
  AlertCircle,
  FolderOpen,
  Search,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ImageUploaderProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  description?: string;
  disabled?: boolean;
  preset?: string;
  className?: string;
}

interface LibraryAsset {
  id: string;
  storageKey: string;
  originalFilename: string;
  alt: string;
  preset: string | null;
  width: number;
  height: number;
}

export function ImageUploader({
  value,
  onChange,
  multiple = false,
  maxFiles = 10,
  label,
  description = "PNG, JPG, WebP up to 16MB",
  disabled = false,
  preset = "card",
  className,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Media Library modal state
  const [isLibraryOpen, setIsLibraryOpen] = React.useState(false);
  const [libraryAssets, setLibraryAssets] = React.useState<LibraryAsset[]>([]);
  const [libraryLoading, setLibraryLoading] = React.useState(false);
  const [librarySearch, setLibrarySearch] = React.useState("");

  const images: string[] = React.useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
  }, [value]);

  const handleUpload = async (files: FileList | File[]) => {
    if (disabled || files.length === 0) return;
    setError(null);
    setIsUploading(true);

    const fileArray = Array.from(files);
    const uploadedUrls: string[] = [];

    try {
      for (const file of fileArray) {
        if (!file.type.startsWith("image/")) {
          throw new Error(`"${file.name}" is not an image file.`);
        }
        if (file.size > 16 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds the 16MB size limit.`);
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("preset", preset);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const stage = data.stage ? ` [stage: ${data.stage}]` : "";
          const detail = data.detail
            ? `: ${data.detail}`
            : data.error
            ? `: ${data.error}`
            : "";
          throw new Error(`Upload failed for "${file.name}"${stage}${detail}`);
        }

        const data = await res.json();
        if (data.url) {
          uploadedUrls.push(data.url);
        }
      }

      if (multiple) {
        const nextImages = [...images, ...uploadedUrls].slice(0, maxFiles);
        onChange(nextImages);
      } else {
        if (uploadedUrls.length > 0) {
          onChange(uploadedUrls[0]);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setError(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    if (disabled) return;
    if (multiple) {
      const nextImages = images.filter((_, i) => i !== indexToRemove);
      onChange(nextImages);
    } else {
      onChange("");
    }
  };

  const openLibraryModal = async () => {
    setIsLibraryOpen(true);
    setLibraryLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setLibraryAssets(data.assets || []);
      }
    } catch {
      // ignore
    } finally {
      setLibraryLoading(false);
    }
  };

  const handleSelectFromLibrary = (asset: LibraryAsset) => {
    const assetUrl = `/uploads/${asset.storageKey}`;
    if (multiple) {
      if (!images.includes(assetUrl)) {
        onChange([...images, assetUrl].slice(0, maxFiles));
      }
    } else {
      onChange(assetUrl);
      setIsLibraryOpen(false);
    }
  };

  const filteredLibraryAssets = React.useMemo(() => {
    if (!librarySearch.trim()) return libraryAssets;
    const q = librarySearch.toLowerCase();
    return libraryAssets.filter(
      (a) =>
        a.originalFilename.toLowerCase().includes(q) ||
        a.storageKey.toLowerCase().includes(q) ||
        (a.alt && a.alt.toLowerCase().includes(q))
    );
  }, [libraryAssets, librarySearch]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files) {
      handleUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        {label && (
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
            {label}
          </span>
        )}
        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={openLibraryModal}
            className="h-7 px-2.5 text-xs text-primary hover:text-primary gap-1.5"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Choose from library
          </Button>
        )}
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 select-none",
          "border-border bg-card/50 hover:bg-muted/40 hover:border-primary/50",
          isDragging && "border-primary bg-primary/5 scale-[0.99]",
          disabled && "opacity-50 cursor-not-allowed hover:border-border hover:bg-card/50",
          isUploading && "pointer-events-none"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          multiple={multiple}
          disabled={disabled || isUploading}
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <UploadCloud className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {isUploading
                ? "Uploading image & generating WebP/AVIF..."
                : "Click or drag images to upload"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg border border-danger/30 bg-danger-soft text-danger text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Previews Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
          {images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="group relative aspect-video sm:aspect-square rounded-lg border border-border bg-muted/40 overflow-hidden shadow-xs"
            >
              <Image
                src={url}
                alt={`Uploaded preview ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 20vw"
                className="object-cover transition-transform group-hover:scale-105"
                unoptimized
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(idx);
                  }}
                  className="absolute top-1.5 right-1.5 h-6 w-6 rounded-md bg-black/70 hover:bg-danger text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                  title="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Media Library Picker Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-3xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Choose Asset from Media Library
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 border-b border-border bg-muted/20">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Filter media library..."
                  className="h-8.5 pl-9 text-xs"
                />
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {libraryLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Loading library assets...</span>
                </div>
              ) : filteredLibraryAssets.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No assets found in the library matching your search.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {filteredLibraryAssets.map((asset) => {
                    const assetUrl = `/uploads/${asset.storageKey}`;
                    const isSelected = images.includes(assetUrl);

                    return (
                      <div
                        key={asset.id}
                        onClick={() => handleSelectFromLibrary(asset)}
                        className={cn(
                          "group relative aspect-square rounded-lg border overflow-hidden cursor-pointer transition-all",
                          isSelected
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-primary/60"
                        )}
                      >
                        <Image
                          src={assetUrl}
                          alt={asset.alt || asset.originalFilename}
                          fill
                          sizes="150px"
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center text-white text-[10px]">
                          <span className="truncate">{asset.originalFilename}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border flex justify-end bg-card">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsLibraryOpen(false)}
                className="text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
