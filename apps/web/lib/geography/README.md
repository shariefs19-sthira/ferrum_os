# Region capability policy

`evaluateFeatureAvailability()` decides, per feature and per request, whether
locality-aware content can render — Netflix-style "available in your region"
for data and regulatory conclusions, never for device/browser capability.
Every device gets the same tools; only jurisdiction-dependent *content*
varies, and only on evidence the caller supplies explicitly.

## Hard rule

The engine never infers a jurisdiction, a compliance conclusion, or evidence
freshness. Every input (`Jurisdiction`, `DatasetCoverage`,
`RegulatoryVerification`, `LocalizationStatus`, `ServiceAvailability`) is
either supplied by the caller with its own provenance, or the corresponding
check is treated as missing — which drives the verdict toward
`UNAVAILABLE`/`EXTERNAL_GATE`, never toward a silent pass. This extends to
flags, not just presence: `regulatoryVerification.verified: true` is only
accepted with `verifiedBy` + `verifiedAt` + `citation` attached (otherwise
it's `EXTERNAL_GATE`, same as absent), and `serviceAvailability.operational:
true` is only accepted with a valid, non-future `checkedAt` inside the
freshness bound (otherwise it's `UNAVAILABLE`, same as reported-down). A
dataset (or service check) timestamp that is in the future relative to the
evaluation time is a clock/data-integrity fault — `freshness.clockInvalid`
is set explicitly and the timestamp is never clamped to "fresh".

## Inputs

| Field | What it evidences |
|---|---|
| `jurisdiction` | Country/region, how it was obtained (`source`), and, for a `project-record`, its persisted record ID and citation. A `user-declared` value is ephemeral/unverified and always remains `UNAVAILABLE`; it never creates a project record or establishes coverage. `ip-geolocation` is accepted but capped at `INDICATIVE`. |
| `datasetCoverage` | Whether the feature's data actually covers this jurisdiction, when it was last refreshed, and a citable source URL. A bare `covered: true` is not accepted as coverage evidence. |
| `regulatoryVerification` | Whether a named human/authority verified the regulatory content — `verified: true` requires `verifiedBy` + `verifiedAt` + `citation` to be accepted — only checked when the feature declares `requiresRegulatoryVerification`. |
| `localization` | Locale, translated flag, and completeness (0–1), only checked when `requiresLocalization`. |
| `serviceAvailability` | Whether the live backend this feature calls is operational — `operational: true` requires a valid, non-future `checkedAt` within `maxServiceCheckAgeMinutes` (default 15) to be accepted — only checked when `requiresLiveService`. |

## Outputs

Every call returns a `CapabilityVerdict`: `status`, a human `reason`, the
`evidence` list actually used (each item dated and dimensioned), a
`freshness` verdict, and a `fallback` string describing what to render
instead of the full feature.

| Status | Meaning | Fallback |
|---|---|---|
| `AVAILABLE` | Cited persisted project jurisdiction, cited coverage evidence, and all other required evidence present, fresh, and verified with full attribution. | None — render in full. |
| `INDICATIVE` | Evidenced but stale, dataset timestamp is clock-invalid (future), or jurisdiction from a low-trust signal (IP only). | Render watermarked `INDICATIVE — NOT A LEGAL OPINION`. |
| `PARTIAL` | Evidenced but localization incomplete. | Render what's covered; label the gap. |
| `EXTERNAL_GATE` | Regulatory verification required and not on record as verified, or `verified: true` lacks verifier/date/citation attribution. | Do not compute/publish; route to the compliance queue. |
| `UNAVAILABLE` | No jurisdiction declared, no dataset coverage, a required live service is reported down, or `operational: true` lacks a valid/fresh/non-future `checkedAt`. | Do not render; show an explicit not-available state. |

Severity ordering when several dimensions degrade at once: `UNAVAILABLE` >
`EXTERNAL_GATE` > `INDICATIVE` > `PARTIAL` > `AVAILABLE` — the worst
triggered dimension wins, and its reason is what the verdict reports.

## Non-goals

- Does not gate device/browser/UI capability — that is always equal
  regardless of region.
- Does not call out to any service, geolocation API, or database — it is a
  pure function over the evidence it is handed.
- Does not decide *what* a project's applicable law is (that stays in
  `lib/regions/regionPolicy.ts`'s project-jurisdiction model) — this engine
  only decides whether a given *feature* is safe to show, given evidence
  about that jurisdiction.

## Files

- `types.ts` — input/output types.
- `capabilityPolicy.ts` — `evaluateFeatureAvailability()`.
- `capabilityPolicy.test.ts` — coverage of every status and the severity
  ordering between simultaneous downgrades.
- `index.ts` — public barrel export.
