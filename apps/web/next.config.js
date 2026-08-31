/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // required by @opennextjs/cloudflare: bundles a self-contained server instead of relying on dynamic require() against node_modules
  experimental: {
    optimizePackageImports: ['react', 'react-dom']
  },
  images: {
    unoptimized: true, // sharp (native binary) doesn't run in the Workers runtime
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  compress: true,
  poweredByHeader: false
}

module.exports = nextConfig

const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare')
initOpenNextCloudflareForDev()