import { NextRequest, NextResponse } from "next/server";

function isAdminRequest(request: NextRequest) {
  return request.cookies.get("admin_authenticated")?.value === "true";
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

    if (!privateKey || !endpoint) {
      return NextResponse.json(
        {
          error:
            "ImageKit is not configured. Set IMAGEKIT_PRIVATE_KEY and NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT.",
        },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const folder = String(formData.get("folder") || "/laptop-point/products");
    const originalName = file.name || "product-image";
    const safeName = originalName.replace(/\s+/g, "-");

    const uploadBody = new FormData();
    uploadBody.append("file", file);
    uploadBody.append("fileName", safeName);
    uploadBody.append("folder", folder);
    uploadBody.append("useUniqueFileName", "true");

    const basicAuth = Buffer.from(`${privateKey}:`).toString("base64");
    const imagekitRes = await fetch(
      "https://upload.imagekit.io/api/v1/files/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
        },
        body: uploadBody,
      },
    );

    const imagekitJson = await imagekitRes.json();

    if (!imagekitRes.ok) {
      return NextResponse.json(
        {
          error: imagekitJson?.message || "Image upload failed",
        },
        { status: imagekitRes.status },
      );
    }

    return NextResponse.json({
      url: imagekitJson.url as string,
      fileId: imagekitJson.fileId as string,
      name: imagekitJson.name as string,
      thumbnailUrl: imagekitJson.thumbnailUrl as string,
    });
  } catch (error) {
    console.error("[POST /api/admin/imagekit/upload]", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
