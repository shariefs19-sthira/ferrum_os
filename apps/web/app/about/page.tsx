import SectionShell from "../../components/sections/SectionShell"
import Eyebrow from "../../components/sections/Eyebrow"
import SectionHeading from "../../components/sections/SectionHeading"

export default function AboutPage() {
  const stats = [
    {
      value: "50+",
      label: "Team Members"
    },
    {
      value: "200+",
      label: "Projects Completed"
    },
    {
      value: "15+",
      label: "Years Experience"
    }
  ]

  const howWeWork = [
    {
      step: "01",
      title: "Discover",
      description: "We start every engagement by listening — to project owners, site teams, contractors, and the parcel itself. Discovery combines on-site walks, document review, and short stakeholder interviews so the real constraints surface before any tooling is chosen."
    },
    {
      step: "02",
      title: "Model",
      description: "Findings turn into a working model: schedule of values, BOQ structure, decision log, and the data fields each downstream tool will need. We keep models lean so the BOQ engine, site diary, and approvals pipeline all read from the same source of truth."
    },
    {
      step: "03",
      title: "Deliver",
      description: "Delivery happens in tight, evidence-backed loops. Field teams capture progress, the platform updates earned value in real time, and weekly reviews turn data into decisions. Nothing ships without a defensible paper trail."
    },
    {
      step: "04",
      title: "Hand off",
      description: "When the project moves on, your team keeps the templates, the data, and the muscle memory. We document what worked, what didn't, and where the next project can save another week of effort."
    }
  ]

  const teamMembers = [
    { name: "Alex Johnson", role: "CEO & Founder" },
    { name: "Sarah Chen", role: "CTO" },
    { name: "Michael Rodriguez", role: "Head of Design" },
    { name: "Emily Davis", role: "Lead Developer" },
    { name: "James Wilson", role: "Product Manager" },
    { name: "Lisa Thompson", role: "Marketing Director" },
    { name: "David Kim", role: "Sales Lead" },
    { name: "Maria Garcia", role: "Customer Success" }
  ]

  return (
    <main>
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading as="h1">Building the future of construction</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            We&apos;re on a mission to transform the construction industry with innovative software solutions that make building smarter, faster, and more sustainable.
          </p>
        </div>
      </SectionShell>

      <SectionShell background="surface-secondary">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-semibold tracking-relume-tight text-relume-ink">{stat.value}</div>
              <div className="mt-2 text-base font-medium text-relume-ink">{stat.label}</div>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Our process</Eyebrow>
          <SectionHeading className="mt-3">How we work</SectionHeading>
          <p className="mt-3 text-base leading-7 text-relume-ink">
            A four-step loop that turns field evidence into defensible project decisions, every time.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {howWeWork.map((item) => (
            <div key={item.step} className="rounded-lg border border-relume-border bg-relume-surface p-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-relume-border text-sm font-semibold text-relume-ink">
                {item.step}
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-relume-tight text-relume-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-relume-ink">{item.description}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading>Meet Our Team</SectionHeading>
          <p className="mt-3 text-base leading-7 text-relume-ink">
            The passionate individuals driving innovation in construction technology
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, index) => (
            <div key={index} className="rounded-lg border border-relume-border bg-relume-surface p-6 text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border border-relume-border">
                <span className="text-2xl font-semibold text-relume-ink">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h3 className="text-lg font-medium text-relume-ink">{member.name}</h3>
              <p className="mt-1 text-sm text-relume-ink">{member.role}</p>
            </div>
          ))}
        </div>
      </SectionShell>
    </main>
  )
}
