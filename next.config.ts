import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tailwindcss/postcss"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
};

export default nextConfig;
