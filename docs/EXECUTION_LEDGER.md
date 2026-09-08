# EXECUTION_LEDGER.md — PI's Execution Controller ledger (AGENTS.md RULE 55)

Maintained by PI. One block per docs/TASK_BOARD.md row PI has reviewed.
Updated on EVERY landing and EVERY stop report fleet-wide — this ledger
is PI's own independently-verified record, not a copy of a row's
self-reported status. A method-review finding that a landed or
in-progress approach is suboptimal routes to the conductor as a
correction relay (PI implements nothing itself).

## Schema

```
### <ROW ID> — <TITLE>
- **Status:** DONE / HALFWAY / IN_PROGRESS / BLOCKED (+ reason) / STUCK
- **Owner:** <seat>
- **Method review:** is this the best possible way? Alternatives
  considered. Suboptimal methods flagged with concrete evidence.
- **Technical execution data:** landing SHA, test pass/fail counts,
  deploy version ID, retries, blocker history, timestamps.
- **TECH_METHOD:**
  - Approach: what was actually built, one or two sentences.
  - Libraries/APIs: named specifically (e.g. "three.js PBR + ACES,"
    "Nominatim," "transformers.js WASM"), not "the usual stack."
  - Key files: the actual files the landing touched.
  - Algorithm/derivation: the real computation/logic used, where one
    exists — not just "it computes X."
  - Verification commands: the exact commands run to confirm the row
    works, as actually run, not a generic "tests passed."
  - ORDER compliance: did execution honor the row's own declared
    dependency sequence (yes/no); any deviation named and flagged.
```

PI authors the TECH_METHOD block from the actual landing diff and the
seat's own report — never invented or assumed. Seats include a method
summary (approach, libraries/files, verification commands run) in
every landing report specifically so PI has real material to draw
from, per RULE 55's 2026-09-08 amendment.

## Log

**Status note (2026-09-08):** RULE 55 stood up this ledger on
2026-09-07; the schema above was amended 2026-09-08 to add the
TECH_METHOD block and ORDER-compliance field. Separately, PI's own
first review cycle is reported (by the operator, in a relay to SCRIBE)
to have surfaced that docs/TASK_BOARD.md was missing several rows
(W-22/23/24/25/37/38/39) that were cited in docs/ACTIVITY_LOG.md —
SCRIBE reconciled the board accordingly on docs/TASK_BOARD.md the same
day. That reconciliation is recorded there, not duplicated here as a
ledger entry, since SCRIBE cannot author PI's own verified ledger
blocks on its behalf (RULE 55 — PI authors this file). This ledger
still has no PI-authored row blocks of its own as of this note; SCRIBE
is not fabricating them here, per RULE 40.

(No PI-authored entries yet — PI's own review cycle populates this
section directly.)

## Cycle summaries

A ledger summary is posted here each cycle, per RULE 55. None yet —
see the status note above.
