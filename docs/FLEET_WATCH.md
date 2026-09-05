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

## One alert channel — ntfy (RULE 38(4), amended 2026-09-04)

All fleet alerts — a seat down, a revival triggered, a watch-schedule
gap — route to exactly one operator-designated channel: **ntfy**, via
the topic named by the `FLEET_NTFY_TOPIC` environment variable. This
amends the original chat-only spec: the operator explicitly requested
push alerts after that spec had already landed, and the later verbatim
instruction wins over the earlier one it directly contradicts (RULE 27
precedent — a later, more specific operator instruction supersedes an
earlier general one it conflicts with).

This does not change where anything else lives:
- **Chat** — still the surface for the operator's own live-site
  observations feeding RULE 36's intake. Not for alerts.
- **`docs/OPERATOR_INBOX.md`** — still the only surface for seat-to-
  operator *questions* per RULE 37. Not for alerts.
- **ntfy (`FLEET_NTFY_TOPIC`)** — alerts only: seat-down, revival-fired,
  watch-schedule-gap notifications. Nothing else routes here.

No seat improvises a fourth channel, or substitutes chat/inbox for an
ntfy alert.

## Watchdog probe + Codex-reviver authorization (RULE 38(5))

The OS-level watchdog's process probing, and the Claude-revives-Codex
fallback described under Revival order above, are explicitly operator-
authorized (verbatim, 2026-09-04) — not a capability any seat inferred
or self-granted. Recorded here so this authorization doesn't need to be
re-established or re-questioned by a future seat reading this file cold.

## W-50 harness — auto-deploy on origin/main advance (RULE 45 amendment,
2026-09-05)

The W-50 revival harness (docs/FLEET_SEATS.json +
scripts/FLEET_WATCH.ps1) is amended: whenever `origin/main` advances,
the harness auto-deploys under the existing guarded STANDING-DEPLOY-
AUTHORITY (RULE 40 approval A: HEAD==origin/main, gates green, deploy
SHA logged, `docs/DEPLOY_STOP` kill-switch honored). Every landing goes
live in the same cycle it lands in — there is no separate deploy relay
for the conductor to issue. This is policy/spec recorded here; the
actual trigger (a post-land hook or a poll-and-compare loop inside
FLEET_WATCH.ps1) is CRANE-territory to implement against W-50's own
files, not something SCRIBE edits directly.

## W-50 harness — silent-idle detection (RULE 46 amendment, 2026-09-05)

The same harness detects silent idle: a seat's heartbeat goes quiet
with no blocking operator question posted on record (per RULE 46). On
detection, the harness (a) raises an ntfy flag (existing alert channel
above), and (b) auto-revives the seat, dispatching the top READY row
it owns via `Get-TopReadyRow` (docs/TASK_BOARD.md table order — the
harness's own established meaning of "priority order," per its own
code comment). This is distinct from the existing reset-time-based
revival (a seat hitting a provider rate limit): silent idle is a seat
that is available but has stopped without cause. Detection/dispatch
logic is CRANE-territory to implement against `scripts/FLEET_WATCH.ps1`
and `docs/FLEET_SEATS.json`; recorded here as the policy/spec those
files must satisfy.

## Kill-switch (RULE 38(6))

A human-operable kill-switch for the watchdog and both revival paths is
retained in full — nothing in RULE 38 or this ntfy amendment removes or
weakens it. Fleet watch is something a human can halt entirely at any
time; this file documents how the watching works, never a substitute
for that override. (The kill-switch's own implementation — script,
flag, or process — is out of scope for this doc; this note exists so
its existence and precedence are on record.)
