"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import Concierge from "./Concierge"
import ErrorBoundary from "./ErrorBoundary"
import Footer from "./Footer"
import MotionObserver from "./MotionObserver"
import NewsletterSignup from "./NewsletterSignup"
import SiteHeader from "./SiteHeader"
import styles from "./siteShell.module.css"

/**
 * Public pages and the project cockpit have different jobs. Marketing
 * furniture helps a visitor understand Ferrum; inside the cockpit it would
 * duplicate project navigation and create a second SUTRA instance behind the
 * fixed application shell. Keep the route stable while selecting the correct
 * furniture from the current pathname.
 *
 * `.scrollRegion` (siteShell.module.css) wraps everything that should
 * scroll as one region above the cookie-consent row. By default it is an
 * ordinary <div> with no layout effect on the already block-level children
 * it wraps — real visitors and layout candidates B/C/D see byte-identical
 * rendering. Only when CookieConsent.tsx marks <html data-cookie-variant
 * ="A"> (the reserved-band screenshot candidate, `?cookieVariant=A`) does
 * it become the scrollable top row of the full-viewport shell built in
 * layout.tsx's `.appShell`. Concierge (the SUTRA launcher) stays outside
 * this region — it is `position:fixed` and viewport-anchored regardless of
 * where it sits in the DOM, and it lifts above the consent row via the
 * `--cookie-consent-h` var CookieConsent.tsx publishes for every candidate.
 */
export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isProjectWorkspace = pathname?.startsWith("/project-workspace")

  if (isProjectWorkspace) {
    return (
      <div className={styles.scrollRegion} data-site-scroll>
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    )
  }

  return (
    <>
      <MotionObserver />
      <div className={styles.scrollRegion} data-site-scroll>
        <SiteHeader />
        <ErrorBoundary>{children}</ErrorBoundary>
        <NewsletterSignup />
        <Footer />
      </div>
      <Concierge />
    </>
  )
}
