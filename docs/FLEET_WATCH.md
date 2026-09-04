# FLEET_WATCH.md — Fleet watch (AGENTS.md RULE 38)

## Revival order (RULE 38(1))
1. **OS-level watchdog** — primary reviver. Restarts a dead/hung seat
   process itself before any other intervention.
2. **Claude-revives-Codex** — secondary. A Claude seat noticing a
   Codex-backed seat (MASON or RIVET) has gone silent prompts/restarts
   it, used only once the primary watchdog has had its chance and the
   seat is still down.

## Heartbeat convention (RULE 38(2))
Every seat keeps a heartbeat line — a timestamp updated at the start of
each turn — in its own `docs/RESUME_<SEAT>.md`, under a `## Heartbeat`
section. This lets any seat or the operator see, from disk alone, how
recently a seat was actually active.

## Daily watch schedule (logged 2026-09-04)

| Window | Expected active | Notes |
|--------|------------------|-------|
| Operator-present hours | CRANE, MASON, RIVET, ATLAS (audit), SCRIBE (ledger) | Normal pull-queue operation per RULE 35; questions route to docs/OPERATOR_INBOX.md per RULE 37 |
| Operator-absent (~8h rest window) | CRANE, MASON, RIVET per RULE 31 overnight autonomy | No blocking queries; OPEN-FOR-OPERATOR lines accumulate in docs/OPERATOR_INBOX.md for the next operator-present beat |
| Gap-filler condition | FERRITE | Activates only if both CRANE and MASON are simultaneously at limit, per RULE 33(1) |

This schedule is logged once per day; SCRIBE updates the table above
rather than re-deriving the watch pattern from memory each time.

## One alert channel (RULE 38(4))

All fleet alerts — a seat down, a revival triggered, a watch-schedule
gap — route to exactly one operator channel: **chat with the operator**
(the same channel through which RULE 36 observations and RULE 37
answers already flow). No seat improvises a second channel. If a
dedicated out-of-band channel (email, Slack, SMS) is stood up later,
this file is the place that gets updated first, and this note is
revised, not silently superseded.
