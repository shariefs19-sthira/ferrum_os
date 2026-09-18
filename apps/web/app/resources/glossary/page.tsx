import Link from 'next/link';
import { groups } from './data';

export default function GlossaryPage() {
  return (
    <main className="min-h-screen bg-relume-surface-secondary text-relume-ink">
      <section className="border-b border-relume-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-relume-ink">Resources</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-relume-ink md:text-6xl">
            Glossary of land, design, and delivery terms
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-relume-muted">
            A working reference for the standards, codes, and operational vocabulary we use across Ferrum OS articles, research cases, and the standards navigator.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/resources" className="inline-flex items-center justify-center rounded-full border border-relume-border bg-white px-5 py-3 text-sm font-medium text-relume-muted transition hover:border-relume-border hover:text-relume-ink">
              Back to Resources
            </Link>
            <Link href="/resources/standards-navigator" className="inline-flex items-center justify-center rounded-full bg-relume-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-relume-ink">
              See Standards Navigator
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="space-y-12">
          {groups.map((group) => (
            <div key={group.letter}>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-relume-tight text-relume-ink">{group.letter}</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {group.items.map((item) => (
                  <article key={item.term} className="rounded-2xl border border-relume-border bg-white p-6">
                    <div className="mb-3 inline-flex rounded-full bg-relume-surface-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-ink">
                      {item.short}
                    </div>
                    <h3 className="text-xl font-semibold leading-tight text-relume-ink">{item.term}</h3>
                    <p className="mt-3 text-sm leading-7 text-relume-muted">{item.detail}</p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
