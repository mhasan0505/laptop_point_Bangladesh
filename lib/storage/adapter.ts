import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import { UploadStageError, sanitizeDetail } from "@/lib/media/upload-errors";

export interface StorageAdapter {
  put(buffer: Buffer, key: string, mime: string): Promise<string>;
  delete(key: string): Promise<void>;
  url(key: string): string;
}

const DEFAULT_UPLOAD_DIR = path.resolve(process.cwd(), "public", "uploads");
let hasLoggedUploadDir = false;

export function getResolvedUploadDir(): string {
  if (!hasLoggedUploadDir) {
    console.log(`[Upload] Resolved upload directory: ${DEFAULT_UPLOAD_DIR}`);
    hasLoggedUploadDir = true;
  }
  return DEFAULT_UPLOAD_DIR;
}

// Log once at startup when module is loaded
getResolvedUploadDir();

export class LocalStorageAdapter implements StorageAdapter {
  private baseDir: string;
  private publicPrefix: string;

  constructor(baseDir?: string, publicPrefix = "/uploads") {
    this.baseDir = baseDir || getResolvedUploadDir();
    this.publicPrefix = publicPrefix;
  }

  async put(buffer: Buffer, key: string, _mime?: string): Promise<string> {
    void _mime;
    const filename = path.basename(key);
    const targetPath = path.join(this.baseDir, filename);
    const targetDir = path.dirname(targetPath);

    // 1. mkdir stage
    try {
      await mkdir(targetDir, { recursive: true });
    } catch (err: unknown) {
      const code = (err as any)?.code || null;
      const rawMsg = (err as Error)?.message || "Failed to create directory";
      console.error(`[Upload] Storage mkdir stage failed: [${code}] ${rawMsg}`, err);
      throw new UploadStageError("mkdir", sanitizeDetail(rawMsg), code, err);
    }

    // 2. write_file stage
    try {
      await writeFile(targetPath, buffer);
    } catch (err: unknown) {
      const code = (err as any)?.code || null;
      const rawMsg = (err as Error)?.message || "Failed to write file";
      console.error(`[Upload] Storage write_file stage failed: [${code}] ${rawMsg}`, err);
      throw new UploadStageError("write_file", sanitizeDetail(rawMsg), code, err);
    }

    return this.url(filename);
  }

  async delete(key: string): Promise<void> {
    const filename = path.basename(key);
    const targetPath = path.join(this.baseDir, filename);
    try {
      await unlink(targetPath);
    } catch (e: unknown) {
      if ((e as { code?: string })?.code !== "ENOENT") {
        throw e;
      }
    }
  }

  url(key: string): string {
    const filename = path.basename(key);
    return `${this.publicPrefix}/${filename}`;
  }
}

// Default export uses local filesystem; structure permits switching to an S3-compatible adapter later
export const storageAdapter: StorageAdapter = new LocalStorageAdapter();
