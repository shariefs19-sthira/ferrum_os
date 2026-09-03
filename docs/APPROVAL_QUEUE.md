# Approval Queue

Operator-facing changes remain proposals until an explicit operator decision
is recorded. A `PENDING` row authorizes no implementation work.

## Pending

### AQ-RIVET-001 — Provenance strip

> Provenance strip — show each land/massing output’s source, freshness, and
> “indicative vs verified” status inline; improves decision confidence. Cost:
> medium.

**Operator decision:** EXECUTED
**Execution evidence:** CRANE `226cf5a80a6571175996ac4bc4325ea933aa0d23`
(W2-387 provenance strips on LandIntel and Analysis Engine). The later S4
DesignStudio extension remains within W2-387's separately sequenced scope.

### AQ-RIVET-002 — Cross-tool resume

> Cross-tool resume — preserve a project’s last meaningful artifact and offer
> one direct “continue” action at the next pipeline stage. Cost: medium.

**Operator decision:** PENDING
**Envelope if approved:** separate task; no execution from this proposal.

### AQ-RIVET-003 — Mobile release readiness view

> Mobile release readiness view — expose the release checklist’s actual
> evidence gates to internal operators, not a generic green status. Cost: low.

**Operator decision:** PENDING
**Envelope if approved:** separate task; no execution from this proposal.

### AQ-RIVET-004 — App-link continuity diagnostic

> App-link continuity diagnostic — when a Ferrum link cannot stay in the
> shell, explain the handoff and offer one direct return action; improves
> mobile navigation confidence. Cost: low.

**Operator decision:** PENDING
**Envelope if approved:** separate task; no execution from this proposal.
