import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import type { JobDefinition, JobResult } from "./types.ts";
import { loadMergedRawProducts } from "@/lib/products-storage";
import { readBanners } from "@/lib/banners/storage";

export const pruneOrphanUploadsJob: JobDefinition = {
  id: "prune-orphan-uploads",
  name: "Prune Orphan Uploads (Report Only)",
  description: "Scans /public/uploads against catalog and banner references to identify unlinked files without deleting them.",
  schedule: "0 3 * * *", // Daily at 3:00 AM

  run: async (): Promise<JobResult> => {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    // Gather referenced images
    const [products, banners] = await Promise.all([
      loadMergedRawProducts().catch(() => []),
      readBanners().catch(() => []),
    ]);

    const referencedFilenames = new Set<string>();

    function recordUrl(url: unknown) {
      if (typeof url === "string" && url.includes("/uploads/")) {
        const filename = path.basename(url.split("?")[0]);
        if (filename) referencedFilenames.add(filename);
      }
    }

    for (const p of products) {
      if (Array.isArray(p.images)) {
        p.images.forEach(recordUrl);
      }
    }

    for (const b of banners) {
      if (b.desktopImageUrl) recordUrl(b.desktopImageUrl);
      if (b.mobileImageUrl) recordUrl(b.mobileImageUrl);
    }

    let diskFiles: string[] = [];
    try {
      diskFiles = await readdir(uploadsDir);
    } catch (err: unknown) {
      return {
        message: `Uploads directory not accessible: ${err instanceof Error ? err.message : String(err)}`,
        data: { error: true },
      };
    }

    const orphans: { filename: string; size: number }[] = [];
    let totalOrphanBytes = 0;

    for (const filename of diskFiles) {
      if (filename === ".gitkeep" || filename.startsWith(".")) continue;

      // Responsive variants (`<base>-<w>w.webp|avif`) belong to their main file.
      const variantBase = filename.match(/^(.*)-d+w.(?:webp|avif)$/);
      if (variantBase) {
        const owner = [...referencedFilenames].some(
          (ref) => ref.replace(/.[^.]+$/, "") === variantBase[1],
        );
        if (owner) continue;
      }

      if (!referencedFilenames.has(filename)) {
        const filePath = path.join(uploadsDir, filename);
        try {
          const fileStat = await stat(filePath);
          if (fileStat.isFile()) {
            orphans.push({ filename, size: fileStat.size });
            totalOrphanBytes += fileStat.size;
          }
        } catch {
          // ignore transient stat error
        }
      }
    }

    const totalFiles = diskFiles.filter((f) => f !== ".gitkeep" && !f.startsWith(".")).length;
    const sizeMb = (totalOrphanBytes / (1024 * 1024)).toFixed(2);

    const message = orphans.length === 0
      ? `Scan complete: All ${totalFiles} uploaded files are referenced in catalog or banners. No orphans.`
      : `Scan complete: Found ${orphans.length} orphaned files (${sizeMb} MB) out of ${totalFiles} total uploads. Report-only mode; 0 files deleted.`;

    return {
      message,
      data: {
        totalFiles,
        referencedCount: referencedFilenames.size,
        orphanCount: orphans.length,
        orphanBytes: totalOrphanBytes,
        sampleOrphans: orphans.slice(0, 10).map((o) => o.filename),
      },
    };
  },
};
