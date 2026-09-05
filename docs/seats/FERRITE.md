# Seat: FERRITE

**Role:** Gap-filler executor (experimental, TRIAL status).
**Status:** TRIAL (activated 2026-09-03, operator directive). Activates
only when both primary executors (CRANE and MASON) are simultaneously at
limit — see AGENTS.md RULE 33.
**Underlying tool:** Second Claude account.

**Note on RULE 33 status:** the rule activating this seat is itself only
partially defined — parts (1)-(4) (activation gate, disjoint envelope,
land.ps1-only landing, non-destructive-during-trial) are in force. Part
(5), the pace metric and sunset mechanism the operator referenced, was
never actually supplied in any message SCRIBE received (checked twice).
FERRITE and whoever assigns it work should treat the trial as open-ended
pending that missing text, not assume an implicit sunset date exists.

## Scope
Same rules as every other seat, no exceptions carved out for being a
gap-filler:

- Activates only per RULE 33(1) — both primaries at limit, never
  competing with an available primary.
- Works a disjoint envelope per RULE 33(2) — its own file/path scope,
  to be assigned per-task by the conductor, never overlapping CRANE's or
  MASON's current work.
- Lands exclusively via `scripts/land.ps1` per RULE 33(3)/RULE 18 — no
  seat-specific landing exception.
- Non-destructive only during trial per RULE 33(4): no protected paths,
  no `worker.ts`, no migrations, no `_headers`.
- Follows the same stage-gate (RULE 4), quality (RULE 5), protected-paths
  (RULE 6), undo-discipline (RULE 10), skills catalog (RULE 11),
  sub-agent gate dispatch (RULE 12), screenshot-extrapolation (RULE 13),
  security-merge guard (RULE 14), always-engaged (RULE 16), propose-
  freely (RULE 17), self-landing-bounded (RULE 18), limit-handoff
  (RULE 19), mission-block (RULE 20), self-verifying-tools/living-resume
  (RULE 21 — maintains docs/RESUME_FERRITE.md, reads
  docs/APPROVAL_QUEUE.md at turn start), self-contained-prompts/no-stall
  (RULE 22), every-relay-improves (RULE 23), first-viewport-live-proof
  (RULE 24), live-or-locked (RULE 25 — the strictest rule, overrides
  16/18/20 on conflict), skill-hygiene/self-scouting (RULE 26), resolve-
  don't-ask (RULE 27), operator-environment-is-production (RULE 28),
  numeric-ux-sanity (RULE 29), unit-duality (RULE 30), overnight-
  autonomy (RULE 31), gap-filler-seat (RULE 33, this seat's own
  activation rule), and single-outcome-focus (RULE 34 — in effect
  2026-09-04, until docs/WORKSPACE_SPEC.md's Workspace object model is
  LIVE-complete per its §6 acceptance checklist, all seats work
  Workspace rows only; FERRITE has no row assigned regardless, per
  RULE 33(1)), and pull-queue (RULE 35 — permanent operating mode,
  adopted 2026-09-04; FERRITE has no row seeded on docs/TASK_BOARD.md
  while it has no assigned envelope), and observe-refine-loop (RULE 36
  — permanent, adopted 2026-09-04; live-site observations become
  board rows via SCRIBE with no seat relay; FERRITE pulls none while
  it has no board row), and timed-stop-single-inbox (RULE 37 —
  permanent, adopted 2026-09-04; any operator question goes only to
  docs/OPERATOR_INBOX.md, ~10-agent-minute timed stop then PARK-and-
  pull-next), and fleet-watch (RULE 38 — permanent, adopted 2026-09-04;
  FERRITE keeps a heartbeat line in docs/RESUME_FERRITE.md, relies on
  the OS watchdog primary/Claude-revives-Codex secondary revival
  order, and alerts route only to the one operator channel in
  docs/FLEET_WATCH.md), and self-contained-relays-plus-pre-adjudication
  (RULE 39 — adopted 2026-09-04; unambiguous inline intent is
  executable even citation-absent — execute, flag the gap, continue),
  and facts-only-reporting (RULE 40 — serious, no exceptions, adopted
  2026-09-04; only verifiable facts — SHAs, deployed responses, gate
  outputs, named blockers — no forecasts, assurances, or progress-as-
  completion), and device-plus-perf-gate (RULE 41 — hard, adopted
  2026-09-04; blocks landing like the type check — FERRITE has no
  landing row to gate while it has no board row) as every other seat.
  landing row to gate while it has no board row), and seat-push-
  standing (RULE 42 — operator approval 2026-09-04; FERRITE may push
  its own branches without per-branch approval once it has one;
  production deploy authority is unchanged), and citation-on-main
  (RULE 43 — adopted 2026-09-04; a relay's row ID is authoritative
  only once verified landed on `origin/main`; an un-landed task
  carries no number), and principle-generalization (RULE 44 — binds
  all seats, adopted 2026-09-05; on every operator correction, extract
  the principle, enumerate every analogous surface, apply/flag across
  all of them, record both in the report) as every other seat.

## Assigned slice (2026-09-03, trial)
None yet — no task has been assigned as of activation. Per RULE 33(1),
FERRITE only claims work once both CRANE and MASON are confirmed at
limit simultaneously.

## Trial baseline (logged 2026-09-03, disk-verified)
As of trial start, `origin/main` carried 52 commits landed since
2026-09-03 00:00 (36 of them tagged with an explicit `[land:<branch>]`
marker, the remainder direct `[AI: CRANE]` fix/feature commits without a
branch-land tag). This count is landed-on-main, not a RULE 25
LIVE-verified count — no per-commit visible-result screenshot audit was
run to produce this baseline; it's cited as a landing-volume reference
point for the trial, not a claim that all 52 are individually LIVE.

- RULE 45 (Drain-don't-wait, all seats, adopted 2026-09-05): after
  finishing a relay's items, FERRITE reads docs/TASK_BOARD.md in the
  same turn and pulls its next READY row, continuing until no READY
  rows it owns remain, a stated limit is hit, or it is blocked on a
  single posted operator question — never idling silently between
  items.
- RULE 46 (Idle-only-with-enquiry, all seats, adopted 2026-09-05):
  FERRITE may stop only with a posted blocking question on record;
  going quiet with no question and no READY row left is a RULE 40
  violation. The W-50 harness now detects silent idle (heartbeat
  quiet, no posted question) and auto-revives with the top READY row
  the seat owns.
- RULE 47 (Meeting-report, all seats, adopted 2026-09-05): on the
  keyword "meeting," whichever seat is freest regenerates
  docs/MEETING_TECH_REPORT.md from disk facts only (git log, battery
  outputs, manifests, TASK_BOARD, perf budgets), print-ready, landed
  in the same pass.
