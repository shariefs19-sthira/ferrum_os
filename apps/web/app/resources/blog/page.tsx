import Link from 'next/link'
import SectionShell from '../../../components/sections/SectionShell'
import Eyebrow from '../../../components/sections/Eyebrow'
import SectionHeading from '../../../components/sections/SectionHeading'
import { PrimaryButton, SecondaryButton } from '../../../components/sections/Buttons'

const posts = [
  {
    category: 'Market Brief',
    href: '/resources/blog/ulin-explained',
    title: 'ULPIN explained: how unique land identifiers improve diligence and records',
    summary: 'A quick guide to how ULPIN helps teams verify land identity, reduce errors, and compare parcels more confidently.'
  },
  {
    category: 'Standards',
    href: '/resources/blog/is-1200-vs-cesmm4',
    title: 'IS 1200 vs CESMM4: choosing the right specification style',
    summary: 'A practical comparison of two common estimating frameworks used during planning and project delivery.'
  },
  {
    category: 'Operations',
    href: '/resources/blog/monsoon-concreting',
    title: 'Monsoon concreting: the checklist for safe work during wet weather',
    summary: 'A field-ready checklist for protecting finish quality, curing, and site safety when the rains hit.'
  }
]

export default function BlogPage() {
  return (
    <main>
      <SectionShell>
        <div className="max-w-3xl">
          <Eyebrow>Resources</Eyebrow>
          <SectionHeading as="h1" className="mt-4">
            Insights for smarter construction decisions
          </SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            Fresh thinking on land intelligence, planning, execution, and investment strategy for teams building with confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <PrimaryButton href="#latest-posts">Explore articles</PrimaryButton>
            <SecondaryButton href="/resources">Browse all resources</SecondaryButton>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="latest-posts" background="surface-secondary">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.title}
              className="relative rounded-lg border border-relume-border bg-relume-surface p-6 transition hover:-translate-y-0.5 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-relume-ink has-[a:focus-visible]:ring-offset-2"
            >
              <div className="mb-4 inline-flex rounded-full border border-relume-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-ink">
                {post.category}
              </div>
              <h2 className="text-2xl font-semibold tracking-relume-tight text-relume-ink">{post.title}</h2>
              <p className="mt-4 text-sm leading-6 text-relume-ink">{post.summary}</p>
              <div className="mt-6 border-t border-relume-border pt-4">
                <Link
                  href={post.href}
                  className="z-10 text-sm font-medium text-relume-ink underline underline-offset-4 outline-none after:absolute after:inset-0 after:content-['']"
                >
                  Read article →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </SectionShell>
    </main>
  )
}
