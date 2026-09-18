import Link from 'next/link';
import FaqAccordion from '../../../components/FaqAccordion';
import { faqs } from './data';

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-relume-surface-secondary text-relume-ink">
      <section className="border-b border-relume-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-relume-ink">Resources</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-relume-ink md:text-6xl">
            Frequently asked questions
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-relume-muted">
            Common questions about the resources library, how it is maintained, and how to read, cite, or contribute to it.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/resources" className="inline-flex items-center justify-center rounded-full border border-relume-border bg-white px-5 py-3 text-sm font-medium text-relume-muted transition hover:border-relume-border hover:text-relume-ink">
              Back to Resources
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-full bg-relume-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-relume-ink">
              Contact the team
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 md:px-8">
        <FaqAccordion faqs={faqs} />
      </section>
    </main>
  );
}
