// Matches the baseUrl convention already used in apps/web/app/sitemap.ts and
// robots.ts. That placeholder domain is a pre-existing gap in the codebase
// (not introduced here) — swap all three in one pass once the real
// production domain is known.
const SITE_BASE_URL = 'https://ferrum_os'

type ArticleJsonLdProps = {
  headline: string
  description: string
  /** Site-relative path, e.g. "/resources/blog/advanced-ulpin". */
  url: string
}

export function ArticleJsonLd({ headline, description, url }: ArticleJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url: `${SITE_BASE_URL}${url}`,
    publisher: {
      '@type': 'Organization',
      name: 'Ferrum OS',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
