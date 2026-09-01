import SectionShell from '../../components/sections/SectionShell'
import Eyebrow from '../../components/sections/Eyebrow'
import SectionHeading from '../../components/sections/SectionHeading'
import CardGrid from '../../components/sections/CardGrid'
import EarlyAccessCapture from '../../components/sections/EarlyAccessCapture'

export const metadata = {
  title: 'Dashboard — Ferrum OS',
  description: 'A single view of your saved test-fits, BOQ estimates, rate comparisons, ULPIN reports, and projects. Early access preview.',
}

const featureBlocks = [
  { title: 'Saved test-fits & BOQ estimates', body: 'Every test-fit and BOQ estimate you run is saved here — no re-entering numbers to compare a second option.' },
  { title: 'Rate comparisons & ULPIN reports', body: 'Your rate comparisons and ULPIN parcel lookups, kept in one place so you can revisit them without a new search.' },
  { title: 'All your projects, one view', body: 'Every project with its timeline — from feasibility to handover — visible at a glance.' },
  { title: 'Agent access, built in', body: 'The same data an agent reaches through MCP is the data you see here — one source of truth, not two.' },
]

const mockCards = [
  { label: 'Test-fit — Plot 42, Bengaluru', meta: 'Saved 2 days ago' },
  { label: 'BOQ estimate — Cement, TMT Steel', meta: 'Saved 3 days ago' },
  { label: 'Rate comparison — Bengaluru vs Pune', meta: 'Saved 1 week ago' },
  { label: 'ULPIN report — KA-BLR-0001-2024', meta: 'Saved 1 week ago' },
]

export default function DashboardPage() {
  return (
    <main>
      {/* 1. Hero */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Dashboard</Eyebrow>
          <SectionHeading as="h1" className="mt-4">
            Everything you've run, in one place
          </SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            A preview of the Dashboard — saved test-fits, BOQ estimates, rate comparisons, and ULPIN reports, alongside every project you're running.
          </p>
        </div>
      </SectionShell>

      {/* 2. Feature blocks */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>What's here</Eyebrow>
          <SectionHeading className="mt-4">Your work, saved and searchable</SectionHeading>
        </div>
        <div className="mt-12">
          <CardGrid items={featureBlocks} columns={4} />
        </div>
      </SectionShell>

      {/* 3. Mock UI strip (PREVIEW) */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Preview</Eyebrow>
          <SectionHeading className="mt-4">A look at the dashboard</SectionHeading>
        </div>
        <div className="mx-auto mt-8 max-w-4xl">
          <div className="rounded-lg border border-relume-border bg-relume-surface p-4">
            <div className="mb-3 inline-flex rounded-full border border-relume-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-relume-ink">
              Preview — not a functional dashboard
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {mockCards.map((card) => (
                <div key={card.label} className="flex items-center justify-between rounded-lg border border-relume-border bg-relume-surface-secondary p-4">
                  <div>
                    <p className="text-sm font-medium text-relume-ink">{card.label}</p>
                    <p className="mt-1 text-xs text-relume-ink opacity-70">{card.meta}</p>
                  </div>
                  <span className="rounded-full border border-relume-border px-2 py-1 text-xs text-relume-ink" aria-disabled="true">
                    PREVIEW
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>

      {/* 4. Security note */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Security</Eyebrow>
          <SectionHeading className="mt-4">Your data, access-controlled</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            The same access control that governs the API and MCP tool catalog (see docs/AGENT_INTERFACE.md) governs the dashboard — an agent reaching your data uses the same scoped access a signed-in session would, nothing broader.
          </p>
        </div>
      </SectionShell>

      {/* 5. CTA */}
      <SectionShell>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Early access</Eyebrow>
          <SectionHeading className="mt-4">Get early access to the dashboard</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            This is a preview. Join the early-access list to be notified when it's ready.
          </p>
        </div>
        <div className="mt-8">
          <EarlyAccessCapture product="Dashboard" sourcePage="dashboard-preview" />
        </div>
      </SectionShell>
    </main>
  )
}
