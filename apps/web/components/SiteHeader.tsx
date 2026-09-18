import Link from 'next/link'
import MobileMenu from './MobileMenu'
import BrandMark from './BrandMark'

/**
 * W2-344: the site had NO header and NO navigation of any kind — not on
 * desktop, not on mobile. `MobileMenu` existed as a fully-built component
 * (focus trap, escape handling, click-outside, ARIA wiring) but was never
 * imported or rendered anywhere, and no desktop nav existed at all. The only
 * links out of any page were in the footer — which, because RootLayout
 * rendered <Footer /> above {children}, happened to paint at the top of every
 * page and had been standing in for a navbar by accident.
 *
 * Nav model, derived from docs/RELUME_HANDOFF.md §1 SITEMAP: Products was the
 * primary destination (10 product pages, too many for a flat bar, so the bar
 * linked to the /products hub), then Pricing / Resources / Docs / About, then
 * the auth pair as Relume's secondary (bordered) + primary (flat) buttons.
 */

// CLICK-001-always-on-homepage-cockpit: the desktop "Products" link is
// removed — the homepage's cockpit tab rail (HomepageCockpitHero.tsx) is
// now the single product-navigation authority; a second product menu here
// duplicated it site-wide. /products itself is untouched and still
// directly reachable (its URL, the footer's Products column, and every
// individual /products/<id> page still exist and link back to it) — only
// this header's promotional link to it is removed, so no route is
// stranded. MobileMenu.tsx's product list is intentionally left alone: it
// is the only way to reach a product page from a non-home route on a
// narrow viewport (there is no cockpit rail outside the homepage), so
// removing it would strand mobile visitors, not just declutter a
// duplicate.
//
// W2-500: "Pricing" nav link removed, alongside the "Log in" / "Start
// Free Trial" header buttons below. Per
// docs/design/FERRUM_DOMAIN_AND_ROUTE_MATRIX_2026.md, /pricing is HOLD
// (unattributed figures, stub payment fallback) and /signup /login are
// real source-level implementations but not deployed-account verified —
// none of the three should be promoted from the global header ahead of
// that verification. The routes/pages themselves are untouched; only
// their promotional presence in this header nav is removed.
const navLinks = [
  { name: 'Resources', href: '/resources' },
  { name: 'Documentation', href: '/documentation' },
  { name: 'About', href: '/about' },
]

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-relume-border bg-relume-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-relume-container items-center justify-between gap-6 px-6 py-4 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3 whitespace-nowrap">
          <BrandMark size={36} className="rounded-relume" />
          <span className="text-lg font-semibold tracking-relume-tight text-relume-ink">Ferrum OS</span>
        </Link>

        <nav aria-label="Primary" className="hidden min-w-0 lg:block">
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

        <MobileMenu />
      </div>
    </header>
  )
}
