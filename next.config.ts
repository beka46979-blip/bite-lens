import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Включаем standalone режим для Docker
  output: 'standalone',
  
  // Prevent Turbopack from bundling native Node.js packages used by Finik
  serverExternalPackages: ['@mancho.devs/authorizer', 'node-jose'],
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.twcstorage.ru',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
