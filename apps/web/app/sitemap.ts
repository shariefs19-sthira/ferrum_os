import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ferrum_os'
  
  const productRoutes = [
    '/landintel',
    '/boq-pro',
    '/structura',
    '/promarket',
    '/buildos',
    '/procurehub',
    '/investflow',
    '/communitybuild',
    '/resources',
    '/resources/blog',
    '/resources/blog/is-1200-vs-cesmm4',
    '/resources/blog/monsoon-concreting',
    '/resources/blog/ulin-explained',
    '/resources/case-studies'
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
  ]
}