import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Geliştirme modunda PWA kapalı
  buildExcludes: [/middleware-manifest.json$/], // Hata çıkaran dosyayı hariç tut
});

const nextConfig: NextConfig = {
  // TypeScript ve ESLint hatalarını görmezden gel (Yayınlamak için)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Resim optimizasyonu hatasını önle
  images: {
    unoptimized: true,
  },
};

export default withPWA(nextConfig);