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
    '/resources'
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