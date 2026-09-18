import EvidenceStateBadge, { type EvidenceState } from './EvidenceStateBadge'

type HeroRoadmapPreviewProps = {
  productLabel: string
  reason: string
  evidenceState: EvidenceState
}

/**
 * W2-500 (productExperienceRegistry). The honest preview state for
 * products with NO real live tool today (Ferrum Projects, ProcureHub,
 * CommunityBuild per productExperienceRegistry.ts's `tool.kind ===
 * 'ROADMAP'`), rendered automatically on selection (CLICK-001) same as
 * every other product's preview — there is just nothing real to open.
 *
 * There is no "Load interactive preview" button and never was one worth
 * adding here: there is nothing real behind it to load — a button would
 * open the same WorkspaceCockpit/Space3D chain every other product uses,
 * which is dishonest for a product whose own marketing page states
 * "nothing on it is buildable or usable today" (Ferrum Projects) or the
 * equivalent. This component never renders a form, slider or other
 * control that could imply live functionality — plain text and the
 * evidence badge only.
 */
export default function HeroRoadmapPreview({ productLabel, reason, evidenceState }: HeroRoadmapPreviewProps) {
  return (
    <div
      className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-4 border border-dashed border-relume-border bg-relume-surface-secondary p-8 text-center"
      data-hero-roadmap-preview
      data-testid="hero-roadmap-preview"
    >
      <EvidenceStateBadge state={evidenceState} />
      <p className="text-xl font-semibold tracking-relume-tight text-relume-ink">{productLabel} — on the roadmap</p>
      <p className="max-w-md text-sm leading-6 text-relume-muted">{reason}</p>
      <p className="max-w-md text-xs text-relume-muted">
        No interactive preview exists for {productLabel} yet — there is nothing live to open.
      </p>
    </div>
  )
}
