import Link from 'next/link'
import MobileMenu from './MobileMenu'
import BrandMark from './BrandMark'

/**
 * Public navigation describes the work a visitor can start. The individual
 * product routes remain available through the product hub and footer, while
 * the primary header leads with the project flow and its working surfaces.
 * Pricing and account promotion remain excluded until their release gates are
 * evidenced.
 */
const navLinks = [
  { name: 'How it works', href: '/#how-ferrum-works' },
  { name: 'Building library', href: '/products/designstudio' },
  { name: 'Platform', href: '/#platform' },
  { name: 'Resources', href: '/resources' },
]

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-relume-border bg-relume-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-relume-container items-center justify-between gap-6 px-6 py-4 md:px-8">
        {/* RULE 41(1): the brand link is 44px tall (the 36px mark centred in it). The header row is
            already 44px tall because of the menu button / CTA, so this adds no header height. */}
        <Link href="/" className="flex min-h-11 shrink-0 items-center gap-3 whitespace-nowrap">
          <BrandMark size={36} className="rounded-relume" />
          <span className="text-lg font-semibold tracking-relume-tight text-relume-ink">Ferrum OS</span>
        </Link>

        <div className="ml-auto hidden min-w-0 items-center gap-6 lg:flex">
          <nav aria-label="Primary" className="min-w-0">
            <ul className="flex items-center gap-5 whitespace-nowrap lg:gap-8">
              {navLinks.map((link) => (
                <li key={link.name}>
                  {/* Shown from 1024px up, which includes touch tablets in landscape: a 44px hit
                      row that matches the 44px CTA beside it, so the header height is unchanged. */}
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 min-w-11 items-center text-sm text-relume-muted transition hover:text-relume-ink"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Link href="/project-workspace" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-relume-command px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-command">
            Start a project
          </Link>
        </div>

        <MobileMenu />
      </div>
    </header>
  )
}
