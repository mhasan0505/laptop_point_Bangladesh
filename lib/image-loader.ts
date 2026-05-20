import { ImageLoader } from "next/image";
import { getOptimizedImageUrl } from "./imagekit";

/**
 * Custom image loader for Next.js Image component
 * Handles local images with spaces in paths properly, and integrates ImageKit CDN
 */
export const customImageLoader: ImageLoader = ({ src, width, quality }) => {
  const imagekitEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  // If ImageKit is configured, optimize via ImageKit
  if (imagekitEndpoint) {
    return getOptimizedImageUrl(src, width, quality);
  }

  // For external URLs, return as-is
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // For local images, ensure proper path handling
  // Remove leading slash if present for relative paths
  const normalizedSrc = src.startsWith("/") ? src.slice(1) : src;

  // In development, return the path as-is
  if (process.env.NODE_ENV === "development") {
    return `/${normalizedSrc}`;
  }

  // In production, use the Next.js image optimization API
  // Encode the path properly for the API
  const encodedSrc = encodeURIComponent(normalizedSrc);
  return `/_next/image?url=${encodedSrc}&w=${width}&q=${quality || 75}`;
};

/**
 * Get the proper image source path
 * Ensures compatibility between development and production
 */
export const getImageSrc = (src: string | { src: string }): string => {
  if (typeof src === "string") {
    return src;
  }
  return src.src || "";
};
