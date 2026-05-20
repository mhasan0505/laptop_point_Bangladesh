/**
 * ImageKit CDN Helper
 * Transforms local assets or external image URLs (e.g. Sanity) into optimized ImageKit proxy URLs.
 */
export function getOptimizedImageUrl(src: string, width?: number, quality?: number): string {
  const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!endpoint || !src) {
    return src;
  }

  // Ensure endpoint ends with a trailing slash
  const baseEndpoint = endpoint.endsWith("/") ? endpoint : `${endpoint}/`;

  // For external images (like Sanity's CDN or Unsplash), use ImageKit's web proxy
  if (src.startsWith("http://") || src.startsWith("https://")) {
    if (src.startsWith(baseEndpoint)) {
      return src;
    }

    const trs: string[] = [];
    if (width) trs.push(`w-${width}`);
    if (quality) trs.push(`q-${quality}`);
    const trParam = trs.length > 0 ? `tr:${trs.join(",")}/` : "";

    return `${baseEndpoint}${trParam}${src}`;
  }

  // For local images
  const normalizedPath = src.startsWith("/") ? src.slice(1) : src;

  const trs: string[] = [];
  if (width) trs.push(`w-${width}`);
  if (quality) trs.push(`q-${quality}`);
  const trParam = trs.length > 0 ? `tr:${trs.join(",")}/` : "";

  return `${baseEndpoint}${trParam}${normalizedPath}`;
}
