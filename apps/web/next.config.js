/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // static export for classic Cloudflare Pages hosting (W2-238)
  experimental: {
    optimizePackageImports: ['react', 'react-dom']
  },
  images: {
    unoptimized: true, // static export can't run Next's server-side image optimizer
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  compress: true,
  poweredByHeader: false
}

module.exports = nextConfig