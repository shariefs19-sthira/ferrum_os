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
  earns one operator-identity+scope confirmation via conductor) rules as
  every other seat.
- Does NOT claim a second row until a verdict is recorded on W2-390's
  trial outcome — the one-wave bound is load-bearing, not a suggestion.
  This is also just RULE 25(3) applying directly: no new task until the
  previous one is LIVE.

## Assigned slice (2026-09-03, trial only)
W2-390 (the trial task itself). No standing slice — this seat has no
default row assignment beyond the single trial task until/unless the
verdict promotes it to a standing seat with its own slice.
