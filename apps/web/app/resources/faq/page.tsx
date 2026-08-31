import Link from 'next/link';
import FaqAccordion from '../../../components/FaqAccordion';

const faqs = [
  {
    category: 'Resources',
    question: 'What is in the Ferrum OS resources library?',
    answer: 'A curated set of articles, case studies, and Indian construction standards guides. New entries ship regularly; older ones are reviewed when codes, markets, or product workflows change.'
  },
  {
    category: 'Reading',
    question: 'Do I need a Ferrum OS account to read the resources?',
    answer: 'No. All articles, case studies, IS code guides, and this FAQ are public. Account access is only required to use the live product workflows such as LandIntel lookups, BOQ generation, and BuildOS project views.'
  },
  {
    category: 'Citations',
    question: 'How are code references and standards cited?',
    answer: 'Each reference uses the canonical IS code number (for example IS 1200, IS 456, IS 800, IS 875) and a one-line description. When a non-Indian standard is discussed, we note how it maps to Indian practice so teams can decide what to adopt, hold, or drop in their own workflow.'
  },
  {
    category: 'Updates',
    question: 'How often is the resources content updated?',
    answer: 'Articles and case studies are updated when product behaviour, market context, or referenced standards change. Code-guide stances (Adopt, Hold, Drop) are reviewed at least once per quarter.'
  },
  {
    category: 'Contributing',
    question: 'Can I suggest a topic or submit a case study?',
    answer: 'Yes. Reach the team through the contact page with the working title, a short outline, and any links to drawings, approvals, or published references that should inform the writeup.'
  },
  {
    category: 'Geography',
    question: 'Is the content specific to India?',
    answer: 'Yes. The library focuses on Indian land records, planning, compliance, contractor coordination, and delivery realities. Where international standards are referenced, the article explains the Indian equivalent or boundary condition.'
  }
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Resources</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Frequently asked questions
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Common questions about the resources library, how it is maintained, and how to read, cite, or contribute to it.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/resources" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900">
              Back to Resources
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700">
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
