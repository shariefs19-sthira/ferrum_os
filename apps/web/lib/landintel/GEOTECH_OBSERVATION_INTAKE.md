# Geotechnical observation intake (governed)

`geotechObservationIntake.ts` classifies and reconciles project-specific
geotechnical observation **metadata** — borehole/log reference, lab report
metadata, groundwater observation, field date, coordinates/depth, provider
and checksum. It is a bounded slice, kept separate from
`geotechnicalIntelligence.ts`'s broader canonical evidence contracts; the two
are not merged and do not import each other.

## What this module does

- Validates a `GeotechObservationInput` (ISO dates, SHA-256 checksum,
  provider identity, CRS on any supplied coordinate, forbidden-narrative
  terms, units on numeric measurements).
- Classifies each observation into exactly one of five states:
  `USER_PROVIDED`, `SOURCE_VERIFIED`, `INDICATIVE`, `UNKNOWN`, `STALE`
  (priority: fails validation → `UNKNOWN`; older than the staleness
  threshold → `STALE`; a field estimate → `INDICATIVE`; provider present in
  a caller-supplied verified registry → `SOURCE_VERIFIED`; otherwise
  `USER_PROVIDED`).
- Keeps open-government regional context (`RegionalContextLayer`, scope
  `REGIONAL_OPEN_GOVERNMENT`) structurally separate from site-specific
  evidence (`SiteObservationRecord`, scope `SITE_OBSERVATION`) everywhere in
  the public API. `fuseSiteAndRegionalEvidence` returns them as disjoint
  arrays and throws if either input's declared scope doesn't match the list
  it was passed in.
- Computes downstream `RECHECK`/`HOLD` impacts for `DesignStudio`,
  `Structura` and `BOQ`: `UNKNOWN` holds all three; `STALE` rechecks
  `DesignStudio` and `Structura`; `INDICATIVE` rechecks `BOQ`; stale or
  unknown regional context rechecks `DesignStudio`.

## What this module deliberately does not do

- No file upload UI or document parser — inputs are already-extracted
  metadata the caller supplies.
- No network calls — provider verification is a caller-supplied registry
  (`ClassificationOptions.verifiedProviderRegistry`) checked in-memory; this
  module performs no lookup of its own.
- No fabricated values — every field is either caller-supplied or an
  explicit validation/classification result.
- No new dependencies.
- Never derives an allowable/ultimate bearing capacity, a foundation type or
  suitability determination, or a legal/cadastral boundary
  (`prohibitedGeotechConclusions`); narrative text asserting any of these is
  rejected by `validateGeotechObservationInput`.

## Usage sketch

```ts
const record = intakeSiteObservation(input, {
  nowIso: new Date().toISOString().slice(0, 10),
  staleAfterDays: 365,
  verifiedProviderRegistry, // caller-maintained, e.g. a licensed-lab roster
})

const report = fuseSiteAndRegionalEvidence([record], regionalLayers)
// report.downstreamImpacts -> RECHECK/HOLD entries for DesignStudio/Structura/BOQ
```
