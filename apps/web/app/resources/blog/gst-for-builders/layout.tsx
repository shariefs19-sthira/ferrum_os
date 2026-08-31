import { Metadata } from 'next'
import { ArticleJsonLd } from '../../_components/ArticleJsonLd'

export const metadata: Metadata = {
  title: 'GST for Builders and Developers - Ferrum OS',
  description: 'Tax credit, reverse charge, and the 80% ITC rule in practice for builders and developers managing GST compliance.',
  openGraph: {
    title: 'GST for Builders and Developers - Ferrum OS',
    description: 'Tax credit, reverse charge, and the 80% ITC rule in practice for builders and developers managing GST compliance.',
    type: 'article',
    locale: 'en_US',
  },
}

export default function GstForBuildersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ArticleJsonLd
        headline={metadata.title as string}
        description={metadata.description as string}
        url="/resources/blog/gst-for-builders"
      />
      {children}
    </>
  )
}
