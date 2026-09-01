# DILRMP / ULPIN LIVE-DATA ONBOARDING (CRANE-authored, 2026-09-01)

## 0. Purpose and what was actually verified

This document is the prep material for onboarding to a real,
parcel-level land-records data source — the gap `LiveLandRecordsProvider`
(W2-316) is built to fill once that access exists. It is not a
substitute for actually completing that onboarding, and it does not
claim access exists today.

**What real research (web search, 2026-09-01) confirmed:**

- The Digital India Land Records Modernisation Programme (DILRMP) is
  run by the Department of Land Resources (`dolr.gov.in`), with a
  management portal at `dilrmp.gov.in` (DILRMP-MIS) that is
  login-gated — no open, unauthenticated API for parcel-level ULPIN
  lookup was found there.
- The Open Government Data (OGD) Platform India (`data.gov.in`) hosts
  DILRMP-related datasets, but they are **programme/aggregate-level**
  (e.g., state-wise DILRMP component progress), not per-parcel ULPIN
  records. `data.gov.in` access itself is self-service and free: a
  standard account registration, then an API key from the account
  dashboard — this part genuinely is a "documented public endpoint" in
  the sense that anyone can sign up and get a key today.
- No India-specific public API for granular construction material
  rates (cement, steel, labor) was found either. The Office of the
  Economic Adviser publishes Wholesale Price Index data, typically as
  periodic bulletins/reports rather than a queryable REST API; no
  confirmed matching resource was found on `data.gov.in`.

Both `LiveLandRecordsProvider` and `LiveMarketRatesProvider` are built
against this reality: they attempt a live call only when an API key is
configured, and — because no genuine parcel-level or granular-rate
source was confirmed to exist — they currently always fall through to
the D1 seed data, `indicative: true` preserved throughout.

## 1. What's self-service today

- **`data.gov.in` API key**: register a free account, generate a key
  from "My Account." This unlocks the general OGD API, which can query
  the DILRMP programme-level datasets already confirmed to exist. It
  does **not** unlock parcel-level ULPIN lookups.
- Setting `OGD_API_KEY` in the Worker's environment (Cloudflare secret,
  not committed to the repo) is the only configuration step this key
  requires on Ferrum OS's side — `LiveLandRecordsProvider`/
  `LiveMarketRatesProvider` already read it (`worker.ts`'s `Env` type).
  Because no confirmed matching resource exists for either provider's
  actual data need, configuring this key today would not change
  behavior — both providers' live-lookup methods are stubbed to return
  `null` until a real resource ID is confirmed and wired in.

## 2. What requires a real onboarding process (not self-service)

- **Parcel-level ULPIN/land-record access**: DILRMP's own architecture
  integrates land records at the state level (each state runs its own
  Bhulekh/land-record system, feeding into the national DILRMP-MIS).
  There is no single national self-service API for this — the DILRMP
  documentation found in research references MOUs between the
  programme and outsourced agencies/states, implying a formal,
  state-by-state or programme-level data-sharing agreement is the real
  path, not a signup form.
- **The concrete steps this document cannot specify with confidence**:
  who at the Department of Land Resources to contact, what
  documentation an applicant organization needs to provide, and how
  long the process takes. These are exactly the questions a real
  onboarding application would need to answer, and this document does
  not fabricate answers to them — the honest state is "unknown until
  someone actually initiates contact with DoLR/a state land-records
  department."

## 3. What this means for the "graceful fallback" design

Because §2's real access doesn't exist yet, `LiveLandRecordsProvider`
and `LiveMarketRatesProvider`'s fallback path (D1 seed data) is not a
degraded mode for occasional failures — it is, honestly, the only path
that runs today. That's a correct, working state, not a bug: every
API response and MCP tool call remains `indicative: true` exactly as
`docs/AGENT_INTERFACE.md` already commits to, regardless of which path
answered it.

## 4. Next steps, if pursued

1. Register a `data.gov.in` account and confirm (via their catalog
   search, not assumed) whether any dataset shape actually matches
   Mode 2's govt-reference-rate need or a market-rate need better than
   the current illustrative sample data — if one exists, wire it in as
   a real `tryLiveRate`/`tryLiveLookup` implementation, still gated on
   `OGD_API_KEY` being configured.
2. For parcel-level ULPIN access: initiate contact with the Department
   of Land Resources (`dolr.gov.in`) or the relevant state land-records
   department, following whatever formal process they specify — this
   is an operator/business action, not something buildable in code.
3. Until either happens, `LiveLandRecordsProvider`/
   `LiveMarketRatesProvider` stay exactly as built: real integration
   points, honestly not yet backed by a real source.
