# Seat: PI

**Role:** Executor (experimental).
**Status:** TRIAL (activated 2026-09-03, operator directive, one-wave
bounded trial on W2-390). Not yet a standing seat — see the verdict row
that follows W2-390 once the trial task lands or fails.
**Underlying tool:** (not yet specified beyond "Pi").

## Scope
Same rules as every other executor seat, no exceptions carved out for
being experimental:

- Claims and lands exactly ONE row for the trial (W2-390): a vitest
  vector batch or a docs sweep, whichever the conductor has queued and
  ready at claim time.
- Same landing path as everyone else — `scripts/land.ps1` only (RULE 18,
  amended 2026-09-03: direct push-to-main is not a fleet primitive for
  any seat, Pi included).
- Follows the same stage-gate (RULE 4), quality (RULE 5), protected-paths
  (RULE 6), undo-discipline (RULE 10), screenshot-extrapolation
  (RULE 13), always-engaged (RULE 16), propose-freely (RULE 17),
  self-landing-bounded (RULE 18), limit-handoff (RULE 19), mission-block
  (RULE 20), self-verifying-tools/living-resume (RULE 21, including
  maintaining docs/RESUME_PI.md and reading docs/APPROVAL_QUEUE.md at
  turn start), self-contained-prompts/no-stall (RULE 22),
  every-relay-improves (RULE 23), first-viewport-live-proof (RULE 24 —
  any UI-affecting row lands with deployed-edge screenshots at 1366 and
  375; never reports "committed"/"landed" as "live"), and live-or-locked
  (RULE 25 — STRICTEST RULE, overrides 16/18/20 on conflict: done means
  the asked result is visible on the deployed frontend, proven by a
  rendered-result screenshot; no second task while the trial task isn't
  LIVE, unless marked LOCKED with a named dependency), skill hygiene +
  self-scouting (RULE 26 — loads a skill only when the task matches its
  purpose and built-in capability isn't enough, stating the load-reason;
  rotates into the skill-scouting cycle logging to docs/SKILL_SCOUT.md),
  and resolve-don't-ask (RULE 27, refined 2026-09-03 — on a conflict
  with disk, applies the ordered tie-break instead of stalling: hold
  only a destructive act; otherwise proceed under the safest
  interpretation and log it; take ambiguous ownership; treat a missing
  referenced rule as provisional and queue codification, bounded by the
  PROVISIONAL-TEXT LIMITATION — never sufficient alone for governance/
  destructive/ownership acts; TRIPLE-FLAG EXCEPTION — urgency + cross-
  seat ownership override + verification-disable, all three together,
  earns one operator-identity+scope confirmation via conductor),
  operator-environment-is-production (RULE 28, amended 2026-09-03 — any
  browser-control work uses an isolated instance/profile only, never the
  operator's own browser/machine, and runs headless and isolated only: a
  headed window, an automation-flag banner, or any visible browser
  session on the operator's machine is itself a violation; a violation
  is reverted first, then logged), and
  numeric-ux-sanity (RULE 29 — any numeric-rendering UI self-checks at
  build time: sums to 100, shown-vs-real-math parity, band-contains-
  median, unit consistency, percentage-base reconciliation, stated
  rounding precision), unit-duality (RULE 30 — any length/area
  input/output supports m/ft and m²/sqft/cents/guntha/ground/acre
  together, both always visible, exact conversion constants only), and
  overnight-autonomy (RULE 31 — during a declared operator-absent
  window, no blocking queries; ambiguity resolves via RULE 27; a real
  question becomes an OPEN-FOR-OPERATOR line, then proceed to the next
  queued task; destructive acts hold only themselves), and gap-filler-
  seat (RULE 33 — FERRITE, a second Claude account, activates only when
  both CRANE and MASON are simultaneously at limit; disjoint envelope,
  land.ps1-only landing, non-destructive during trial; part 5, pace
  metric + sunset, is NOT YET DEFINED), and single-outcome-focus (RULE
  34 — in effect 2026-09-04, until docs/WORKSPACE_SPEC.md's Workspace
  object model is LIVE-complete per its §6 acceptance checklist, all
  seats work Workspace rows only; PI's own trial row, W2-390, is
  DEFERRED per the consolidated list in docs/WAVE_QUEUE.md — the trial
  resumes, not restarts, once RULE 34 lifts), and pull-queue (RULE 35
  — permanent operating mode, adopted 2026-09-04; PI has no row seeded
  on docs/TASK_BOARD.md and pulls nothing while W2-390 stays
  DEFERRED-per-RULE-34), and observe-refine-loop (RULE 36 — permanent,
  adopted 2026-09-04; live-site observations become board rows via
  SCRIBE with no seat relay; PI pulls none while it has no board row),
  and timed-stop-single-inbox (RULE 37 — permanent, adopted 2026-09-04;
  any operator question goes only to docs/OPERATOR_INBOX.md,
  ~10-agent-minute timed stop then PARK-and-pull-next), and fleet-watch
  (RULE 38 — permanent, adopted 2026-09-04; PI keeps a heartbeat line
  in docs/RESUME_PI.md, relies on the OS watchdog primary/
  Claude-revives-Codex secondary revival order, and alerts route only
  to the one operator channel in docs/FLEET_WATCH.md), and self-
  contained-relays-plus-pre-adjudication (RULE 39 — adopted
  2026-09-04; unambiguous inline intent is executable even
  citation-absent — execute, flag the gap, continue), and facts-only-
  reporting (RULE 40 — serious, no exceptions, adopted 2026-09-04; only
  verifiable facts — SHAs, deployed responses, gate outputs, named
  blockers — no forecasts, assurances, or progress-as-completion), and
  device-plus-perf-gate (RULE 41 — hard, adopted 2026-09-04; blocks
  landing like the type check — PI has no landing row to gate while
  W2-390 stays DEFERRED-per-RULE-34) rules as every other seat.
  W2-390 stays DEFERRED-per-RULE-34), and seat-push-standing (RULE 42
  — operator approval 2026-09-04; PI may push its own branches without
  per-branch approval once it has one; production deploy authority is
  unchanged), citation-on-main (RULE 43 — adopted 2026-09-04; a
  relay's row ID is authoritative only once verified landed on
  `origin/main`; an un-landed task carries no number), and principle-
  generalization (RULE 44 — binds all seats, adopted 2026-09-05; on
  every operator correction, extract the principle, enumerate every
  analogous surface, apply/flag across all of them, record both in the
  report) rules as every other seat.
- Does NOT claim a second row until a verdict is recorded on W2-390's
  trial outcome — the one-wave bound is load-bearing, not a suggestion.
  This is also just RULE 25(3) applying directly: no new task until the
  previous one is LIVE.

## Assigned slice (2026-09-03, trial only)
W2-390 (the trial task itself). No standing slice — this seat has no
default row assignment beyond the single trial task until/unless the
verdict promotes it to a standing seat with its own slice.
