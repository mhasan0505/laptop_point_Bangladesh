import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, "public");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = path.join(projectRoot, "backups", `public-assets-${timestamp}`);

// Folders to back up safely
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

function copyFolderRecursive(src, dest) {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dest, { recursive: true });

  let count = 0;
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      count += copyFolderRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }

  return count;
}

function calculateDirSize(dir) {
  if (!fs.existsSync(dir)) return 0;
  let totalBytes = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      totalBytes += calculateDirSize(fullPath);
    } else {
      totalBytes += fs.statSync(fullPath).size;
    }
  }

  return totalBytes;
}

console.log("==================================================");
console.log("🛡️  PUBLIC ASSETS SAFETY BACKUP");
console.log("==================================================");
console.log(`Source:      ${publicDir}`);
console.log(`Destination: ${backupDir}\n`);

let totalFilesCopied = 0;

for (const folder of TARGET_FOLDERS) {
  const src = path.join(publicDir, folder);
  const dest = path.join(backupDir, folder);
  if (fs.existsSync(src)) {
    const copied = copyFolderRecursive(src, dest);
    totalFilesCopied += copied;
    console.log(`  ✓ Backed up [${folder}]: ${copied} files`);
  }
}

const totalBytes = calculateDirSize(backupDir);
const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

console.log("\n==================================================");
console.log(`✅ Backup Completed Successfully!`);
console.log(`   Total Files:  ${totalFilesCopied}`);
console.log(`   Total Size:   ${totalMB} MB`);
console.log(`   Backup Path:  ${backupDir}`);
console.log("==================================================\n");
