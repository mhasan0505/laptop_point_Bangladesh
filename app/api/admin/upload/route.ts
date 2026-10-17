import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { generatePresetVariants, MEDIA_PRESETS } from "@/lib/media/presets";
import { UploadStageError, sanitizeDetail } from "@/lib/media/upload-errors";
import {
  storeMediaMeta,
  getMediaMeta,
  deleteMediaMeta,
  findAssetUsages,
  deleteFromImageKit,
} from "@/lib/media/storage";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

// Keep in sync with the 16MB limit shown in components/admin/ui/ImageUploader.tsx.
// Note: Vercel serverless request bodies are capped at ~4.5MB regardless of this.
const MAX_UPLOAD_BYTES = 16 * 1024 * 1024;
const IMAGEKIT_TIMEOUT_MS = 20_000;

type Storage = "imagekit" | "local";

function fail(status: number, stage: string, error: string, extra?: Record<string, unknown>) {
  logger.logUploadError({
    stage,
    error,
    fileName: extra?.fileName as string | undefined,
    sizeBytes: extra?.sizeBytes as number | undefined,
    mimeType: extra?.mimeType as string | undefined,
  });
  return NextResponse.json({ error, stage, detail: error, ...extra }, { status });
}

/** Identify real image bytes; the client-supplied MIME type and file name are not trusted. */
function sniffImage(buf: Buffer): "png" | "jpeg" | "webp" | "gif" | "avif" | null {
  if (buf.length < 12) return null;
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (buf.toString("ascii", 0, 4) === "GIF8") return "gif";
  if (buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, 12);
    if (brand === "avif" || brand === "avis") return "avif";
  }
  return null;
}

async function uploadToImageKit(
  privateKey: string,
  buffer: Buffer,
  fileName: string,
  folder: string,
): Promise<{ url: string; name: string; fileId: string }> {
  const form = new FormData();
  form.append("file", buffer.toString("base64"));
  form.append("fileName", fileName);
  form.append("folder", folder);
  form.append("useUniqueFileName", "true");

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}` },
    body: form,
    signal: AbortSignal.timeout(IMAGEKIT_TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ImageKit responded ${res.status}${text ? `: ${sanitizeDetail(text)}` : ""}`);
  }
  const data = (await res.json()) as { url?: string; name?: string; fileId?: string };
  if (!data.url) throw new Error("ImageKit response did not include a url");
  return { url: data.url, name: data.name || fileName, fileId: data.fileId || "" };
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "marketing"] });
  if (auth.error) return auth.error;

  try {
    const cl = request.headers.get("content-length");
    if (cl && parseInt(cl, 10) > MAX_UPLOAD_BYTES) {
      return fail(413, "validate", `File is too large (max ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB)`);
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (err: unknown) {
      const msg = String((err as any)?.message || "");
      if ((err as any)?.status === 413 || /too large|payload|exceeded|body limit/i.test(msg)) {
        return fail(413, "parse", "Request body too large");
      }
      return fail(400, "parse", "Could not read the upload. Send multipart/form-data with a `file` field.");
    }

    const file = formData.get("file");
    if (!(file instanceof File)) return fail(400, "validate", "No file provided");
    if (file.size === 0) return fail(400, "validate", "The file is empty");
    if (file.size > MAX_UPLOAD_BYTES) {
      return fail(413, "validate", `File is too large (max ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB)`);
    }

    const rawPreset = String(formData.get("preset") || "card");
    const preset = Object.prototype.hasOwnProperty.call(MEDIA_PRESETS, rawPreset) ? rawPreset : "card";

    const input = Buffer.from(await file.arrayBuffer());
    const kind = sniffImage(input);
    if (!kind) {
      return fail(415, "validate", "Unsupported file. Upload a PNG, JPEG, WebP, GIF or AVIF image.");
    }

    const baseName =
      file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .replace(/_+/g, "_")
        .slice(0, 60)
        .toLowerCase() || "image";
    const uniqueBase = `${Date.now()}-${baseName}`;

    // Always re-encode: strips EXIF/GPS, guarantees a safe WebP, and rejects
    // files that only look like images. No raw-file fallback.
    let processed;
    try {
      processed = await generatePresetVariants(input, uniqueBase, preset, {
        mainOnly: Boolean(process.env.IMAGEKIT_PRIVATE_KEY),
      });
    } catch (err) {
      if (err instanceof UploadStageError) {
        return fail(422, err.stage, err.detail || "Image could not be processed");
      }
      return fail(422, "sharp_decode", "Image could not be processed");
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const warnings: string[] = [];

    // 1. ImageKit (persistent, CDN-backed) when configured.
    if (privateKey) {
      let ik: { url: string; fileId: string; name: string } | null = null;
      try {
        ik = await uploadToImageKit(
          privateKey,
          processed.mainBuffer,
          `${uniqueBase}.webp`,
          `/laptop-point/${preset}`,
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "ImageKit upload failed";
        console.error("[api/admin/upload] ImageKit failed:", msg);
        warnings.push(`ImageKit failed (${msg}); trying local storage.`);
      }

      if (ik) {
        // Store fileId and metadata in media-meta.json / DB (safely wrapped)
        try {
          await storeMediaMeta(ik.url, {
            fileId: ik.fileId,
            url: ik.url,
            name: ik.name,
            preset,
            width: processed.mainWidth,
            height: processed.mainHeight,
            bytes: processed.mainBytes,
            createdAt: new Date().toISOString(),
          });
        } catch (metaErr) {
          console.warn("[api/admin/upload] storeMediaMeta warning (upload succeeded):", metaErr);
        }

        logger.logUploadSuccess({
          fileId: ik.fileId,
          storage: "imagekit",
          fileName: ik.name,
          sizeBytes: processed.mainBytes,
          url: ik.url,
        });

        return NextResponse.json({
          url: ik.url,
          fileId: ik.fileId,
          name: ik.name,
          originalFilename: file.name,
          width: processed.mainWidth,
          height: processed.mainHeight,
          bytes: processed.mainBytes,
          storage: "imagekit" satisfies Storage,
          variants: [],
        });
      }
    }

    // 2. Local disk. Files written at runtime into /public are not served by
    //    `next start`, so refuse (instead of returning a dead URL) in production
    //    unless the host serves /uploads itself.
    const isProd = process.env.NODE_ENV === "production";
    if (isProd && process.env.ALLOW_LOCAL_UPLOADS !== "1") {
      return fail(
        503,
        "storage",
        privateKey
          ? `Image storage (ImageKit) failed: ${warnings.join(" ")}`
          : "No image storage is configured. Set IMAGEKIT_PRIVATE_KEY (or ALLOW_LOCAL_UPLOADS=1 if your host serves /public/uploads).",
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      const mainFilename = `${uniqueBase}.webp`;
      await fs.writeFile(path.join(uploadDir, mainFilename), processed.mainBuffer);

      const variantResults = await Promise.allSettled(
        processed.variants.map((v) =>
          fs.writeFile(path.join(uploadDir, path.basename(v.key)), v.buffer),
        ),
      );
      const failedVariants = variantResults.filter((r) => r.status === "rejected").length;
      if (failedVariants > 0) warnings.push(`${failedVariants} responsive variant(s) could not be saved.`);

      logger.logUploadSuccess({
        storage: "local",
        fileName: mainFilename,
        sizeBytes: processed.mainBytes,
        url: `/uploads/${mainFilename}`,
      });

      return NextResponse.json({
        url: `/uploads/${mainFilename}`,
        name: mainFilename,
        originalFilename: file.name,
        width: processed.mainWidth,
        height: processed.mainHeight,
        bytes: processed.mainBytes,
        storage: "local" satisfies Storage,
        warnings,
        variants: processed.variants.map((v) => ({
          width: v.width,
          height: v.height,
          format: v.format,
          url: v.url,
          bytes: v.bytes,
        })),
      });
    } catch (err) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code === "EROFS" || code === "EACCES" || code === "EPERM") {
        return fail(
          503,
          "write_file",
          "This server's disk is read-only. Configure IMAGEKIT_PRIVATE_KEY to store images.",
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("[api/admin/upload POST] Error:", error);
    return fail(500, "upload", "Image upload failed");
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request, { roles: ["owner", "manager", "marketing"] });
  if (auth.error) return auth.error;

  try {
    const targetUrl = new URL(request.url).searchParams.get("url");
    if (!targetUrl) return fail(400, "validate", "Missing url query param");
    const force = new URL(request.url).searchParams.get("force") === "1";

    if (!force) {
      const usages = await findAssetUsages(targetUrl);
      if (usages.length > 0) {
        return NextResponse.json(
          {
            error: `This image is in use (${usages.slice(0, 3).join(", ")}${usages.length > 3 ? "…" : ""}). Replace it first, or delete anyway with force=1.`,
            usages,
          },
          { status: 409 },
        );
      }
    }

    // Check if it's an ImageKit upload with a stored fileId
    const meta = await getMediaMeta(targetUrl);
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    if (meta?.fileId && privateKey) {
      const res = await deleteFromImageKit(meta.fileId, privateKey);
      if (!res.ok) {
        return fail(502, "imagekit_delete", res.error || "Failed to delete file from ImageKit");
      }
      await deleteMediaMeta(targetUrl);
      return NextResponse.json({ ok: true, deleted: true, storage: "imagekit", fileId: meta.fileId });
    }

    if (targetUrl.startsWith("/uploads/")) {
      const filename = path.basename(targetUrl.split("?")[0]);
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const stem = filename.replace(/\.webp$/i, "");

      // Remove the main file and its responsive variants (`<stem>-<w>w.<fmt>`).
      const entries = await fs.readdir(uploadDir).catch(() => [] as string[]);
      const victims = entries.filter(
        (f) => f === filename || (f.startsWith(`${stem}-`) && /-\d+w\.(webp|avif)$/.test(f)),
      );
      await Promise.all(victims.map((f) => fs.unlink(path.join(uploadDir, f)).catch(() => {})));
      await deleteMediaMeta(targetUrl);
      await deleteMediaMeta(filename);

      return NextResponse.json({ ok: true, deleted: victims.length > 0, removed: victims.length, storage: "local" });
    }

    if (/ik\.imagekit\.io/.test(targetUrl)) {
      return fail(404, "not_found", "Could not find fileId for the requested ImageKit asset in media metadata");
    }

    return NextResponse.json({ ok: true, deleted: false, reason: "not-a-recognized-upload" });
  } catch (error) {
    console.error("[api/admin/upload DELETE] Error:", error);
    return fail(500, "delete", "Delete failed");
  }
}
