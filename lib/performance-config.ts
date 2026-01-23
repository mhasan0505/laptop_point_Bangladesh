/**
 * Performance optimization configurations
 */

export const performanceConfig = {
  // Image optimization
  images: {
    quality: 85,
    formats: ["image/avif", "image/webp"],
  },

  // Script loading strategy
  scripts: {
    analytics: "afterInteractive",
    thirdParty: "lazyOnload",
  },

  // Font optimization
  fonts: {
    display: "swap", // Show fallback immediately
    preload: true,
  },

  // Caching headers
  cacheControl: {
    static: "public, max-age=31536000, immutable",
    dynamic: "public, max-age=3600, s-maxage=3600",
    api: "private, max-age=60",
  },

  // Bundle splitting
  bundling: {
    compress: true,
    swcMinify: true,
  },
};

export default performanceConfig;
