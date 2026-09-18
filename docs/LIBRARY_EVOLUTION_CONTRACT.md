# Governed building-library evolution contract

`apps/web/lib/designstudio/libraryEvolutionContract.ts` (tests in the
adjacent `.test.ts`) models how a user's stated design intent can derive a
private **candidate variant** from an already-approved parent shell — a
template or another approved variant — without ever treating that
derivation as training on the tenant's private data, and without ever
asserting an engineering verification the system hasn't actually performed.

New, isolated module: no dependency on any other file, no UI, no new
package, no generative-model call, no protected path touched.

## What it models

- **Lineage** (`ParentLineage`) — parent template id/version, optional
  parent variant id, and hop-depth back to the root template.
- **Intent facets** (`IntentFacets`) — a structured (not free-text)
  statement of what's requested, so it can be diffed and hashed instead of
  interpreted.
- **Deterministic parameter deltas** (`deriveParameterDeltas`) — a pure
  structural diff between the parent's baseline facets and the requested
  intent. Same input always produces the same deltas; no model call.
- **Similarity / deduplication** (`deltaSimilarity`, `findSimilarVariant`) —
  Jaccard similarity over delta signatures, scoped to the same tenant +
  parent template + version, exact-fingerprint match checked first.
- **Provenance / licence** (`VariantProvenance`, `deriveLicence`) — a fresh
  candidate is *never* publicly reusable on creation, even if its parent is;
  publication is a separate, gated act.
- **Privacy consent** (`PrivacyConsent`, `resolvePrivacyConsent`) — defaults
  to `NOT_GRANTED`; an explicit `RETRIEVAL_ONLY` grant is never silently
  upgraded to `TRAINING_OPT_IN`. Deriving a variant is not itself consent.
- **Validation state** (`ValidationState`) —
  `GENERATED → GEOMETRY_CHECKED → ENGINEERING_VERIFIED → APPROVED_FOR_ISSUE`.
  `computeValidationState` only reads evidence identifiers the caller
  supplies from a real check/review system; no evidence in means
  `GENERATED` out, always.
- **Reuse eligibility** (`evaluateReuseEligibility`) — per-channel gating
  (`TENANT_PRIVATE_REUSE`, `STRUCTURAL_REUSE`, `BOQ_REUSE`,
  `PUBLIC_LIBRARY_REUSE`), each requiring the validation state, licence and
  consent that channel actually needs.
- **Promotion gate** (`evaluatePromotionGate`) — promoting a private
  candidate to a shared library version requires an identified human
  reviewer + approval record, geometry check, engineering verification,
  licence review, privacy review, explicit `TRAINING_OPT_IN` consent, and a
  passed deduplication check. The function only reports whether the gate is
  satisfied; it never performs or shortcuts the review.

## Entry point

`deriveCandidateVariant(input)` assembles a `CandidateVariant` from a
parent's baseline facets and a requested `IntentFacets`. It is a pure
function: identical input always yields an identical `variantId`,
`intentFingerprint` and `deltas`. Every new candidate starts
`GENERATED` / `PRIVATE_CANDIDATE` — nothing in this module advances
validation or library state beyond what the caller's own evidence and gate
checks separately allow.

## Explicit exclusions

No generative model calls, no reproduction or imitation of any real
architect's protected geometry or trade dress, no UI, no new dependencies,
no edits to `docs/WAVE_QUEUE.md` or any other ledger, and no protected path
(`apps/web/app/boq-pro/**`, `package.json`, `pnpm-lock.yaml`,
`next.config.js`, `middleware.ts`) touched.
