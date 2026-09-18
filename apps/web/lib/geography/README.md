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
`UNAVAILABLE`/`EXTERNAL_GATE`, never toward a silent pass.

## Inputs

| Field | What it evidences |
|---|---|
| `jurisdiction` | Country/region, and how it was obtained (`source`) — `ip-geolocation` is accepted but capped at `INDICATIVE`. |
| `datasetCoverage` | Whether the feature's data actually covers this jurisdiction, and when it was last refreshed. |
| `regulatoryVerification` | Whether a named human/authority verified the regulatory content, only checked when the feature declares `requiresRegulatoryVerification`. |
| `localization` | Locale, translated flag, and completeness (0–1), only checked when `requiresLocalization`. |
| `serviceAvailability` | Whether the live backend this feature calls is operational, only checked when `requiresLiveService`. |

## Outputs

Every call returns a `CapabilityVerdict`: `status`, a human `reason`, the
`evidence` list actually used (each item dated and dimensioned), a
`freshness` verdict, and a `fallback` string describing what to render
instead of the full feature.

| Status | Meaning | Fallback |
|---|---|---|
| `AVAILABLE` | All required evidence present, fresh, verified. | None — render in full. |
| `INDICATIVE` | Evidenced but stale, or jurisdiction from a low-trust signal (IP only). | Render watermarked `INDICATIVE — NOT A LEGAL OPINION`. |
| `PARTIAL` | Evidenced but localization incomplete. | Render what's covered; label the gap. |
| `EXTERNAL_GATE` | Regulatory verification required and not on record as verified. | Do not compute/publish; route to the compliance queue. |
| `UNAVAILABLE` | No jurisdiction declared, no dataset coverage, or a required live service is down. | Do not render; show an explicit not-available state. |

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
