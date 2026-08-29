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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Get started</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Start building with confidence
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Turn land insights, execution planning, and investment decisions into one streamlined workflow for your next project.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="/" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700">
              Create account
            </a>
            <a href="/landintel" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900">
              View demo
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                {step.number}
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">{step.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
