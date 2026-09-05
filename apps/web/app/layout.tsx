import { Metadata } from 'next'
import { DM_Sans, Space_Grotesk } from 'next/font/google'
import './globals.css'
import Footer from '../components/Footer'
import SiteHeader from '../components/SiteHeader'
import JsonLd from '../components/JsonLd'
import NewsletterSignup from '../components/NewsletterSignup'
import CookieConsent from '../components/CookieConsent'
import Concierge from '../components/Concierge'
import ErrorBoundary from '../components/ErrorBoundary'
import { SITE_BASE_URL, SOCIAL_CARD_ALT, SOCIAL_CARD_PATH } from '../lib/siteConfig'
import MotionObserver from '../components/MotionObserver'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' })

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  metadataBase: new URL(SITE_BASE_URL),
  title: {
    default: 'Ferrum OS - AI-native construction platform for India',
    template: '%s | Ferrum OS',
  },
  description:
    'Ferrum OS is an India-first, AI-native construction platform covering land intelligence, design, structural checks, BOQ, procurement, and project finance.',
  openGraph: {
    title: 'Ferrum OS - AI-native construction platform for India',
    description:
      'Ferrum OS is an India-first, AI-native construction platform covering land intelligence, design, structural checks, BOQ, procurement, and project finance.',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ferrum OS - AI-native construction platform for India',
    description:
      'Ferrum OS is an India-first, AI-native construction platform covering land intelligence, design, structural checks, BOQ, procurement, and project finance.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'))" }} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Route-level Open Graph objects replace inherited image fields, so the
            canonical social card belongs in the shared document head. */}
        <meta property="og:image" content={`${SITE_BASE_URL}${SOCIAL_CARD_PATH}`} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={SOCIAL_CARD_ALT} />
        {/* twitter:card itself now comes from the metadata.twitter export
            above — a duplicate raw tag here would emit two conflicting
            twitter:card values in the built head. */}
        <meta name="twitter:image" content={`${SITE_BASE_URL}${SOCIAL_CARD_PATH}`} />
        <meta name="twitter:image:alt" content={SOCIAL_CARD_ALT} />
      </head>
      {/*
        W2-344: document order is header → content → footer. It previously read
        <Footer />{children}, which painted the footer at the TOP of every page;
        with no SiteHeader existing at all, that misplaced footer had been
        doubling as the site's only navigation. Both halves are fixed together
        here because neither makes sense alone — a redesigned footer is
        meaningless while it renders above the content it belongs under.
      */}
      <body>
        <MotionObserver />
        <JsonLd />
        <SiteHeader />
        <ErrorBoundary>{children}</ErrorBoundary>
        <Footer />
        <NewsletterSignup />
        <CookieConsent />
        <Concierge />
      </body>
    </html>
  )
}
