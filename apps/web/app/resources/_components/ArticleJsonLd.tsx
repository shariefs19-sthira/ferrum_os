// Real production domain, per apps/web/components/JsonLd.tsx's Organization
// schema (the site-wide root-layout JSON-LD). sitemap.ts and robots.ts were
// still on a placeholder domain until this fix.
const SITE_BASE_URL = 'https://www.ferrumos.com'

type ArticleJsonLdProps = {
  headline: string
  description: string
  /** Site-relative path, e.g. "/resources/blog/advanced-ulpin". */
  url: string
  /** ISO date (YYYY-MM-DD) the page's content first landed on main, per `git log --follow`. */
  datePublished: string
  /** The seat that authored the page content, recorded as an Organization (not a Person — no named human author exists for these pages). */
  authorSeat: string
  // image intentionally omitted: no real article images exist yet. Wire it in
  // once real assets are available rather than fabricating a placeholder URL.
}

export function ArticleJsonLd({ headline, description, url, datePublished, authorSeat }: ArticleJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url: `${SITE_BASE_URL}${url}`,
    datePublished,
    author: {
      '@type': 'Organization',
      name: authorSeat,
    },
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
