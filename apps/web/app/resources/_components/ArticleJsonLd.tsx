// Real production domain, per apps/web/components/JsonLd.tsx's Organization
// schema (the site-wide root-layout JSON-LD). sitemap.ts and robots.ts were
// still on a placeholder domain until this fix.
const SITE_BASE_URL = 'https://www.ferrumos.com'

type ArticleJsonLdProps = {
  headline: string
  description: string
  /** Site-relative path, e.g. "/resources/blog/advanced-ulpin". */
  url: string
  /**
   * ISO date (YYYY-MM-DD) this page's content actually went live to the
   * public. Optional and intentionally omitted for content not yet
   * deployed -- CLAUDE-20260918-RESOURCE-RESEARCH-CASES-LIVE's release
   * correction pass: a `datePublished` claim in public Article schema
   * before the page is actually live is an unverified date, not a fact.
   * Set it only when it's the confirmed first-live date for this content.
   */
  datePublished?: string
  /**
   * The publicly-attributable author, recorded as an Organization (not a
   * Person — no named human author exists for these pages). MUST be a
   * truthful public identity (e.g. "Ferrum OS Editorial Team"), never an
   * internal seat/agent codename (CLAUDE, SCRIBE, CRANE, Qoder-CN, ...) --
   * those never enter public-facing schema. registry.test.ts asserts this
   * for every page under /resources/research-cases.
   */
  authorSeat: string
  // image intentionally omitted: no real article images exist yet. Wire it in
  // once real assets are available rather than fabricating a placeholder URL.
}

export function ArticleJsonLd({ headline, description, url, datePublished, authorSeat }: ArticleJsonLdProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url: `${SITE_BASE_URL}${url}`,
    author: {
      '@type': 'Organization',
      name: authorSeat,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ferrum OS',
    },
  }
  if (datePublished) schema.datePublished = datePublished

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
