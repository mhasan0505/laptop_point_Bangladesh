import fs from "node:fs";
import path from "node:path";

const targetFiles = [
  "node_modules/next/dist/compiled/next-server/app-page-experimental.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/app-page-turbo-experimental.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/app-page.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/app-route-experimental.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/app-route-turbo-experimental.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/pages-api.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/pages-turbo.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/pages.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/use-cache-probe-worker-experimental.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/use-cache-probe-worker-turbo-experimental.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/use-cache-probe-worker-turbo.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/use-cache-probe-worker.runtime.dev.js",
  "node_modules/next/dist/esm/server/api-utils/index.js",
  "node_modules/next/dist/server/api-utils/index.js",
];

let totalPatched = 0;

for (const relPath of targetFiles) {
  const fullPath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, "utf-8");
  let modified = false;

  // Replace rawHeaders.hasOwnProperty(...)
  if (content.includes("rawHeaders.hasOwnProperty(")) {
    content = content.replaceAll(
      "rawHeaders.hasOwnProperty(",
      "Object.prototype.hasOwnProperty.call(rawHeaders, "
    );
    modified = true;
  }

  // Replace headers.hasOwnProperty(...)
  if (content.includes("headers.hasOwnProperty(")) {
    content = content.replaceAll(
      "headers.hasOwnProperty(",
      "Object.prototype.hasOwnProperty.call(headers, "
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, "utf-8");
    totalPatched++;
    console.log(`[patch-next] Patched: ${relPath}`);
  }
}

console.log(`[patch-next] Done. Patched ${totalPatched} file(s).`);

