"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import Concierge from "./Concierge"
import ErrorBoundary from "./ErrorBoundary"
import Footer from "./Footer"
import MotionObserver from "./MotionObserver"
import NewsletterSignup from "./NewsletterSignup"
import SiteHeader from "./SiteHeader"

/**
 * Public pages and the project cockpit have different jobs. Marketing
 * furniture helps a visitor understand Ferrum; inside the cockpit it would
 * duplicate project navigation and create a second SUTRA instance behind the
 * fixed application shell. Keep the route stable while selecting the correct
 * furniture from the current pathname.
 */
export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isProjectWorkspace = pathname?.startsWith("/project-workspace")

  if (isProjectWorkspace) return <ErrorBoundary>{children}</ErrorBoundary>

  return (
    <>
      <MotionObserver />
      <SiteHeader />
      <ErrorBoundary>{children}</ErrorBoundary>
      <NewsletterSignup />
      <Footer />
      <Concierge />
    </>
  )
}
