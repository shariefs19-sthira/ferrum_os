/**
 * Shared provenance display for any land/massing output block: where the
 * figure came from, how fresh it is, and its indicative/verified status.
 * Status is always rendered as visible text, never conveyed by color alone
 * (W2-387 PROVENANCE_STRIP).
 */

/**
 * Every producing surface today (LandIntel's DcrFarRuleset, the Analysis
 * Engine's calculators) is typed `indicative: true` with no code path that
 * ever emits a verified figure — so this only ever renders INDICATIVE.
 * The moment a real verified data source lands, this becomes a real
 * status prop instead of a fixed label; see the RULE 17 proposal to widen
 * the underlying types for that.
 */
export function IndicativeChip() {
  return (
    <span
      role="status"
      aria-label="Indicative, not a verified figure"
      className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-800"
    >
      Indicative
    </span>
  )
}

export function ProvenanceStrip({ source, freshness }: { source: string; freshness: string }) {
  return (
    <p
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-5 text-relume-muted"
      aria-label={`Source: ${source}. Freshness: ${freshness}. Status: indicative, not verified.`}
    >
      <span>
        <span className="font-semibold text-relume-ink">Source:</span> {source}
      </span>
      <span aria-hidden="true">·</span>
      <span>
        <span className="font-semibold text-relume-ink">Freshness:</span> {freshness}
      </span>
      <span aria-hidden="true">·</span>
      <IndicativeChip />
    </p>
  )
}
