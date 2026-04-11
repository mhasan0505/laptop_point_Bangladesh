import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireAdminRole } from "../../_utils/auth";
import { logCatalogError } from "../../_utils/events";

export const runtime = "nodejs";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const getExtension = (file: File) => {
  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  if (fileExtension) {
    return fileExtension;
  }

  const mimeExtension = file.type.split("/").pop()?.toLowerCase();
  return mimeExtension || "bin";
};

const buildObjectKey = (
  file: File,
  metadata: {
    sku?: string;
    slug?: string;
    brand?: string;
    model?: string;
  },
) => {
  const prefix =
    slugify(metadata.slug || "") ||
    slugify(metadata.sku || "") ||
    slugify(`${metadata.brand || ""}-${metadata.model || ""}`) ||
    "product-image";
  const extension = getExtension(file);
  const uniqueSuffix = `${Date.now()}-${randomUUID().slice(0, 8)}`;

  return `products/${prefix}/${prefix}-${uniqueSuffix}.${extension}`;
};

export async function POST(request: NextRequest) {
  const auth = requireAdminRole(request, ["owner", "manager", "editor"]);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (
      !accountId ||
      !accessKeyId ||
      !secretAccessKey ||
      !bucketName ||
      !publicUrl
    ) {
      return NextResponse.json(
        {
          error:
            "Image upload is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL.",
        },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "only image files are allowed" },
        { status: 400 },
      );
    }

    const objectKey = buildObjectKey(file, {
      sku: String(formData.get("sku") || ""),
      slug: String(formData.get("slug") || ""),
      brand: String(formData.get("brand") || ""),
      model: String(formData.get("model") || ""),
    });

    const client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    const normalizedPublicUrl = publicUrl.replace(/\/$/, "");
    const fileUrl = `${normalizedPublicUrl}/${objectKey}`;

    return NextResponse.json({
      url: fileUrl,
      key: objectKey,
      bytes: file.size,
      format: getExtension(file),
    });
  } catch (error) {
    logCatalogError("upload.image", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
