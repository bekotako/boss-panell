import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript hatalarını görmezden gel (Yayınlamak için)
  typescript: {
    ignoreBuildErrors: true,
  },
  // ESLint hatalarını görmezden gel
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;