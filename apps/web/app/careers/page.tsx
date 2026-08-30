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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
            Careers
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Build the operating system for construction
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            We are a small team of engineers, designers, and former site
            professionals turning a fragmented industry into a system that can be
            queried, audited, and improved. If the gap between a paper drawing
            and a working platform bothers you, we should talk.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#open-roles"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              See open roles
            </a>
            <a
              href="mailto:careers@ferrum_os.com"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              Email careers@ferrum_os.com
            </a>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
              How we work
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Culture
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
              Four principles we test every decision against.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {culture.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section id="open-roles" className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
              Open roles
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Where we are hiring
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
              Three roles open this quarter. Don&apos;t see a fit? Send a note
              to careers@ferrum_os.com — strong generalists always have a chair.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {roles.map((role) => (
              <article
                key={role.title}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="inline-flex w-fit items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {role.badge}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  {role.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {role.location} &middot; {role.type}
                </p>
                <p className="mt-4 text-sm leading-7 text-gray-600">
                  {role.summary}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                  {role.requirements.map((req) => (
                    <li key={req} className="flex items-start">
                      <svg
                        className="mt-0.5 h-4 w-4 flex-none text-blue-600"
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
                <a
                  href={`mailto:careers@ferrum_os.com?subject=Application%3A%20${encodeURIComponent(role.title)}`}
                  className="mt-6 inline-flex w-fit items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  Apply for this role
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
