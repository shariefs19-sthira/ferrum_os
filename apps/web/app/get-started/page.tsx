const steps = [
  {
    number: '01',
    title: 'Create account',
    description: 'Set up your workspace in minutes and invite your team to collaborate on land, design, and delivery decisions.'
  },
  {
    number: '02',
    title: 'Add your first plot',
    description: 'Import a parcel, check zoning details, and assess feasibility with reliable property intelligence.'
  },
  {
    number: '03',
    title: 'Explore products',
    description: 'Move from discovery to execution with AI-native tools for planning, financing, and operations.'
  }
];

export default function GetStartedPage() {
  return (
    <main className="min-h-screen bg-relume-surface-secondary text-relume-ink">
      <section className="border-b border-relume-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-relume-ink">Get started</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-relume-ink md:text-6xl">
            Start building with confidence
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-relume-muted">
            Turn land insights, execution planning, and investment decisions into one streamlined workflow for your next project.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="/" className="inline-flex items-center justify-center rounded-full bg-relume-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-relume-ink">
              Create account
            </a>
            <a href="/products/landintel" className="inline-flex items-center justify-center rounded-full border border-relume-border bg-white px-5 py-3 text-sm font-medium text-relume-muted transition hover:border-relume-border hover:text-relume-ink">
              View demo
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number} className="rounded-2xl border border-relume-border bg-white p-6">
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-relume-surface-secondary text-sm font-semibold text-relume-ink">
                {step.number}
              </div>
              <h2 className="text-2xl font-semibold text-relume-ink">{step.title}</h2>
              <p className="mt-4 text-sm leading-7 text-relume-muted">{step.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
