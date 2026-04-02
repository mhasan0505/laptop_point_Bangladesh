import fs from "node:fs";
import path from "node:path";

import products from "../app/data/products.json" with { type: "json" };
import manifest from "../app/data/product-image-manifest.json" with { type: "json" };

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, "public");

const normalize = (p) => {
  if (typeof p !== "string") return "";
  const trimmed = p.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const isLocalPath = (p) => p.startsWith("/") && !p.startsWith("//");

const fileExistsForPublicPath = (publicPath) => {
  const relative = publicPath.replace(/^\//, "");
  const absolute = path.join(publicDir, relative);
  return fs.existsSync(absolute);
};

const missing = [];
const seen = new Set();

for (const product of products) {
  const manifestImages = Array.isArray(manifest[product.sku])
    ? manifest[product.sku]
    : [];

  const candidateImages =
    manifestImages.length > 0 ? manifestImages : (product.images ?? []);

  for (const rawPath of candidateImages) {
    const imagePath = normalize(rawPath);
    if (!imagePath || !isLocalPath(imagePath)) continue;

    const key = `${product.sku}:${imagePath}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (!fileExistsForPublicPath(imagePath)) {
      missing.push({
        sku: product.sku,
        name: product.name,
        imagePath,
      });
    }
  }
}

if (missing.length > 0) {
  console.error(`Found ${missing.length} missing local product image path(s):`);
  for (const entry of missing) {
    console.error(`- ${entry.sku} (${entry.name}): ${entry.imagePath}`);
  }
  process.exit(1);
}

console.log("Product image validation passed.");
