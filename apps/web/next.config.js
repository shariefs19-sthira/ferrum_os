/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // static export for classic Cloudflare Pages hosting (W2-238)
  experimental: {
    optimizePackageImports: ['react', 'react-dom']
    // optimizeCss (critters) was tried under W2-342's RULE-6 narrow
    // approval and reverted: it built cleanly but produced no change to
    // the exported HTML (still a plain blocking <link rel="stylesheet">,
    // no inlined critical CSS) — a known Next.js 14.x limitation, App
    // Router + output:'export' doesn't run optimizeCss's postProcessHTML
    // hook. Confirmed via Lighthouse (no measurable LCP change) before
    // removing the now-pointless `critters` devDependency. Don't re-add
    // without first checking Next's release notes for App-Router
    // static-export support.
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