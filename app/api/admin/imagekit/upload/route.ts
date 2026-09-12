import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "/laptop-point/products";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try ImageKit upload first if private key is present
    if (privateKey) {
      try {
        const ikFormData = new FormData();
        const base64File = buffer.toString("base64");
        ikFormData.append("file", base64File);
        ikFormData.append("fileName", file.name);
        ikFormData.append("folder", folder);
        ikFormData.append("useUniqueFileName", "true");

        const authHeader = `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`;

        const ikResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
          method: "POST",
          headers: {
            Authorization: authHeader,
          },
          body: ikFormData,
        });

        if (ikResponse.ok) {
          const ikData = (await ikResponse.json()) as { url: string; name: string };
          return NextResponse.json({ url: ikData.url, name: ikData.name });
        } else {
          const errText = await ikResponse.text();
          console.warn("[ImageKit upload API error, using local fallback]", errText);
        }
      } catch (ikErr) {
        console.warn("[ImageKit fetch failed, using local fallback]", ikErr);
      }
    }

    // Fallback: save to local public/products/uploads
    const uploadDir = path.join(process.cwd(), "public", "products", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const targetPath = path.join(uploadDir, safeName);
    await fs.writeFile(targetPath, buffer);

    const publicUrl = `/products/uploads/${safeName}`;
    return NextResponse.json({ url: publicUrl, name: safeName });
  } catch (error) {
    console.error("[ImageKit Upload Route Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image upload failed" },
      { status: 500 },
    );
  }
}
