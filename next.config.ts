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
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    // Disable Next.js image proxy to prevent Vercel 402 payment required limit on Hobby plan
    unoptimized: true,
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
        source: "/search",
        destination: "/shop",
        permanent: false,
      },
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
      // Convenience aliases and Linux case normalization
      {
        source: "/emi",
        destination: "/EMI",
        permanent: true,
      },
      {
        source: "/warranty",
        destination: "/returns",
        permanent: true,
      },
      {
        source: "/delivery",
        destination: "/shipping",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/returns-refund",
        destination: "/returns",
        permanent: true,
      },
      {
        source: "/privacy-policy",
        destination: "/privacy",
        permanent: true,
      },
      {
        source: "/terms-and-conditions",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/terms-of-service",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/order-tracking",
        destination: "/track-order",
        permanent: true,
      },
      {
        source: "/track",
        destination: "/track-order",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/admin/login",
        permanent: false,
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
            value: "no-store, no-cache, must-revalidate, max-age=0",
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
        source: "/bank_logo/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/payment_logo/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/Logo.webp",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, max-age=0",
          },
        ],
      },
      {
        source: "/Logo-admin.webp",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, max-age=0",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com",
              "img-src 'self' blob: data: https://ik.imagekit.io https://images.unsplash.com https://cdn.sanity.io https://*.tile.openstreetmap.org https://www.facebook.com https://www.google-analytics.com https://www.googletagmanager.com https://unpkg.com https://i.ytimg.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://ik.imagekit.io https://upload.imagekit.io https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://connect.facebook.net https://*.tile.openstreetmap.org",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.facebook.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
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
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

