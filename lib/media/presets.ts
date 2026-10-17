import sharp, { type Metadata } from "sharp";
import { MEDIA_PRESETS } from "./presets-config";

import { UploadStageError, sanitizeDetail } from "./upload-errors";

export * from "./presets-config";

// Apply global sharp settings for uploads
sharp.concurrency(1);
sharp.cache(false);

export const MAX_PIXELS = 8000 * 8000; // 64 million pixels limitInputPixels

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
    variants,
    skippedVariants,
  };
}
