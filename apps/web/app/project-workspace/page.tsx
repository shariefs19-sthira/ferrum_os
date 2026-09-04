import SectionShell from '../../components/sections/SectionShell'
import Eyebrow from '../../components/sections/Eyebrow'
import SectionHeading from '../../components/sections/SectionHeading'
import CardGrid from '../../components/sections/CardGrid'
import EarlyAccessCapture from '../../components/sections/EarlyAccessCapture'
import SavedArtifactsPanel from '../../components/sections/SavedArtifactsPanel'

export const metadata = {
  title: 'Project Workspace — Ferrum OS',
  description: 'Every artifact, teammate, and integration for one project — test-fits, BOQ, rate comparisons, ULPIN reports, timelines, and comments. Early access preview.',
}

const artifacts = [
  { label: 'Test-fits', meta: '3 saved' },
  { label: 'BOQ estimates', meta: '2 saved' },
  { label: 'Rate comparisons', meta: '4 saved' },
  { label: 'ULPIN reports', meta: '1 saved' },
]

const collaborationFeatures = [
  { title: 'Timelines', body: 'Every project artifact placed on a timeline, from feasibility to handover.' },
  { title: 'Team', body: 'Invite teammates into a project; each artifact shows who ran it and when.' },
  { title: 'Comments', body: 'Discuss a specific test-fit or BOQ line directly where it lives, not in a separate thread.' },
]

const integrationItems = [
  { title: 'Every product', body: 'Artifacts from LandIntel, DesignStudio, Structura, BOQ Pro, and the rest land in the same workspace.' },
  { title: 'Agent / MCP access', body: 'The same workspace data an agent reaches through MCP is the data your team sees — no separate agent-only view.' },
]

export default function ProjectWorkspacePage() {
  return (
    <main>
      <div className="border-b border-relume-border bg-orange-50 px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-relume-command">
        PREVIEW — workspace exploration only; no account data is loaded
      </div>
      {/* 1. Hero */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Project Workspace</Eyebrow>
          <SectionHeading as="h1" className="mt-4">
            One workspace per project
          </SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            A preview of the Project Workspace — every artifact, your team, and the integrations that feed it, in one place.
          </p>
        </div>
      </SectionShell>

      {/* 2. Real saved artifacts (W2-327) */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Your workspace</Eyebrow>
          <SectionHeading className="mt-4">Real saved artifacts</SectionHeading>
          <p className="mt-4 text-sm text-relume-ink opacity-70">
            Unlike the grid below, this section is functional — sign in, save a calculator result, export or share it.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-3xl">
          <SavedArtifactsPanel />
        </div>
      </SectionShell>

      {/* 3. Artifact grid (PREVIEW) */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Preview</Eyebrow>
          <SectionHeading className="mt-4">Every artifact, in one grid</SectionHeading>
        </div>
        <div className="mx-auto mt-8 max-w-4xl">
          <div className="mb-3 inline-flex rounded-full border border-relume-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-relume-ink">
            Preview — not a functional workspace
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {artifacts.map((a) => (
              <div key={a.label} className="rounded-lg border border-relume-border bg-relume-surface p-4">
                <p className="text-sm font-medium text-relume-ink">{a.label}</p>
                <p className="mt-1 text-xs text-relume-ink opacity-70">{a.meta}</p>
                <span className="mt-3 inline-block rounded-full border border-relume-border px-2 py-1 text-xs text-relume-ink" aria-disabled="true">
                  PREVIEW
                </span>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      {/* 3. Collaboration */}
      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Collaboration</Eyebrow>
          <SectionHeading className="mt-4">Built for a team, not a solo run</SectionHeading>
        </div>
        <div className="mt-12">
          <CardGrid items={collaborationFeatures} columns={3} />
        </div>
      </SectionShell>

      {/* 4. Integrations */}
      <SectionShell background="surface-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Integrations</Eyebrow>
          <SectionHeading className="mt-4">Every product feeds the same workspace</SectionHeading>
        </div>
        <div className="mt-12">
          <CardGrid items={integrationItems} columns={2} />
        </div>
      </SectionShell>

      {/* 5. CTA */}
      <SectionShell>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Early access</Eyebrow>
          <SectionHeading className="mt-4">Get early access to Project Workspace</SectionHeading>
          <p className="mt-6 text-base leading-7 text-relume-ink">
            This is a preview. Join the early-access list to be notified when it&apos;s ready.
          </p>
        </div>
        <div className="mt-8">
          <EarlyAccessCapture product="Project Workspace" sourcePage="project-workspace-preview" />
        </div>
      </SectionShell>
    </main>
  )
}
