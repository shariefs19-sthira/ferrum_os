import Link from 'next/link'
import BrandMark from './BrandMark'

// W2-344 RELUME_IDENTITY_PASS — footer redesign.
//
// Before: a two-column flex row on off-token slate/blue colors with all ten
// products in one tall column, which stacked into a narrow corner list on
// every viewport — the specific complaint this pass was opened for.
//
// After: brand block + PRODUCTS (spanning two tracks, so ten items read as a
// balanced two-up list instead of a corner stack) + RESOURCES + COMPANY +
// LEGAL, on a single grid with consistent gutters and Relume tokens
// throughout.

const products = [
  { name: 'LandIntel', href: '/products/landintel' },
  { name: 'DesignStudio', href: '/products/designstudio' },
  { name: 'Structura', href: '/products/structura' },
  { name: 'BOQ Pro', href: '/products/boq-pro' },
  { name: 'ProMarket', href: '/products/promarket' },
  { name: 'BuildOS', href: '/products/buildos' },
  { name: 'ProcureHub', href: '/products/procurehub' },
  { name: 'InvestFlow', href: '/products/investflow' },
  { name: 'CommunityBuild', href: '/products/communitybuild' },
  { name: 'Transact', href: '/products/transact' },
]

const resources = [
  { name: 'Blog', href: '/resources/blog' },
  { name: 'Case Studies', href: '/resources/case-studies' },
  { name: 'IS Code Guides', href: '/resources/is-code-guides' },
  { name: 'Checklists', href: '/resources/checklists' },
  { name: 'Glossary', href: '/resources/glossary' },
  { name: 'FAQ', href: '/resources/faq' },
]

const company = [
  { name: 'About', href: '/about' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Careers', href: '/careers' },
  { name: 'Partners', href: '/partners' },
  { name: 'Contact', href: '/contact' },
  { name: 'Documentation', href: '/documentation' },
]

// Only routes that exist on main are listed. /refunds, /disclaimers and /dpdp
// ship with the pending W2-332 branch — that branch appends them to THIS
// array; linking them before they exist would create dead links and fail the
// zero-dead-links certification.
const legal = [
  { name: 'Terms', href: '/terms' },
  { name: 'Privacy', href: '/privacy' },
]

function FooterColumn({
  heading,
  links,
  columns = 1,
  className = '',
}: {
  heading: string
  links: { name: string; href: string }[]
  columns?: 1 | 2
  className?: string
}) {
  return (
    <div className={`min-w-40 ${className}`}>
      {/* Relume tagline token: Body font, Semibold, UPPERCASE. */}
      <h3 className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.18em] text-relume-muted">{heading}</h3>
      <ul className={`mt-4 space-y-3 ${columns === 2 ? 'sm:columns-2 sm:gap-8 sm:space-y-0' : ''}`}>
        {links.map((link) => (
          <li key={link.name} className={columns === 2 ? 'sm:mb-3' : ''}>
            <Link href={link.href} className="inline-block whitespace-nowrap text-sm leading-6 text-relume-muted transition hover:text-relume-ink">
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-relume-border bg-relume-surface">
      <div className="mx-auto max-w-relume-container px-6 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
          <div className="min-w-40">
            <div className="flex items-center gap-3">
              <BrandMark size={36} className="rounded-relume" />
              <span className="text-lg font-semibold tracking-relume-tight text-relume-ink">Ferrum OS</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-relume-muted">
              End-to-end tools for the construction lifecycle, from land intelligence to project
              delivery.
            </p>
          </div>

          <FooterColumn heading="Products" links={products} columns={2} className="sm:col-span-2" />
          <FooterColumn heading="Resources" links={resources} />
          <FooterColumn heading="Company" links={company} />
          <FooterColumn heading="Legal" links={legal} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-relume-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-relume-muted">
            © {new Date().getFullYear()} Ferrum OS. All rights reserved.
          </p>
          <p className="text-sm text-relume-muted">Fe·26 — India-first construction &amp; investment platform. Launch 2026.</p>
        </div>
      </div>
    </footer>
  )
}
