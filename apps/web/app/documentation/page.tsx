import Link from 'next/link'
import SectionShell from '../../components/sections/SectionShell'
import SectionHeading from '../../components/sections/SectionHeading'

export default function DocumentationPage() {
  return (
    <main>
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading as="h1">Documentation Hub</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Explore our comprehensive guides, articles, and resources to help you get the most out of our platform.
          </p>
        </div>
      </SectionShell>

      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading>Getting started</SectionHeading>
          <p className="mt-3 text-base leading-7 text-relume-ink">
            New to Ferrum OS? Start with one of the three sample pages below — they cover the
            most common questions on standards, project learning, and real-world delivery.
          </p>
        </div>
        <ol className="mx-auto mt-12 max-w-3xl space-y-4">
          <li>
            <Link
              href="/resources/is-code-guides"
              className="flex items-start gap-4 rounded-lg border border-relume-border bg-relume-surface p-5"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-relume-border text-sm font-semibold text-relume-ink">1</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold tracking-relume-tight text-relume-ink">Skim the IS-Code guides</h3>
                <p className="mt-1 text-sm text-relume-ink">
                  Five-minute primers on the IS codes (IS 456, IS 1200, IS 800, IS 875, CESMM4) that
                  Ferrum OS applies under the hood.
                </p>
                <span className="mt-2 inline-block text-sm font-medium text-relume-ink underline underline-offset-4">Open IS-Code Guides &rarr;</span>
              </div>
            </Link>
          </li>
          <li>
            <Link
              href="/resources/blog"
              className="flex items-start gap-4 rounded-lg border border-relume-border bg-relume-surface p-5"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-relume-border text-sm font-semibold text-relume-ink">2</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold tracking-relume-tight text-relume-ink">Read the blog</h3>
                <p className="mt-1 text-sm text-relume-ink">
                  Short articles on monsoon concreting, ULPIN/ULIN, IS 1200 vs CESMM4, and the
                  advanced ULPIN lookup workflow.
                </p>
                <span className="mt-2 inline-block text-sm font-medium text-relume-ink underline underline-offset-4">Open Blog &rarr;</span>
              </div>
            </Link>
          </li>
          <li>
            <Link
              href="/resources/case-studies"
              className="flex items-start gap-4 rounded-lg border border-relume-border bg-relume-surface p-5"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-relume-border text-sm font-semibold text-relume-ink">3</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold tracking-relume-tight text-relume-ink">Explore case studies</h3>
                <p className="mt-1 text-sm text-relume-ink">
                  How greenfield developers, self-build families, contractors, and infrastructure
                  operators use Ferrum OS in production.
                </p>
                <span className="mt-2 inline-block text-sm font-medium text-relume-ink underline underline-offset-4">Open Case Studies &rarr;</span>
              </div>
            </Link>
          </li>
        </ol>
      </SectionShell>

      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading>Resources</SectionHeading>
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/resources/is-code-guides">
            <div className="flex h-full flex-col rounded-lg border border-relume-border bg-relume-surface p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">📖</span>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold tracking-relume-tight text-relume-ink">IS-Code Guides</h3>
                  <p className="mt-2 mb-4 text-sm text-relume-ink">Learn how to integrate and use IS-Code.</p>
                  <div className="flex items-center text-sm font-medium text-relume-ink">
                    <span>Learn more</span>
                    <span className="ml-1">→</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/resources/blog">
            <div className="flex h-full flex-col rounded-lg border border-relume-border bg-relume-surface p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">📝</span>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold tracking-relume-tight text-relume-ink">Blog</h3>
                  <p className="mt-2 mb-4 text-sm text-relume-ink">Latest updates, news, and insights.</p>
                  <div className="flex items-center text-sm font-medium text-relume-ink">
                    <span>Learn more</span>
                    <span className="ml-1">→</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/resources/case-studies">
            <div className="flex h-full flex-col rounded-lg border border-relume-border bg-relume-surface p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">📊</span>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold tracking-relume-tight text-relume-ink">Case Studies</h3>
                  <p className="mt-2 mb-4 text-sm text-relume-ink">Real-world examples and success stories.</p>
                  <div className="flex items-center text-sm font-medium text-relume-ink">
                    <span>Learn more</span>
                    <span className="ml-1">→</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </SectionShell>
    </main>
  )
}
