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
  { name: 'Ferrum Projects', href: '/products/ferrum-projects' },
  { name: 'ProcureHub', href: '/products/procurehub' },
  { name: 'InvestFlow', href: '/products/investflow' },
  { name: 'CommunityBuild', href: '/products/communitybuild' },
  { name: 'Transact', href: '/products/transact' },
]

const resources = [
  { name: 'Blog', href: '/resources/blog' },
  { name: 'Research Cases', href: '/resources/research-cases' },
  { name: 'Standards Navigator', href: '/resources/standards-navigator' },
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

// RULE 41(1) touch-target floor. Touch-first: every footer link is a full-width row of at
// least 44px (the visible type is unchanged, the row is just taller and the text is centred
// in it). A fine-pointer desktop that is at least 1024px wide keeps the original compact
// inline list (24px lines, 12px rhythm). That is the `(min-width:1024px) and (pointer:fine)`
// arbitrary variant below; tailwind only sees complete literal class strings, so the
// variant is spelled out on every desktop-restore class instead of being interpolated.
//   - link  : touch  `flex min-h-11 min-w-11 items-center`   desktop  `inline-block`, no minimums
//   - list  : touch  `mt-1.5 space-y-0`  (a 44px row already carries the spacing, and mt-1.5 +
//             the 10px above the centred text keeps the heading-to-first-link distance at 16px)
//             desktop `mt-4` and, for single-column lists, `space-y-3`
//   - 2-col : `sm:columns-2 sm:gap-8` is unchanged; the li `mb-3` rhythm is desktop-only
const linkClass =
  'flex min-h-11 min-w-11 items-center whitespace-nowrap text-sm leading-6 text-relume-muted transition hover:text-relume-ink [@media(min-width:1024px)_and_(pointer:fine)]:inline-block [@media(min-width:1024px)_and_(pointer:fine)]:min-h-0 [@media(min-width:1024px)_and_(pointer:fine)]:min-w-0'
const listClass =
  'mt-1.5 space-y-0 [@media(min-width:1024px)_and_(pointer:fine)]:mt-4 [@media(min-width:1024px)_and_(pointer:fine)]:space-y-3'
const twoColumnListClass =
  'mt-1.5 space-y-0 sm:columns-2 sm:gap-8 [@media(min-width:1024px)_and_(pointer:fine)]:mt-4'
const twoColumnItemClass = '[@media(min-width:1024px)_and_(pointer:fine)]:mb-3'

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
      <ul className={columns === 2 ? twoColumnListClass : listClass}>
        {links.map((link) => (
          <li key={link.name} className={columns === 2 ? twoColumnItemClass : ''}>
            <Link href={link.href} className={linkClass}>
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
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[minmax(22rem,1.35fr)_minmax(20rem,2fr)_repeat(3,minmax(8rem,1fr))]">
          <div className="min-w-0 sm:col-span-2 lg:col-span-4 xl:col-span-1">
            <div className="flex items-center gap-3">
              <BrandMark size={36} className="rounded-relume" />
              <span className="text-lg font-semibold tracking-relume-tight text-relume-ink">Ferrum OS</span>
            </div>
            <p className="mt-4 max-w-[48ch] text-sm leading-6 text-relume-muted">
              End-to-end tools for the construction lifecycle, from land intelligence to project
              delivery.
            </p>
          </div>

          <FooterColumn heading="Products" links={products} columns={2} className="sm:col-span-2 lg:col-span-2 xl:col-span-1" />
          <FooterColumn heading="Resources" links={resources} />
          <FooterColumn heading="Company" links={company} />
          <FooterColumn heading="Legal" links={legal} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-relume-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-relume-muted">
            © {new Date().getFullYear()} Ferrum OS. All rights reserved.
          </p>
          <p className="text-sm text-relume-muted">Fe·26 — global project intelligence from land to delivery.</p>
        </div>
      </div>
    </footer>
  )
}
