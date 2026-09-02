import { MetadataRoute } from 'next'
import { SITE_BASE_URL } from '../lib/siteConfig'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_BASE_URL

  // W2-333: regenerated from the actual `next build` route output
  // (apps/web/app/**/page.tsx, excluding the private `_template` folder)
  // rather than hand-maintained — acceptance criteria is parity diff=0
  // against the real build, verified at commit time via sitemap.xml's
  // <loc> count matching the exported .html count exactly.
  //
  // Deliberately excluded (2 routes): /account and /admin/leads — both
  // are authenticated/internal surfaces (W2-326 auth, W2-328 admin lead
  // view), not public marketing/content pages a sitemap should list.

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
