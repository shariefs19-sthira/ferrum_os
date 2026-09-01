import { Inter } from 'next/font/google'
import './globals.css'
import Footer from '../components/Footer'
import JsonLd from '../components/JsonLd'
import NewsletterSignup from '../components/NewsletterSignup'
import CookieConsent from '../components/CookieConsent'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body><JsonLd /><Footer />{children}<NewsletterSignup /><CookieConsent /></body>
    </html>
  )
}
