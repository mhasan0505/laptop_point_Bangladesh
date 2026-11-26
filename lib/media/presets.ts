import type sharpType from "sharp";
import type { Metadata } from "sharp";
import { MEDIA_PRESETS } from "./presets-config";

import { UploadStageError, sanitizeDetail } from "./upload-errors";

export * from "./presets-config";

export const MAX_PIXELS = 8000 * 8000; // 64 million pixels limitInputPixels

export type DetectedImageFormat = "webp" | "png" | "jpeg" | "gif" | "avif";

const FORMAT_MIME: Record<DetectedImageFormat, string> = {
  webp: "image/webp",
  png: "image/png",
  jpeg: "image/jpeg",
  gif: "image/gif",
  avif: "image/avif",
};

type SharpFn = typeof sharpType;
let sharpLoader: Promise<SharpFn | null> | null = null;

function isCloudflareWorkersRuntime(): boolean {
  if (typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers") {
    return true;
  }
  return (
    process.env.NODE_ENV === "production" &&
    Boolean((globalThis as Record<symbol, unknown>)[Symbol.for("__cloudflare-context__")])
  );
}

/**
 * Lazily loads `sharp` only on Node.js runtimes where native addons are supported.
 * On Cloudflare Workers (`workerd`), returns null so uploads fall back to pure-JS
 * binary header inspection and let ImageKit/R2 serve the asset cleanly.
 */
async function loadSharp(): Promise<SharpFn | null> {
  if (isCloudflareWorkersRuntime()) return null;
  if (!sharpLoader) {
    sharpLoader = (async () => {
      try {
        const mod = await import("sharp");
        const fn = ((mod as unknown as { default?: SharpFn }).default ?? mod) as SharpFn;
        if (typeof fn !== "function") return null;
        fn.concurrency?.(1);
        fn.cache?.(false);
        return fn;
      } catch {
        return null;
      }
    })();
  }
  return sharpLoader;
}

/** Pure-JS binary header parser used when native `sharp` is unavailable (e.g. Cloudflare Workers). */
export function inspectImageHeader(buf: Buffer): {
  format: DetectedImageFormat;
  contentType: string;
  width: number;
  height: number;
} | null {
  if (buf.length < 12) return null;

  // PNG: 8-byte signature + IHDR chunk (width at 16, height at 20)
  if (
    buf.length >= 24 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a &&
    buf.toString("ascii", 12, 16) === "IHDR"
  ) {
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    if (width > 0 && height > 0) {
      return { format: "png", contentType: FORMAT_MIME.png, width, height };
    }
    return null;
  }

  // GIF: GIF87a / GIF89a
  if (buf.length >= 10 && buf.toString("ascii", 0, 4) === "GIF8") {
    const width = buf.readUInt16LE(6);
    const height = buf.readUInt16LE(8);
    if (width > 0 && height > 0) {
      return { format: "gif", contentType: FORMAT_MIME.gif, width, height };
    }
    return null;
  }

  // WebP: RIFF....WEBP
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8 " && buf.length >= 30) {
      const width = buf.readUInt16LE(26) & 0x3fff;
      const height = buf.readUInt16LE(28) & 0x3fff;
      if (width > 0 && height > 0) {
        return { format: "webp", contentType: FORMAT_MIME.webp, width, height };
      }
    } else if (chunk === "VP8L" && buf.length >= 25) {
      const bits = buf.readUInt32LE(21);
      const width = (bits & 0x3fff) + 1;
      const height = ((bits >> 14) & 0x3fff) + 1;
      if (width > 0 && height > 0) {
        return { format: "webp", contentType: FORMAT_MIME.webp, width, height };
      }
    } else if (chunk === "VP8X" && buf.length >= 30) {
      const width = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
      const height = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
      if (width > 0 && height > 0) {
        return { format: "webp", contentType: FORMAT_MIME.webp, width, height };
      }
    }
    return { format: "webp", contentType: FORMAT_MIME.webp, width: 800, height: 600 };
  }

  // JPEG: FF D8 FF ... scan SOF markers
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    let offset = 2;
    while (offset + 4 < buf.length) {
      if (buf[offset] !== 0xff) break;
      while (offset < buf.length && buf[offset] === 0xff) offset++;
      if (offset >= buf.length) break;
      const marker = buf[offset++];
      // Standalone markers without length
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
        continue;
      }
      if (offset + 2 > buf.length) break;
      const segmentLength = buf.readUInt16BE(offset);
      if (segmentLength < 2 || offset + segmentLength > buf.length) break;
      const isSof =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf);
      if (isSof && offset + 7 < buf.length) {
        const height = buf.readUInt16BE(offset + 3);
        const width = buf.readUInt16BE(offset + 5);
        if (width > 0 && height > 0) {
          return { format: "jpeg", contentType: FORMAT_MIME.jpeg, width, height };
        }
        break;
      }
      offset += segmentLength;
    }
    return { format: "jpeg", contentType: FORMAT_MIME.jpeg, width: 800, height: 600 };
  }

  // AVIF: ISO BMFF ftyp box
  if (buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, 12);
    if (brand === "avif" || brand === "avis") {
      // Search for `ispe` box (4-byte size + "ispe" + 4-byte version/flags + 4-byte width + 4-byte height)
      const ispeIdx = buf.indexOf(Buffer.from("ispe", "ascii"));
      if (ispeIdx >= 4 && ispeIdx + 16 <= buf.length) {
        const width = buf.readUInt32BE(ispeIdx + 8);
        const height = buf.readUInt32BE(ispeIdx + 12);
        if (width > 0 && height > 0 && width <= 65535 && height <= 65535) {
          return { format: "avif", contentType: FORMAT_MIME.avif, width, height };
        }
      }
      return { format: "avif", contentType: FORMAT_MIME.avif, width: 800, height: 600 };
    }
  }

  return null;
}

export interface ProcessedVariant {
  width: number;
  height: number;
  format: "webp" | "avif";
  key: string;
  url: string;
  bytes: number;
  buffer: Buffer;
}

export interface SkippedVariant {
  width: number;
  format: "webp" | "avif";
  reason: string;
}

export interface PresetGenerationResult {
  mainBuffer: Buffer;
  mainWidth: number;
  mainHeight: number;
  mainBytes: number;
  mainFormat: DetectedImageFormat;
  mainContentType: string;
  variants: ProcessedVariant[];
  skippedVariants: SkippedVariant[];
}

export async function generatePresetVariants(
  inputBuffer: Buffer,
  baseKey: string,
  presetName: string = "card",
  options: { mainOnly?: boolean } = {}
): Promise<PresetGenerationResult> {
  const preset = MEDIA_PRESETS[presetName] || MEDIA_PRESETS.card;
  const sharp = await loadSharp();

  if (!sharp) {
    const inspected = inspectImageHeader(inputBuffer);
    if (!inspected) {
      throw new UploadStageError("sharp_decode", "Unsupported or corrupted image file");
    }
    if (inspected.width * inspected.height > MAX_PIXELS) {
      throw new UploadStageError("sharp_decode", "Image too large");
    }
    return {
      mainBuffer: inputBuffer,
      mainWidth: inspected.width,
      mainHeight: inspected.height,
      mainBytes: inputBuffer.length,
      mainFormat: inspected.format,
      mainContentType: inspected.contentType,
      variants: [],
      skippedVariants: [],
    };
  }

  let meta: Metadata;
  try {
    const pipeline = sharp(inputBuffer, {
      failOn: "none",
      limitInputPixels: MAX_PIXELS,
    }).rotate();
    meta = await pipeline.metadata();
  } catch (err: unknown) {
    const rawMsg = (err as Error)?.message || "";
    let detail = sanitizeDetail(rawMsg || "Failed to decode image metadata");
    if (rawMsg.includes("pixel limit") || rawMsg.includes("limitInputPixels")) {
      detail = "Image too large";
    }
    throw new UploadStageError("sharp_decode", detail, (err as any)?.code, err);
  }

  const originalWidth = meta.width || 800;
  const originalHeight = meta.height || 600;

  // Process main optimized webp buffer
  const maxPresetWidth = Math.max(...preset.widths);
  const targetMainWidth = Math.min(originalWidth, maxPresetWidth);

  let mainWebp: Buffer;
  try {
    mainWebp = await sharp(inputBuffer, {
      failOn: "none",
      limitInputPixels: MAX_PIXELS,
    })
      .rotate()
      .resize({
        width: targetMainWidth,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
  } catch (err: unknown) {
    const rawMsg = (err as Error)?.message || "";
    let detail = sanitizeDetail(rawMsg || "Failed to generate main WebP variant");
    if (rawMsg.includes("pixel limit") || rawMsg.includes("limitInputPixels")) {
      detail = "Image too large";
    }
    throw new UploadStageError("resize_variant", detail, (err as any)?.code, err);
  }

  let mainMeta: Partial<Metadata>;
  try {
    mainMeta = await sharp(mainWebp, {
      failOn: "none",
      limitInputPixels: MAX_PIXELS,
    }).metadata();
  } catch {
    mainMeta = {};
  }
  const mainWidth = mainMeta.width || targetMainWidth;
  const mainHeight =
    mainMeta.height || Math.round((targetMainWidth * originalHeight) / originalWidth);
  const mainBytes = mainWebp.length;

  const variants: ProcessedVariant[] = [];
  const skippedVariants: SkippedVariant[] = [];

  // Remote storage (ImageKit) serves its own transforms; skip the costly
  // per-width WebP/AVIF set when only the main file is needed.
  const variantWidths = options.mainOnly ? [] : preset.widths;

  for (const width of variantWidths) {
    for (const format of preset.formats) {
      const variantWidth = Math.min(originalWidth, width);
      const stageName = `variant_${format}_${width}w`;

      try {
        const instance = sharp(inputBuffer, {
          failOn: "none",
          limitInputPixels: MAX_PIXELS,
        })
          .rotate()
          .resize({
            width: variantWidth,
            fit: "inside",
            withoutEnlargement: true,
          });

        let buf: Buffer;
        if (format === "avif") {
          try {
            // AVIF with effort: 2 to cut memory/CPU
            buf = await instance.avif({ quality: 80, effort: 2 }).toBuffer();
          } catch (avifErr: unknown) {
            // If AVIF generation fails, still save the WebP + original and mark AVIF as skipped
            const avifMsg = (avifErr as Error)?.message || "AVIF encoding failed";
            console.warn(
              `[Upload] AVIF generation failed for ${width}w, marking AVIF as skipped: ${avifMsg}`
            );
            skippedVariants.push({
              width,
              format: "avif",
              reason: sanitizeDetail(avifMsg),
            });
            continue;
          }
        } else {
          buf = await instance.webp({ quality: 85 }).toBuffer();
        }

        const vMeta = await sharp(buf, {
          failOn: "none",
          limitInputPixels: MAX_PIXELS,
        }).metadata();
        const variantKey = `${baseKey}-${width}w.${format}`;

        variants.push({
          width: vMeta.width || variantWidth,
          height:
            vMeta.height || Math.round((variantWidth * originalHeight) / originalWidth),
          format,
          key: variantKey,
          url: `/uploads/${variantKey}`,
          bytes: buf.length,
          buffer: buf,
        });
      } catch (err: unknown) {
        const rawMsg = (err as Error)?.message || "";
        let detail = sanitizeDetail(rawMsg || `Failed to generate ${format} variant`);
        if (rawMsg.includes("pixel limit") || rawMsg.includes("limitInputPixels")) {
          detail = "Image too large";
        }
        throw new UploadStageError(stageName, detail, (err as any)?.code, err);
      }
    }
  }

  return {
    mainBuffer: mainWebp,
    mainWidth,
    mainHeight,
    mainBytes,
    mainFormat: "webp",
    mainContentType: FORMAT_MIME.webp,
    variants,
    skippedVariants,
  };
}
