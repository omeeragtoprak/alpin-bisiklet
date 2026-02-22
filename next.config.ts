import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    proxyClientMaxBodySize: "100mb", // 100MB — API upload route'ları için (middleware body limit)
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "alpinbisiklet.com" },
      { protocol: "https", hostname: "*.alpinbisiklet.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
