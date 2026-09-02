import Link from 'next/link'

/**
 * W2-344: the Home hero's right-hand media slot (docs/RELUME_HANDOFF.md §3
 * HOME — "Layout: horizontal, content left + media right") was an empty
 * placeholder:
 *   <div className="rounded-lg ... bg-relume-surface-secondary p-10" aria-hidden />
 *
 * This replaces it with a real composition rather than a mock screenshot or a
 * decorative image. Every stage, product name and capability line below is the
 * platform's actual structure, taken from the same source of truth as the rest
 * of the page (RELUME_HANDOFF §2/§5 and the Value Proposition copy directly to
 * its left), and each row links to the product page it names — so the visual is
 * navigable, not a picture of a product.
 *
 * Deliberately shows NO computed figures. A hero is the one place a
 * sample number would be read as a real result, and every real figure on this
 * site carries an INDICATIVE label for exactly that reason; rather than put a
 * labelled sample in the hero, it shows capability structure and no numbers.
 */

const stages = [
  {
    stage: 'Land',
    product: 'LandIntel',
    href: '/products/landintel',
    capability: 'Feasibility, zoning and risk before you buy',
  },
  {
    stage: 'Design',
    product: 'DesignStudio · Structura',
    href: '/products/designstudio',
    capability: 'Plans generated, then engineered to IS codes',
  },
  {
    stage: 'Build',
    product: 'BOQ Pro · ProcureHub · BuildOS',
    href: '/products/boq-pro',
    capability: 'Estimate, procure, manage and track to handover',
  },
  {
    stage: 'Invest',
    product: 'InvestFlow · CommunityBuild',
    href: '/products/investflow',
    capability: 'Model returns and raise capital',
  },
]

export default function HeroComposite() {
  return (
    <div className="rounded-relume border border-relume-border bg-relume-surface-secondary p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-relume-muted">
        Land → Design → Build → Invest
      </p>

      <ol className="mt-6 space-y-px">
        {stages.map((item, index) => (
          <li key={item.stage}>
            <Link
              href={item.href}
              className="group flex gap-4 rounded-relume bg-relume-surface p-4 transition hover:bg-relume-ink/[0.04]"
            >
              <div className="flex flex-col items-center" aria-hidden="true">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-relume-border text-xs font-semibold text-relume-ink">
                  {index + 1}
                </span>
                {index < stages.length - 1 && <span className="mt-1 w-px flex-1 bg-relume-border" />}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-semibold tracking-relume-tight text-relume-ink">
                    {item.stage}
                  </span>
                  <span className="text-xs text-relume-muted">{item.product}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-relume-muted">{item.capability}</p>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-6 border-t border-relume-border pt-4 text-xs text-relume-muted">
        Ten products, one shared data model — nothing is re-entered between stages.
      </p>
    </div>
  )
}
