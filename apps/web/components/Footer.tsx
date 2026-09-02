import Link from 'next/link'

// W2-344 footer redesign. Previously: a two-column (Products / Resources)
// flex row on off-token slate/blue colors, with all 10 products in a single
// tall column. Now a 4-column grid on Relume tokens, products split across
// two balanced columns so the footer stops being one long list.
//
// The Legal column is intentionally absent here: /refunds, /disclaimers and
// /dpdp do not exist on main yet (they ship with the pending W2-332 branch),
// and linking to them now would create dead links. W2-332 adds that column.

const productsPrimary = [
  { name: 'LandIntel', href: '/products/landintel' },
  { name: 'DesignStudio', href: '/products/designstudio' },
  { name: 'Structura', href: '/products/structura' },
  { name: 'BOQ Pro', href: '/products/boq-pro' },
  { name: 'ProMarket', href: '/products/promarket' },
]

const productsSecondary = [
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
]

const company = [
  { name: 'About', href: '/about' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Careers', href: '/careers' },
  { name: 'Partners', href: '/partners' },
  { name: 'Contact', href: '/contact' },
]

function FooterColumn({
  heading,
  links,
}: {
  heading: string
  links: { name: string; href: string }[]
}) {
  return (
    <div>
      {/* Relume tagline token: Body font, Semibold, UPPERCASE. */}
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-relume-muted">{heading}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            <Link href={link.href} className="text-sm text-relume-muted transition hover:text-relume-ink">
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
        <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-relume bg-relume-ink text-sm font-semibold text-white"
                aria-hidden="true"
              >
                F
              </span>
              <span className="text-lg font-semibold tracking-relume-tight text-relume-ink">Ferrum OS</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-relume-muted">
              End-to-end tools for the construction lifecycle, from land intelligence to project
              delivery.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <FooterColumn heading="Products" links={productsPrimary} />
            <FooterColumn heading="More products" links={productsSecondary} />
            <FooterColumn heading="Resources" links={resources} />
            <FooterColumn heading="Company" links={company} />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-relume-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-relume-muted">
            © {new Date().getFullYear()} Ferrum OS. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href="/terms" className="text-sm text-relume-muted transition hover:text-relume-ink">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-sm text-relume-muted transition hover:text-relume-ink">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
