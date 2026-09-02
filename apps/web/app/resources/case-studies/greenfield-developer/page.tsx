export default function GreenfieldDeveloperPage() {
  return (
    <div className="min-h-screen bg-relume-surface-secondary py-16 sm:py-20 px-6 md:px-8">
      <div className="max-w-relume-prose mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-relume-tight text-relume-ink">
            Greenfield Development Project
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Transforming Raw Land into a Thriving Community
          </p>
          <span className="mt-4 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Illustrative case study — composite scenario, not an actual named client
          </span>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Challenge</h2>
            <p className="text-relume-muted">
              The developer faced challenges in managing a large-scale greenfield development 
              project across 500 acres. Key issues included coordinating multiple contractors, 
              ensuring timely approvals, and maintaining consistent quality across diverse 
              infrastructure and housing components.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Approach</h2>
            <p className="text-relume-muted">
              We implemented an integrated project management system with real-time monitoring 
              of all construction activities. The solution included digital documentation, 
              automated scheduling, and centralized communication platforms to ensure seamless 
              coordination between stakeholders and track progress against milestones.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-relume-tight text-relume-ink mb-4">Outcome</h2>
            <p className="text-relume-muted">
              The project was completed 15% ahead of schedule with 20% cost savings. The 
              developer achieved enhanced transparency with stakeholders and established 
              standardized processes for future developments. The community received 
              critical acclaim for its quality and timely delivery.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}