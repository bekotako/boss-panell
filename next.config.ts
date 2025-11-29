import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Geliştirme modunda PWA yapma
});

const nextConfig: NextConfig = {
  // TypeScript hatalarını görmezden gel (Build için)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Resim optimizasyonu (Vercel için gerekli olabilir)
  images: {
    unoptimized: true,
  },
};

export default withPWA(nextConfig);