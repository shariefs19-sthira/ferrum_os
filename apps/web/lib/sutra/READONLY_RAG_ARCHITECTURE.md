# SUTRA read-only knowledge access & retrieval policy

Scope: five deterministic TypeScript policy modules under this
directory (`apps/web/lib/sutra/`) that govern how SUTRA's retrieval
path selects, packages, and hands knowledge-base/project context to a
model adapter. No network calls, no external SDKs, no secrets. Every
exported function is a pure function of its arguments — no hidden
clock or I/O — so behaviour is fully testable and auditable from the
call site.

This complements, and does not modify, the existing
`sandboxPolicy.ts` (SUTRA's project-mutation sandbox contract). That
module governs whether an agent may *act* on a project; the modules
below govern what an agent may *read* to inform that action.

## Modules

- **`ragClassification.ts`** — `DataClassification` = `PUBLIC` |
  `PROJECT_SENSITIVE` | `PERSONAL` | `RESTRICTED`, ranked in that
  order. Classification is declared metadata on each
  `KnowledgeFragment`, set at ingestion — never inferred from content
  here. `isVisibleToTenant` enforces that anything above `PUBLIC` only
  resolves inside its own tenant/project.

- **`ragAdapterBoundary.ts`** — the local/open-model vs external-model
  boundary. `AdapterIdentity` distinguishes `LOCAL_OPEN_MODEL` (runs
  inside Ferrum's own boundary) from `EXTERNAL_MODEL` (a connected
  provider — Claude or Codex). `ADAPTER_CLASSIFICATION_CEILING` caps
  what each adapter kind may ever receive: the local adapter may see
  up to `RESTRICTED`; the external adapter tops out at
  `PROJECT_SENSITIVE` only after a specific human disclosure-consent record;
  `PERSONAL` and `RESTRICTED` fragments never
  reach an external provider through this path, by construction, not
  by convention.

  `EXTERNAL_ADAPTER_PERMISSION_ENVELOPE` is a `Object.freeze`d
  constant every external-adapter call carries: `canWriteProjectData`,
  `canWriteRepository`, `canModifyWebsite`, `canDeploy`,
  `canDeleteData`, `canAdministerAccounts` and
  `canTrainOnDisclosedData` are all `false`; `allowedOperations` is
  `['READ', 'RETRIEVE', 'SUMMARIZE', 'CITE']`. This is the no-write /
  no-website-change guarantee for external Claude/Codex providers —
  frozen so no call site can widen it at runtime; a genuinely broader
  grant would require a new, separately-reviewed type, never a
  mutation of this one.

- **`ragContextPackaging.ts`** — `packageMinimumNecessaryContext` only
  ever includes fragments a request explicitly named by id (never a
  broader matching set), drops anything tenant-invisible or above the
  target adapter's ceiling — reporting each exclusion with its
  specific reason — and applies deterministic pattern-based redaction
  (`redactPersonalData`: email, phone, national-ID-shaped sequences)
  before packaging. Every packaged fragment still carries its source
  `RetrievalCitation`; nothing is packaged without provenance attached.

- **`ragRetrievalRecord.ts`** — prompt-injection resistance. Retrieved
  content is treated as data, never as instructions:
  `scanForInjectionPatterns` flags instruction-shaped text
  (`"ignore ... instructions"`, role-override attempts, secret
  exfiltration requests, privilege-escalation requests) without ever
  stripping, rewriting, or executing it. `buildRetrievalRecords` tags
  every record `contentFence: 'DATA_NOT_INSTRUCTION'` so a downstream
  prompt-builder has a fixed marker to fence retrieved text by,
  independent of what the text itself says.

- **`ragAuditEvents.ts`** — pure event builders
  (`auditRetrievalRequested`, `auditContextPackaged`,
  `auditsForRetrievalRecord`, `auditAdapterDecision`) covering request,
  packaging, redaction, injection-flag, and adapter-grant/deny events.
  Callers supply `timestamp` explicitly and own persisting the
  returned events to whatever audit sink the deployment uses — this
  module only shapes the event, it never writes anywhere.

## Retrieval flow (as composed by a caller; no orchestrator is added here)

1. Caller builds a `ContextRequest` naming exactly the fragment ids it
   needs, the requesting tenant/project, and the target
   `AdapterIdentity`.
2. `packageMinimumNecessaryContext` resolves it against a fragment
   catalogue → `PackagedContext` (included + excluded, each excluded
   id with its reason).
3. `buildRetrievalRecords` turns the packaged fragments into
   injection-scanned, citation-carrying, fenced `RetrievalRecord`s.
4. `resolveAdapterDecision` is checked per fragment before handoff to
   an `EXTERNAL_MODEL` adapter, attaching the frozen permission
   envelope.
5. The audit builders produce the event trail for steps 1–4; the
   caller's own audit sink persists them.

## Explicit non-goals of this slice

- No network calls, no real knowledge-base wiring, no UI.
- External `PROJECT_SENSITIVE` disclosure needs a consent-store verifier result,
  matched against an immutable consent id, record digest/version, project,
  provider/model, classification, fragment and read-only retrieval purpose. A
  caller-supplied frozen consent record and request-asserted retention do not qualify.
- No claim that any model is "trained" on Ferrum data — training
  consent lives entirely in `sandboxPolicy.ts`'s existing
  `TrainingConsent` type, which this slice does not alter.
- No governance-ledger edits (`docs/WAVE_QUEUE.md`, `AGENTS.md`, etc.)
  — those remain SCRIBE's domain.
- Not wired into any route, worker, or UI surface — this is the
  policy layer only, isolated under this directory, ready for a
  separate wiring pass.
