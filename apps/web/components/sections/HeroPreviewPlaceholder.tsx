import EvidenceStateBadge, { type EvidenceState } from './EvidenceStateBadge'

type HeroPreviewPlaceholderProps = {
  productLabel: string
  task: string
  evidenceState: EvidenceState
  onLoad: () => void
}

/**
 * W2-500 (Project Decision Console) — the 3D-mount gate.
 *
 * This is what renders on first paint for the hero's active product, in
 * place of the real ProductCockpitPreview -> WorkspaceCockpit -> Space3D
 * chain. Before this change, HomepageCockpitHero mounted that chain
 * unconditionally on render, so the next/dynamic({ssr:false}) Space3D
 * chunk (~591KB raw / ~148KB gz) fetched on first paint with zero user
 * interaction (confirmed: WorkspaceCockpit.tsx's `view` state defaults to
 * 'space' and renders Space3D on that default).
 *
 * Trigger for loading the real cockpit (documented per the task's
 * request to state the exact trigger chosen): clicking this panel's
 * explicit "Load interactive preview" button. Switching product tabs
 * before that click only changes which product's static placeholder,
 * task line and evidence badge are shown (HomepageCockpitHero.tsx) — it
 * does not itself mount Space3D. Once the visitor has clicked "Load
 * interactive preview" once, HomepageCockpitHero keeps the real cockpit
 * mounted for every subsequently selected product too (the visitor has
 * already expressed intent to use the interactive workspace).
 *
 * No product preview imagery exists anywhere in this repo
 * (apps/web/public has none — confirmed in
 * docs/design/HOMEPAGE_REDESIGN_2026.md §5.4, "Imagery"). This is
 * therefore a plain CSS/Tailwind panel built from existing design
 * tokens only — no <img>, no invented illustration, no external image
 * URL — so there is no decorative-vs-informational alt-text question to
 * resolve; the equivalent information (product name + task) is real text
 * content, not an image caption.
 */
export default function HeroPreviewPlaceholder({ productLabel, task, evidenceState, onLoad }: HeroPreviewPlaceholderProps) {
  return (
    <div
      className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-4 border border-dashed border-relume-border bg-relume-surface-secondary p-8 text-center"
      data-hero-preview-placeholder
      data-testid="hero-preview-placeholder"
    >
      <EvidenceStateBadge state={evidenceState} />
      <p className="text-xl font-semibold tracking-relume-tight text-relume-ink">{productLabel} cockpit preview</p>
      <p className="max-w-md text-sm leading-6 text-relume-muted">{task}</p>
      <button
        type="button"
        onClick={onLoad}
        className="mt-2 inline-flex min-h-11 items-center rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink"
      >
        Load interactive preview
      </button>
      <p className="max-w-md text-xs text-relume-muted">
        Opens the live 3D workspace for {productLabel} — nothing 3D loads until you ask for it.
      </p>
    </div>
  )
}
