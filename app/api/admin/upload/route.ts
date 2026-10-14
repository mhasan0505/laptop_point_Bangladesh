import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { generatePresetVariants } from "@/lib/media/presets";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const preset = (formData.get("preset") as string) || "card";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Try ImageKit upload first if private key configured
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (privateKey) {
      try {
        const ikFormData = new FormData();
        const base64File = buffer.toString("base64");
        ikFormData.append("file", base64File);
        ikFormData.append("fileName", file.name);
        ikFormData.append("folder", `/laptop-point/${preset}`);
        ikFormData.append("useUniqueFileName", "true");

        const authHeader = `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`;
        const ikResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
          method: "POST",
          headers: { Authorization: authHeader },
          body: ikFormData,
        });

        if (ikResponse.ok) {
          const ikData = (await ikResponse.json()) as { url: string; name: string };
          return NextResponse.json({
            url: ikData.url,
            name: ikData.name,
            originalFilename: file.name,
            bytes: buffer.length,
          });
        }
      } catch (ikErr) {
        console.warn("[ImageKit upload failed, falling back to local storage]", ikErr);
      }
    }

    // 2. Local sharp WebP conversion & disk storage
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const cleanBase = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();
    const uniqueBase = `${Date.now()}-${cleanBase}`;

    try {
      const presetResult = await generatePresetVariants(buffer, uniqueBase, preset);
      const mainFilename = `${uniqueBase}.webp`;
      const targetPath = path.join(uploadDir, mainFilename);
      await fs.writeFile(targetPath, presetResult.mainBuffer);

      // Save additional generated variants if any
      for (const variant of presetResult.variants) {
        const vPath = path.join(uploadDir, path.basename(variant.key));
        await fs.writeFile(vPath, variant.buffer).catch(() => {});
      }

      const publicUrl = `/uploads/${mainFilename}`;
      return NextResponse.json({
        url: publicUrl,
        name: mainFilename,
        originalFilename: file.name,
        width: presetResult.mainWidth,
        height: presetResult.mainHeight,
        bytes: presetResult.mainBytes,
        variants: presetResult.variants.map((v) => ({
          width: v.width,
          height: v.height,
          format: v.format,
          url: v.url,
          bytes: v.bytes,
        })),
      });
    } catch {
      // Fallback: save raw buffer directly without sharp conversion
      const ext = path.extname(file.name) || ".png";
      const fallbackFilename = `${uniqueBase}${ext}`;
      const fallbackPath = path.join(uploadDir, fallbackFilename);
      await fs.writeFile(fallbackPath, buffer);

      const publicUrl = `/uploads/${fallbackFilename}`;
      return NextResponse.json({
        url: publicUrl,
        name: fallbackFilename,
        originalFilename: file.name,
        bytes: buffer.length,
      });
    }
  } catch (error) {
    console.error("[api/admin/upload POST] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Image upload failed",
        stage: "upload",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json({ error: "Missing url query param" }, { status: 400 });
    }

    if (targetUrl.startsWith("/uploads/")) {
      const filename = path.basename(targetUrl.split("?")[0]);
      const filePath = path.join(process.cwd(), "public", "uploads", filename);
      await fs.unlink(filePath).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    );
  }
}
