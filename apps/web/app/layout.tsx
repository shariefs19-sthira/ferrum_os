import './globals.css'
import Footer from '../components/Footer'
import JsonLd from '../components/JsonLd'
import NewsletterSignup from '../components/NewsletterSignup'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body><JsonLd /><Footer />{children}<NewsletterSignup /></body>
    </html>
  )
}

