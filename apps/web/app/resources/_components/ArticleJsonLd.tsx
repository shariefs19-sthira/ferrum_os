type ArticleJsonLdProps = {
  headline: string
  description: string
  url: string
}

export function ArticleJsonLd({ headline, description, url }: ArticleJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url,
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
