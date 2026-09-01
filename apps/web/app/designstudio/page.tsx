import DesignStudioFeatures from '../../components/DesignStudioFeatures';

export default function DesignStudioPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">DesignStudio</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Design smarter from first concept to final plan
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Explore layouts, orient options, and compliance signals with a faster, more collaborative concept workflow.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="/get-started" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700">
              Get started
            </a>
            <a href="/" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900">
              Explore platform
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
        <DesignStudioFeatures />
      </div>
    </main>
  );
}
