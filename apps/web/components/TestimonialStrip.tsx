const testimonials = [
  {
    quote: 'LandIntel helped us flag a zoning risk before signing the site agreement. The confidence jump was immediate.',
    name: 'Aarav Mehta',
    title: 'Development Lead, Urban Nest',
  },
  {
    quote: 'The project reviews are faster and more transparent. Our teams now align on the same land assumptions.',
    name: 'Sonia Patel',
    title: 'Portfolio Manager, Cedar Build',
  },
  {
    quote: 'From feasibility to contractor coordination, Ferrum OS makes the whole delivery stack feel connected.',
    name: 'Marcus Lee',
    title: 'Operations Director, Horizon Works',
  },
]

export default function TestimonialStrip() {
  return (
    <section className="bg-slate-900 py-16 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Customer stories</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Teams are shipping with more confidence across every phase.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure key={item.name} className="rounded-3xl border border-slate-700 bg-slate-800/70 p-6 shadow-sm">
              <blockquote className="text-lg leading-8 text-slate-100">“{item.quote}”</blockquote>
              <figcaption className="mt-6 border-t border-slate-700 pt-4">
                <div className="font-semibold text-white">{item.name}</div>
                <div className="mt-1 text-sm text-slate-300">{item.title}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
