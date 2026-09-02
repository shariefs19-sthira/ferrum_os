import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Footer from '../components/Footer'
import JsonLd from '../components/JsonLd'
import NewsletterSignup from '../components/NewsletterSignup'
import CookieConsent from '../components/CookieConsent'
import Concierge from '../components/Concierge'
import { SITE_BASE_URL } from '../lib/siteConfig'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
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
      <body><JsonLd /><Footer />{children}<NewsletterSignup /><CookieConsent /><Concierge /></body>
    </html>
  )
}
