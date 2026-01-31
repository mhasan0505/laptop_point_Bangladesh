import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tailwindcss/postcss"],
  images: {
    formats: ["image/avif", "image/webp"],
    loader: "default",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    // Set to true if images with spaces in paths don't work in production
    unoptimized: process.env.NODE_ENV === "production" ? true : false,
    dangerouslyAllowSVG: true,
  },
  compress: true,
  productionBrowserSourceMaps: false,
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  // SEO Redirects
  async redirects() {
    return [
      // Redirect common spelling variations
      {
        source: "/laptop-bd",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/used-laptops",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/used-laptop",
        destination: "/shop",
        permanent: true,
      },
      // Bangladesh district redirects
      {
        source: "/dhaka-laptops",
        destination: "/shop?location=dhaka",
        permanent: false,
      },
      {
        source: "/chittagong-laptops",
        destination: "/shop?location=chittagong",
        permanent: false,
      },
      // Redirect old /products/* routes to /product/*
      {
        source: "/products/:slug",
        destination: "/product/:slug",
        permanent: true,
      },
      // Redirect /products to /shop
      {
        source: "/products",
        destination: "/shop",
        permanent: true,
      },
      // Block and redirect invalid locale routes
      {
        source: "/vi/:path*",
        destination: "/:path*",
        permanent: true,
      },
      // Block standalone /products/hp route
      {
        source: "/products/hp",
        destination: "/shop",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, s-maxage=300",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/products/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(self), microphone=(), camera=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
