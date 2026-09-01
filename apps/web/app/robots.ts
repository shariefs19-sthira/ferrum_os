import { MetadataRoute } from 'next'
import { SITE_BASE_URL } from '../lib/siteConfig'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: `${SITE_BASE_URL}/sitemap.xml`,
  }
}
