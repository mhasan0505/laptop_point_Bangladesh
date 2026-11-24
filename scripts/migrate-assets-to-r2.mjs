import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

// Load environment variables from .env or .env.production
const projectRoot = process.cwd();
const envFiles = [".env.production", ".env.local", ".env"];
for (const envFile of envFiles) {
  const p = path.join(projectRoot, envFile);
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)?\s*$/);
      if (match && !process.env[match[1]]) {
        const val = (match[2] || "").trim().replace(/^['"](.*)['"]$/, "$1");
        process.env[match[1]] = val;
      }
    }
  }
}

const accountId = process.env.R2_ACCOUNT_ID?.trim();
const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
const bucket = process.env.R2_BUCKET_NAME?.trim();
const publicBase = (process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").trim().replace(/\/+$/, "");

const isDryRun = process.argv.includes("--dry-run");

if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
  console.error("❌ Missing required Cloudflare R2 environment variables:");
  if (!accountId) console.error("   - R2_ACCOUNT_ID is missing");
  if (!accessKeyId) console.error("   - R2_ACCESS_KEY_ID is missing");
  if (!secretAccessKey) console.error("   - R2_SECRET_ACCESS_KEY is missing");
  if (!bucket) console.error("   - R2_BUCKET_NAME is missing");
  console.error("\nPlease configure them in your .env or .env.production file.");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const MIME_TYPES = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".ico": "image/x-icon",
};

const TARGET_FOLDERS = [
  "products",
  "brands",
  "brand_logo",
  "bank_logo",
  "payment_logo",
  "Hero",
  "background",
  "testimonials",
  "uploads",
];

const publicDir = path.join(projectRoot, "public");
const manifestPath = path.join(projectRoot, "app", "data", "r2-migration-manifest.json");

function getFilesRecursively(dir, root = dir) {
  if (!fs.existsSync(dir)) return [];
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getFilesRecursively(full, root));
    } else {
      const rel = path.relative(root, full).replace(/\\/g, "/");
      files.push({ full, rel });
    }
  }

  return files;
}

async function uploadFileToR2(filePath, s3Key) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const buffer = fs.readFileSync(filePath);
  const size = buffer.length;

  // Cloudflare Free Tier Edge Cache Optimization:
  // 1-year edge caching saves R2 Class B read quotas
  const cacheControl = "public, max-age=31536000, s-maxage=31536000, immutable";

  // Check if already in R2 with matching size (saves Class A write quota!)
  try {
    const head = await s3.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: s3Key,
      })
    );
    if (head.ContentLength === size) {
      return { skipped: true, size, contentType };
    }
  } catch {
    // File does not exist yet; proceed to upload
  }

  if (isDryRun) {
    return { skipped: false, size, contentType, dryRun: true };
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: cacheControl,
    })
  );

  return { skipped: false, size, contentType };
}

async function run() {
  console.log("==================================================");
  console.log(`🚀 CLOUDFLARE R2 ASSET MIGRATION ${isDryRun ? "(DRY RUN)" : ""}`);
  console.log("==================================================");
  console.log(`Bucket:      ${bucket}`);
  console.log(`Public URL:  ${publicBase || `https://${bucket}.${accountId}.r2.cloudflarestorage.com`}`);
  console.log(`Public Dir:  ${publicDir}\n`);

  let manifest = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch {
      manifest = {};
    }
  }

  let totalUploaded = 0;
  let totalSkipped = 0;
  let totalBytes = 0;

  for (const folder of TARGET_FOLDERS) {
    const folderDir = path.join(publicDir, folder);
    const files = getFilesRecursively(folderDir, publicDir);

    if (files.length === 0) continue;
    console.log(`📁 Scanning [${folder}] (${files.length} files)...`);

    for (const file of files) {
      const s3Key = file.rel; // e.g. "products/hp/.../main.jpg"
      const publicUrl = publicBase
        ? `${publicBase}/${s3Key}`
        : `https://${bucket}.${accountId}.r2.cloudflarestorage.com/${s3Key}`;

      try {
        const result = await uploadFileToR2(file.full, s3Key);
        totalBytes += result.size;

        if (result.skipped) {
          totalSkipped++;
        } else {
          totalUploaded++;
          console.log(`  ✓ Uploaded: ${s3Key} (${(result.size / 1024).toFixed(1)} KB)`);
        }

        manifest[`/${s3Key}`] = {
          s3Key,
          publicUrl,
          sizeBytes: result.size,
          contentType: result.contentType,
          uploadedAt: new Date().toISOString(),
        };
      } catch (err) {
        console.error(`  ❌ Failed to upload ${s3Key}:`, err?.message || err);
      }
    }
  }

  if (!isDryRun) {
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  }

  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  console.log("\n==================================================");
  console.log(`🎉 Migration Finished!`);
  console.log(`   Uploaded:  ${totalUploaded} file(s)`);
  console.log(`   Skipped:   ${totalSkipped} file(s) (already exists)`);
  console.log(`   Total Size: ${totalMB} MB`);
  console.log(`   Manifest:  ${manifestPath}`);
  console.log("==================================================\n");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
