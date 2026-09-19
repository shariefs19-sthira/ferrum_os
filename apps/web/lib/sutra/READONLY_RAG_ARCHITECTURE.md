# SUTRA read-only retrieval boundary

This domain-only slice contains deterministic classification, sandbox, source,
redaction, injection-scanning and audit policies. It has no network calls,
provider SDK, route, worker or UI integration. It is NOT LIVE.

## Server-owned handoff

`ragRetrievalHandoff.server.ts` is the only content-producing retrieval entry
point: `handoffRetrieval(request, catalogue, sources)`. It imports Next's existing
server-only marker, which prevents use from client components. The server must
supply ingestion-owned catalogue/source metadata and authenticated tenant/project
identity when a future route is integrated. This slice does not implement those
repositories or authentication and must not be treated as a ready HTTP endpoint.

Public callers supply request and consent-reference data only. There is no
exported composition factory, injectable consent store, verifier, proof minting
function, or record registration API. The consent authority is module-private
and frozen. **No authoritative consent repository is connected, so all external
PROJECT_SENSITIVE disclosure is disabled**, including frozen caller references,
proofs and purported successful decisions. Retention choice never grants consent.
A future server implementation must verify human consent against immutable record
id/digest/version, tenant/project, provider/model, classification, exact fragment,
read-only retrieval purpose, expiry and revocation. This requires a separately
reviewed integration; this slice intentionally provides no request-configurable
way to enable disclosure and no fabricated successful consent fixture.

The handoff checks each explicitly requested fragment before packaging:

1. Tenant/project visibility and adapter classification ceiling.
2. Exact sandbox tenant/project, provider/model and request identity.
3. Fragment membership in requested and disclosed sandbox context.
4. Read-only access and the existing `evaluateSandboxRequest` policy, including
   external training denial and excess-context rejection.
5. Explicit no-retention or Ferrum-managed retention for external adapters.
6. Matching source and the existing `canUseForRetrieval` licence/consent policy.
7. Authoritative consent for external PROJECT_SENSITIVE content (closed).
8. Pattern redaction and citation-preserving packaging of passing fragments only.

Packaging occurs inside the same synchronous boundary as the decision. There is
no public `packageMinimumNecessaryContext` bypass. The exported diagnostic
`resolveAdapterDecision` returns reasons and an envelope, but that value is never
accepted as packaging authorization and cannot be replayed for different content.
The frozen external envelope grants READ/RETRIEVE/SUMMARIZE/CITE only; no write,
website, administration, deletion, deployment or training authority is granted.

## Supporting modules

- `ragClassification.ts`: ingestion-declared classification and tenant visibility.
- `ragAdapterBoundary.ts`: request/value types, frozen permission envelope and
  classification ceiling; no service constructor or consent verifier export.
- `ragContextPackaging.ts`: packaging value types and deterministic email/phone/
  national-ID pattern redaction only. Redaction is a secondary control, never
  authorization or a complete personal-data detector.
- `ragRetrievalRecord.ts`: citation-preserving injection scanning and
  `DATA_NOT_INSTRUCTION` fencing; it neither retrieves nor authorizes content.
- `ragAuditEvents.ts`: pure event builders with caller-supplied timestamps;
  persistent audit integration remains outside this slice.

## Verification boundary

Adversarial tests exercise absent/forged consent, injected always-true stores and
verifiers, frozen proofs/approvals, replayed diagnostic decisions, source denial,
retention, training, context and identity mismatch. PUBLIC external retrieval and
visible local retrieval still pass when all gates hold. Tests mock only Next's
server-only environment marker; consent and policy code are never mocked.
No rendered evidence applies because this change introduces no UI. Passing domain
tests and builds are not deployment or provider-integration evidence.
