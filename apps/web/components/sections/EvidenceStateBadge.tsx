export type EvidenceState = 'LIVE' | 'INDICATIVE' | 'SOURCE-VERIFIED' | 'GAP' | 'ROADMAP'

/**
 * W2-500 (Project Decision Console). One shared visual treatment for the
 * five evidence states, replacing the ad-hoc, inconsistent chip styling
 * found specifically in the homepage hero/cockpit render path:
 *   - ProductCockpitPreview.tsx previously rendered "INDICATIVE" as plain
 *     `text-relume-command` inline text with no chip at all.
 *   - HomepageCockpitHero.tsx previously had no evidence-state indicator
 *     next to the per-product task line at all.
 * Status is always rendered as visible text plus color, never color alone
 * (same discipline ProvenanceStrip.tsx's file header already states).
 *
 * Token assignment — one existing Relume token per state
 * (apps/web/tailwind.config.js), no invented colors:
 *   LIVE            -> relume-success (#138808) — text contrast on white ~4.6:1, passes WCAG AA.
 *   INDICATIVE      -> relume-accent  (#FF9933) as the BORDER only, with
 *                       relume-command as the text color — relume-accent as
 *                       *text* on white is only ~2.1:1 and fails AA (the
 *                       exact contrast risk docs/design/HOMEPAGE_REDESIGN_2026.md
 *                       flags for relume-accent-as-text), so it is never used
 *                       as this badge's text color.
 *   SOURCE-VERIFIED -> relume-command (#0B1F3A) — very high contrast on white.
 *   GAP             -> relume-danger  (#DC2626) — text contrast on white ~4.8:1, passes AA.
 *   ROADMAP         -> relume-steel   (#64748B) — text contrast on white ~4.8:1, passes AA.
 *
 * SCOPE (per the operator's Project Decision Console task): used on the
 * new homepage hero/console area only (HomepageCockpitHero.tsx and its
 * HeroPreviewPlaceholder.tsx). Other INDICATIVE/roadmap treatments
 * elsewhere in the codebase — ProvenanceStrip.tsx's `IndicativeChip`
 * (amber-300/50/800) and WorkspaceCockpit.tsx's own header badges
 * ("INDICATIVE" border-relume-accent bg-orange-50; "IS 456 PASS/REVIEW"
 * ad-hoc emerald/amber) — are explicitly out of this task's scope and are
 * a candidate for a later, separate unification pass, not touched here.
 */
const stateStyles: Record<EvidenceState, string> = {
  LIVE: 'border-relume-success text-relume-success bg-white',
  INDICATIVE: 'border-relume-accent text-relume-command bg-white',
  'SOURCE-VERIFIED': 'border-relume-command text-relume-command bg-white',
  GAP: 'border-relume-danger text-relume-danger bg-white',
  ROADMAP: 'border-relume-steel text-relume-steel bg-white',
}

export default function EvidenceStateBadge({ state, className = '' }: { state: EvidenceState; className?: string }) {
  return (
    <span
      role="status"
      // Monospace treatment for this provenance/status text specifically
      // (W2-500 visual pass), never for headline/body copy. `font-mono`
      // already resolves to this repo's own configured stack
      // (apps/web/tailwind.config.js `theme.extend.fontFamily.mono` =
      // ui-monospace/SFMono-Regular/Consolas/monospace) — a token that
      // already existed before this change, so no new webfont import or
      // layout.tsx change was needed.
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${stateStyles[state]} ${className}`}
    >
      {state}
    </span>
  )
}
