import Link from 'next/link'
import MobileMenu from './MobileMenu'

/**
 * W2-344: the site had NO header and NO navigation of any kind — not on
 * desktop, not on mobile. `MobileMenu` existed as a fully-built component
 * (focus trap, escape handling, click-outside, ARIA wiring) but was never
 * imported or rendered anywhere, and no desktop nav existed at all. The only
 * links out of any page were in the footer — which, because RootLayout
 * rendered <Footer /> above {children}, happened to paint at the top of every
 * page and had been standing in for a navbar by accident.
 *
 * Nav model, derived from docs/RELUME_HANDOFF.md §1 SITEMAP: Products is the
 * primary destination (10 product pages, too many for a flat bar, so the bar
 * links to the /products hub), then Pricing / Resources / Docs / About, then
 * the auth pair as Relume's secondary (bordered) + primary (flat) buttons.
 */

const navLinks = [
  { name: 'Products', href: '/products' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Resources', href: '/resources' },
  { name: 'Documentation', href: '/documentation' },
  { name: 'About', href: '/about' },
]

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-relume-border bg-relume-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-relume-container items-center justify-between gap-6 px-6 py-4 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3 whitespace-nowrap">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-relume bg-relume-ink text-sm font-semibold text-white"
            aria-hidden="true"
          >
            F
          </span>
          <span className="text-lg font-semibold tracking-relume-tight text-relume-ink">Ferrum OS</span>
        </Link>

        <nav aria-label="Primary" className="hidden min-w-0 md:block">
          <ul className="flex items-center gap-5 whitespace-nowrap lg:gap-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-sm text-relume-muted transition hover:text-relume-ink"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden shrink-0 items-center gap-3 whitespace-nowrap md:flex">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-relume-border px-5 py-2.5 text-sm font-medium text-relume-ink transition hover:bg-relume-surface-secondary"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-relume-ink px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Start Free Trial
          </Link>
        </div>

        <MobileMenu />
      </div>
    </header>
  )
}
