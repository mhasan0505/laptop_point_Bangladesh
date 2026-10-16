import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".json"];

function resolveCandidate(basePath) {
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
    return basePath;
  }
  for (const ext of EXTENSIONS) {
    const candidate = `${basePath}${ext}`;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  for (const ext of EXTENSIONS) {
    const indexCandidate = path.join(basePath, `index${ext}`);
    if (fs.existsSync(indexCandidate) && fs.statSync(indexCandidate).isFile()) {
      return indexCandidate;
    }
  }
  return basePath;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "next/cache") {
    return {
      format: "module",
      shortCircuit: true,
      url: "data:text/javascript,export function revalidatePath(){}; export function revalidateTag(){}; export const unstable_cache = (fn) => fn;",
    };
  }
  let target = specifier;
  if (specifier.startsWith("@/")) {
    const subpath = specifier.slice(2);
    target = path.resolve(process.cwd(), subpath);
    target = resolveCandidate(target);
    return nextResolve(pathToFileURL(target).href, context);
  } else if (specifier.startsWith("./") || specifier.startsWith("../")) {
    // Also resolve relative extensionless imports from within project files
    if (context.parentURL && context.parentURL.startsWith("file:")) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      const relativeTarget = path.resolve(parentDir, specifier);
      const resolved = resolveCandidate(relativeTarget);
      if (resolved !== relativeTarget) {
        return nextResolve(pathToFileURL(resolved).href, context);
      }
    }
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".json")) {
    const raw = fs.readFileSync(new URL(url), "utf-8");
    return {
      format: "json",
      shortCircuit: true,
      source: raw,
    };
  }
  return nextLoad(url, context);
}
