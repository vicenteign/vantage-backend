import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  eslint: {
    // Deshabilitar ESLint durante el build para producción
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Deshabilitar verificación de tipos durante el build para producción
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
