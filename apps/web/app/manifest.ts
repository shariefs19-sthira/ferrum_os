import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ferrum OS',
    short_name: 'Ferrum',
    description: 'The OS for the future of construction',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3B82F6',
    // W2-368: the previous 16/32/apple-touch PNG entries pointed at files
    // that never existed in the repo (dead 404 references). SVG-only is the
    // real, working icon — generating actual PNG variants needs a
    // rasterizer (e.g. sharp) that isn't a current dependency; adding one
    // touches package.json/pnpm-lock.yaml, a RULE 6 protected path needing
    // explicit approval, so this stays SVG-only pending that.
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}