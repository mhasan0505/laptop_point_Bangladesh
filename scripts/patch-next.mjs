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

// Patch @opennextjs/aws cookie default-import interop bug with cookie@1.x
// (cookie@1.1.1 sets __esModule=true with named exports only, causing
// `import cookieParser from "cookie"` to resolve to `undefined` in esbuild/workerd).
const openNextAwsRoots = [];
const directAws = path.resolve(process.cwd(), "node_modules/@opennextjs/aws");
if (fs.existsSync(directAws)) openNextAwsRoots.push(directAws);

const pnpmStoreDir = path.resolve(process.cwd(), "node_modules/.pnpm");
if (fs.existsSync(pnpmStoreDir)) {
  for (const entry of fs.readdirSync(pnpmStoreDir)) {
    if (entry.startsWith("@opennextjs+aws@")) {
      const candidate = path.join(pnpmStoreDir, entry, "node_modules", "@opennextjs", "aws");
      if (fs.existsSync(candidate)) openNextAwsRoots.push(candidate);
    }
  }
}

for (const awsRoot of new Set(openNextAwsRoots)) {
  for (const converter of ["edge.js", "node.js"]) {
    const file = path.join(awsRoot, "dist", "overrides", "converters", converter);
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf-8");
    if (content.includes('import cookieParser from "cookie";')) {
      const patched = content.replace(
        'import cookieParser from "cookie";',
        'import * as cookieParser from "cookie";'
      );
      fs.writeFileSync(file, patched, "utf-8");
      totalPatched++;
      console.log(`[patch-next] Patched OpenNext cookie import: ${path.relative(process.cwd(), file)}`);
    }
  }
}

console.log(`[patch-next] Done. Patched ${totalPatched} file(s).`);

