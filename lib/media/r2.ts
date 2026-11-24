import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

let r2ClientInstance: S3Client | null = null;

/**
 * Checks whether all required Cloudflare R2 environment variables are present.
 */
export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
}

/**
 * Returns a singleton instance of the S3Client configured for Cloudflare R2.
 */
export function getR2Client(): S3Client {
  if (r2ClientInstance) return r2ClientInstance;

  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Cloudflare R2 is missing required credentials: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY."
    );
  }

  r2ClientInstance = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return r2ClientInstance;
}

/**
 * Constructs the public CDN URL for an R2 object key.
 */
export function getR2PublicUrl(key: string): string {
  const cleanKey = key.replace(/^\/+/, "");
  const publicBase = (process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").trim().replace(/\/+$/, "");

  if (publicBase) {
    return `${publicBase}/${cleanKey}`;
  }

  // Fallback to r2.cloudflarestorage.com if public custom domain is not yet configured
  const accountId = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET_NAME;
  return `https://${bucket}.${accountId}.r2.cloudflarestorage.com/${cleanKey}`;
}

export interface R2UploadResult {
  url: string;
  key: string;
  name: string;
  bytes: number;
  contentType: string;
}

/**
 * Uploads a buffer directly to Cloudflare R2 with Cloudflare Free Tier edge caching headers.
 */
export async function uploadBufferToR2(params: {
  buffer: Buffer;
  key: string;
  contentType: string;
  fileName?: string;
  cacheControl?: string;
}): Promise<R2UploadResult> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME?.trim();

  if (!bucket) {
    throw new Error("R2_BUCKET_NAME is not configured.");
  }

  const cleanKey = params.key.replace(/^\/+/, "");
  // Optimal caching for Cloudflare Free Tier CDN:
  // s-maxage=31536000 tells Cloudflare Edge to cache for 1 year, preserving the 10M read free quota.
  const cacheControl =
    params.cacheControl || "public, max-age=31536000, s-maxage=31536000, immutable";

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: cleanKey,
    Body: params.buffer,
    ContentType: params.contentType,
    CacheControl: cacheControl,
  });

  await client.send(command);

  return {
    url: getR2PublicUrl(cleanKey),
    key: cleanKey,
    name: params.fileName || cleanKey.split("/").pop() || cleanKey,
    bytes: params.buffer.length,
    contentType: params.contentType,
  };
}

/**
 * Deletes an object from Cloudflare R2 by its key.
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  if (!isR2Configured()) return false;
  try {
    const client = getR2Client();
    const bucket = process.env.R2_BUCKET_NAME?.trim();
    const cleanKey = key.replace(/^\/+/, "");

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: cleanKey,
      })
    );
    return true;
  } catch (error) {
    console.error("[deleteFromR2] Error deleting object from R2:", error);
    return false;
  }
}

/**
 * Checks if an object exists in Cloudflare R2.
 */
export async function checkR2ObjectExists(key: string): Promise<boolean> {
  if (!isR2Configured()) return false;
  try {
    const client = getR2Client();
    const bucket = process.env.R2_BUCKET_NAME?.trim();
    const cleanKey = key.replace(/^\/+/, "");

    await client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: cleanKey,
      })
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Tests connection to Cloudflare R2.
 */
export async function testR2Connection(): Promise<{ success: boolean; message: string }> {
  if (!isR2Configured()) {
    return {
      success: false,
      message: "Cloudflare R2 credentials (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME) are not fully configured.",
    };
  }

  try {
    const testKey = `_healthcheck/${Date.now()}.txt`;
    const testBuffer = Buffer.from("R2 Connection Health Check OK");
    const result = await uploadBufferToR2({
      buffer: testBuffer,
      key: testKey,
      contentType: "text/plain",
      cacheControl: "no-cache",
    });

    // Clean up test file
    await deleteFromR2(testKey);

    return {
      success: true,
      message: `Successfully connected to R2 bucket '${process.env.R2_BUCKET_NAME}'. Upload & delete verified. Sample URL: ${result.url}`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Failed to connect to Cloudflare R2: ${msg}`,
    };
  }
}
