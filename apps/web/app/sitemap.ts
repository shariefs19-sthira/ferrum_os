import { MetadataRoute } from 'next'
import { SITE_BASE_URL } from '../lib/siteConfig'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_BASE_URL

  // Canonical /products/* paths per docs/RELUME_ROUTE_MAP.md (W2-246
  // route move). /boq-pro is deliberately excluded here and kept as
  // its own top-level entry below — the protected app page and its
  // /products/boq-pro marketing counterpart coexist by design
  // (public/_redirects), and both belong in the sitemap.
  const productRoutes = [
    '/products',
    '/products/landintel',
    '/products/designstudio',
    '/products/structura',
    '/products/promarket',
    '/products/buildos',
    '/products/procurehub',
    '/products/investflow',
    '/products/communitybuild',
    '/products/boq-pro',
    '/boq-pro',
  ]

  const articleRoutes = [
    '/resources/blog',
    '/resources/blog/is-1200-vs-cesmm4',
    '/resources/blog/monsoon-concreting',
    '/resources/blog/ulin-explained',
    '/resources/case-studies',
    '/resources/case-studies/contractor-fleet',
    '/resources/case-studies/greenfield-developer',
    '/resources/case-studies/self-build-family',
  ]

  const lastModified = new Date()

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 1,
    },
    ...productRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...articleRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
