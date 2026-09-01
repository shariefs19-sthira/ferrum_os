import SectionShell from "../../components/sections/SectionShell"
import Eyebrow from "../../components/sections/Eyebrow"
import SectionHeading from "../../components/sections/SectionHeading"
import { PrimaryButton, SecondaryButton } from "../../components/sections/Buttons"

export const metadata = {
  title: 'Careers — Ferrum OS',
  description: 'Build the operating system for construction with us. Culture, values, and open roles at Ferrum OS.',
  openGraph: {
    title: 'Careers — Ferrum OS',
    description: 'Build the operating system for construction with us.',
    type: 'article',
    locale: 'en_US'
  }
}

const culture = [
  {
    title: 'Evidence over opinion',
    body: 'Decisions ship with a paper trail. We collect field data, site diaries, and BOQ deltas before anyone proposes a change — and we re-read the evidence when a project drifts.'
  },
  {
    title: 'Build for the foreman',
    body: 'The person pouring concrete at 6 a.m. is our primary user. Every flow is tested against the question: does this save them a step, or add one? If it adds, we cut it.'
  },
  {
    title: 'Default to writing',
    body: 'A model, a memo, or a spec. We write things down so the next teammate — or the next project — has something to argue with. Tribal knowledge compounds into institutional debt; writing pays the interest.'
  },
  {
    title: 'One source of truth',
    body: 'Schedule of values, BOQ, decision log, change orders — they all read from the same structured data. If two systems disagree, we fix the model, not the spreadsheet.'
  }
]

const roles = [
  {
    badge: 'Engineering',
    title: 'Senior Full-Stack Engineer',
    location: 'Bengaluru / Remote (India)',
    type: 'Full-time',
    summary: 'Own end-to-end delivery of platform features across Next.js, tRPC, and Postgres. Ship the schedules, BOQ views, and approval flows that contractors and PMs use every day.',
    requirements: [
      '5+ years building production TypeScript or similar',
      'Comfort with Postgres schema design and migrations',
      'Care for data integrity over clever abstractions'
    ]
  },
  {
    badge: 'Construction',
    title: 'Implementation Engineer — Site',
    location: 'Bengaluru / Mumbai',
    type: 'Full-time',
    summary: 'Spend 3 days a week on active projects — residential towers, highway packages, plant rooms — onboarding site teams to Structura, LandIntel, and BOQ-Pro. Translate site friction into product tickets.',
    requirements: [
      'Degree in civil engineering or 5+ years on Indian project sites',
      'Read a bar bending schedule without translating it',
      'Have argued a variation order and won (or lost) gracefully'
    ]
  },
  {
    badge: 'Design',
    title: 'Product Designer — Workflows',
    location: 'Remote (India / Europe)',
    type: 'Full-time',
    summary: 'Design the multi-step workflows our users live inside: BOQ creation, decision logs, change order review. Field-test every flow with at least three real users before it ships.',
    requirements: [
      '3+ years designing data-heavy B2B tools',
      'Comfort with Figma variables, prototypes, and structured data',
      'Willing to ride a project elevator with a site engineer in the name of usability research'
    ]
  }
]

export default function CareersPage() {
  return (
    <main>
      <SectionShell>
        <div className="max-w-3xl">
          <Eyebrow>Careers</Eyebrow>
          <SectionHeading as="h1" className="mt-4">
            Build the operating system for construction
          </SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            We are a small team of engineers, designers, and former site
            professionals turning a fragmented industry into a system that can be
            queried, audited, and improved. If the gap between a paper drawing
            and a working platform bothers you, we should talk.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <PrimaryButton href="#open-roles">See open roles</PrimaryButton>
            <SecondaryButton href="mailto:careers@ferrum_os.com">
              Email careers@ferrum_os.com
            </SecondaryButton>
          </div>
        </div>
      </SectionShell>

      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>How we work</Eyebrow>
          <SectionHeading className="mt-3">Culture</SectionHeading>
          <p className="mt-3 text-base leading-7 text-relume-ink">
            Four principles we test every decision against.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {culture.map((item) => (
            <article key={item.title} className="rounded-lg border border-relume-border bg-relume-surface p-6">
              <h3 className="text-lg font-semibold tracking-relume-tight text-relume-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-relume-ink">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="open-roles">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Open roles</Eyebrow>
          <SectionHeading className="mt-3">Where we are hiring</SectionHeading>
          <p className="mt-3 text-base leading-7 text-relume-ink">
            Three roles open this quarter. Don&apos;t see a fit? Send a note
            to careers@ferrum_os.com — strong generalists always have a chair.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {roles.map((role) => (
            <article
              key={role.title}
              className="flex flex-col rounded-lg border border-relume-border bg-relume-surface p-6"
            >
              <span className="inline-flex w-fit items-center rounded-full border border-relume-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-relume-ink">
                {role.badge}
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-relume-tight text-relume-ink">
                {role.title}
              </h3>
              <p className="mt-2 text-sm text-relume-ink">
                {role.location} &middot; {role.type}
              </p>
              <p className="mt-4 text-sm leading-6 text-relume-ink">
                {role.summary}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-relume-ink">
                {role.requirements.map((req) => (
                  <li key={req} className="flex items-start">
                    <svg
                      className="mt-0.5 h-4 w-4 flex-none text-relume-ink"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-2">{req}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <PrimaryButton href={`mailto:careers@ferrum_os.com?subject=Application%3A%20${encodeURIComponent(role.title)}`}>
                  Apply for this role
                </PrimaryButton>
              </div>
            </article>
          ))}
        </div>
      </SectionShell>
    </main>
  )
}
