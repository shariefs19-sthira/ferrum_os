import Link from "next/link"
import { CapabilityStatusBadge } from "../status/GovernanceStatusBadge"

const startingPaths = [
  {
    id: "land",
    label: "I have land",
    body: "Attach a parcel or location, inspect available evidence, and carry the selected context into design.",
    href: "/products/landintel",
    action: "Open LandIntel",
    state: "LIMITED PREVIEW" as const,
  },
  {
    id: "brief",
    label: "I have a brief",
    body: "Describe the intended use and project priorities. SUTRA will constrain the next decisions in the workspace.",
    href: "/project-workspace?start=brief",
    action: "Start from a brief",
    state: "LIMITED PREVIEW" as const,
  },
  {
    id: "model",
    label: "I have drawings or a model",
    body: "Review the governed intake requirements for professional files before connected ingestion is released.",
    href: "/products/designstudio",
    action: "Review model intake",
    state: "ROADMAP" as const,
  },
]

export default function ProjectFirstHero() {
  return (
    <section className="ferrum-section overflow-hidden border-b border-relume-border bg-relume-surface py-14 sm:py-20 lg:py-24 [@media(max-height:820px)]:lg:py-12 [@media(max-height:600px)]:py-6" aria-labelledby="project-first-title" data-project-first-hero>
      <div className="mx-auto grid max-w-relume-container gap-10 px-6 md:px-8 lg:grid-cols-[minmax(0,1.04fr)_minmax(24rem,0.96fr)] lg:items-start lg:gap-14">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-relume-command">Less tools. More work.</p>
          <h1 id="project-first-title" className="mt-5 max-w-[17ch] text-4xl [@media(max-height:600px)]:mt-3 [@media(max-height:600px)]:text-3xl font-semibold tracking-relume-tight text-relume-ink sm:text-5xl lg:text-6xl">
            Move one building project from land to delivery.
          </h1>
          <p className="mt-6 [@media(max-height:600px)]:mt-3 [@media(max-height:600px)]:text-sm [@media(max-height:600px)]:leading-6 max-w-2xl text-base leading-7 text-relume-muted sm:text-lg sm:leading-8">
            Start with land, a brief, or an existing professional model. SUTRA coordinates the next bounded step while Ferrum preserves evidence, revisions, unknowns, and approval authority.
          </p>
          <div className="mt-8 [@media(max-height:600px)]:mt-4 flex flex-col gap-3 sm:flex-row">
            <Link href="/project-workspace" className="inline-flex min-h-11 items-center justify-center rounded-full bg-relume-command px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-command">
              Start a project
            </Link>
            <Link href="/products/designstudio" className="inline-flex min-h-11 items-center justify-center rounded-full border border-relume-border px-6 text-sm font-semibold text-relume-command transition-colors hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-command">
              Explore the building library
            </Link>
          </div>
        </div>

        <aside className="min-w-0 rounded-relume border border-relume-border bg-relume-surface-secondary p-5 sm:p-6" aria-label="Project-first workflow">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-relume-border pb-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">One governed project record</p>
              <h2 className="mt-2 text-xl font-semibold tracking-relume-tight text-relume-command">Choose where your project starts</h2>
            </div>
            <span className="rounded-full border border-relume-border bg-white px-3 py-1 text-[10px] font-semibold text-relume-muted">GLOBAL PREVIEW</span>
          </div>
          <div className="mt-4 space-y-3">
            {startingPaths.map((path, index) => (
              <article key={path.id} className="rounded-relume border border-relume-border bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">Path {String(index + 1).padStart(2, "0")}</p>
                  <CapabilityStatusBadge value={path.state} />
                </div>
                <h3 className="mt-3 text-base font-semibold tracking-relume-tight text-relume-command">{path.label}</h3>
                <p className="mt-2 text-sm leading-6 text-relume-muted">{path.body}</p>
                <Link href={path.href} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-relume-command underline decoration-relume-border underline-offset-4 hover:decoration-relume-command">
                  {path.action}<span className="sr-only">: {path.label}</span>
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-relume-muted">Preview capabilities remain INDICATIVE. Unknown or jurisdiction-dependent conditions stay visible and stop only the conclusions that depend on them.</p>
        </aside>
      </div>
    </section>
  )
}
