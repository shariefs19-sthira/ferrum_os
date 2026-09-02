import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Footer from '../components/Footer'
import SiteHeader from '../components/SiteHeader'
import JsonLd from '../components/JsonLd'
import NewsletterSignup from '../components/NewsletterSignup'
import CookieConsent from '../components/CookieConsent'
import Concierge from '../components/Concierge'
import { SITE_BASE_URL } from '../lib/siteConfig'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
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
        <JsonLd />
        <SiteHeader />
        {children}
        <Footer />
        <NewsletterSignup />
        <CookieConsent />
        <Concierge />
      </body>
    </html>
  )
}
