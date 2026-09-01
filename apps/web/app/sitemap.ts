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
    '/products/transact',
    '/dashboard',
    '/project-workspace',
  ]

  // /account and /admin/leads are deliberately excluded — both are
  // authenticated/internal surfaces (post-W2-326 auth, W2-328 admin lead
  // view), not public marketing/content pages, so they don't belong in a
  // public sitemap. /forgot-password is public and unauthenticated like
  // /login and /signup, so it's included alongside them.
  const topLevelRoutes = [
    '/about',
    '/about/timeline',
    '/careers',
    '/contact',
    '/demo',
    '/documentation',
    '/forgot-password',
    '/get-started',
    '/login',
    '/partners',
    '/pricing',
    '/privacy',
    '/signup',
    '/terms',
  ]

  // W2-333: sitemap.ts route count must match the actual `next build`
  // route count exactly (diff=0). Full apps/web/app/resources/** tree,
  // excluding the private `_template` folder (Next.js underscore-prefixed
  // folders are not routes, so it never appears in the build output).
  const articleRoutes = [
    '/resources',
    '/resources/blog',
    '/resources/blog/advanced-ulpin',
    '/resources/blog/cement-storage-humidity',
    '/resources/blog/construction-insurance-101',
    '/resources/blog/formwork-pressure-calculation',
    '/resources/blog/foundation-retrofit-costs',
    '/resources/blog/gst-for-builders',
    '/resources/blog/home-loan-margins',
    '/resources/blog/is-1200-vs-cesmm4',
    '/resources/blog/monsoon-concreting',
    '/resources/blog/monsoon-structural-checks',
    '/resources/blog/piling-quality-gates',
    '/resources/blog/prefab-connection-detailing',
    '/resources/blog/procurement-terms',
    '/resources/blog/rera-compliance',
    '/resources/blog/seismic-retrofit-timeline',
    '/resources/blog/site-safety-checklist',
    '/resources/blog/steel-price-hedges',
    '/resources/blog/tunnel-form-construction',
    '/resources/blog/ulin-explained',
    '/resources/blog/weld-inspection-basics',
    '/resources/case-studies',
    '/resources/case-studies/airport-cargo-bay',
    '/resources/case-studies/clinic-retrofit',
    '/resources/case-studies/contractor-fleet',
    '/resources/case-studies/greenfield-developer',
    '/resources/case-studies/infrastructure-contractor',
    '/resources/case-studies/library-retrofit',
    '/resources/case-studies/municipal-market-retrofit',
    '/resources/case-studies/self-build-family',
    '/resources/checklists',
    '/resources/checklists/concrete-pour-readiness',
    '/resources/checklists/crane-lift-plan',
    '/resources/checklists/crane-maintenance',
    '/resources/checklists/handover-documents',
    '/resources/checklists/material-receiving',
    '/resources/checklists/retrofit-handover',
    '/resources/checklists/scaffold-handover',
    '/resources/checklists/structural-punch-list',
    '/resources/events',
    '/resources/events/webinars-2026',
    '/resources/faq',
    '/resources/glossary',
    '/resources/guides',
    '/resources/guides/contractor-onboarding',
    '/resources/guides/monsoon-preparedness-audit',
    '/resources/guides/site-handover-playbook',
    '/resources/is-code-guides',
    '/resources/podcasts',
    '/resources/reports',
    '/resources/templates',
    '/resources/tools',
    '/resources/videos',
    '/resources/webinars',
    '/resources/whitepapers',
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
    ...topLevelRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...articleRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
