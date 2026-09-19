import { Metadata } from 'next'
import { DM_Sans, Space_Grotesk } from 'next/font/google'
import './globals.css'
import JsonLd from '../components/JsonLd'
import CookieConsent from '../components/CookieConsent'
import SiteShell from '../components/SiteShell'
import shellStyles from '../components/siteShell.module.css'
import { SITE_BASE_URL, SOCIAL_CARD_ALT, SOCIAL_CARD_PATH } from '../lib/siteConfig'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' })

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  metadataBase: new URL(SITE_BASE_URL),
  title: {
    default: 'Ferrum OS - global construction intelligence platform',
    template: '%s | Ferrum OS',
  },
  description:
    'Ferrum OS connects land intelligence, building design, structural checks, quantities, procurement, and project finance through one evidence-controlled platform.',
  openGraph: {
    title: 'Ferrum OS - global construction intelligence platform',
    description:
      'Ferrum OS connects land intelligence, building design, structural checks, quantities, procurement, and project finance through one evidence-controlled platform.',
    type: 'website',
    locale: 'en',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ferrum OS - global construction intelligence platform',
    description:
      'Ferrum OS connects land intelligence, building design, structural checks, quantities, procurement, and project finance through one evidence-controlled platform.',
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
      <body>
        <JsonLd />
        {/* .appShell (siteShell.module.css) is an ordinary <div> — no
            layout effect — unless CookieConsent.tsx marks <html
            data-cookie-variant="A"> (reserved-band screenshot candidate),
            in which case it becomes the full-viewport flex column whose
            two rows are SiteShell's .scrollRegion and the consent row. */}
        <div className={shellStyles.appShell} data-app-shell>
          <SiteShell>{children}</SiteShell>
          <CookieConsent />
        </div>
      </body>
    </html>
  )
}
