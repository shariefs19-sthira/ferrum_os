---
name: ferrum-discipline
description: Operating rules for any seat working in the Ferrum OS repo — encodes AGENTS.md rules 1-13, the COMPLIANCE_GATE Stage-1 discipline, and the INDICATIVE watermark requirement. Load before claiming or landing a docs/WAVE_QUEUE.md row.
---

# Ferrum OS operating discipline

Source of truth is always `AGENTS.md` and `docs/COMPLIANCE_GATE.md` on
`main` — this file is a working summary, not a replacement. If this
skill and `AGENTS.md` ever disagree, `AGENTS.md` wins; re-derive this
file from it rather than trusting a stale copy.

**Known gap, as of this skill's authoring:** the operator has referenced
a "RULE 14" (post-land CSP verification) and "RULE 15" (mission orders)
in conversation. Neither exists in `AGENTS.md` on `main` as of this
writing — only RULE 1 through RULE 13 are landed. Do not treat RULE
14/15 content below as authoritative; it isn't here because it doesn't
exist yet. Re-check `AGENTS.md` for `## RULE 14` / `## RULE 15` before
relying on anything beyond RULE 13.

## RULE 1 — Roster

Active seats and who owns what changes over time — check `AGENTS.md`
RULE 1 directly for the current roster and any disjoint-ownership
protocol in force (e.g. the 2026-09-01 ATLAS/CRANE file-split: ATLAS
never touches `worker.ts`/auth/payments files, CRANE never touches
sitemap/nav/footer/legal/resources files — verify this is still current
before assuming it).

## RULE 2 — Attribution

Every commit subject line is tagged `[AI: <SEAT>]`. Every chat reply
ends `-- <SEAT>`. A prompt addressed to a different seat (or to none)
just gets acknowledged and held — no scripted "MISDIRECTED" ritual.

## RULE 3 — Queue

Work `docs/WAVE_QUEUE.md` rows in order. Rows are append-only —
reassignments and status changes are edits/notes on the row, never
deletions. A row reads DONE only once it's LIVE (RULE 4).

## RULE 4 — Stage-gate

LIVE = pushed (verified with `git ls-remote origin <branch>`, SHA
pasted as proof) + landed via `scripts/land.ps1` + build green.
Anything short of all three stays OPEN/CLAIMED/IN-PROGRESS. Never
DONE-mark a row you haven't confirmed LIVE by this exact definition.

## RULE 5 — Quality

Pre-push: `scripts/verify-static.ps1` and `pnpm --filter ./apps/web
exec tsc --noEmit` must both be green. Post-land: run the equivalent of
a checklist pass. No fabricated content or metrics, ever. No placeholder
or empty commits.

## RULE 6 — Protected paths

Never modify without explicit human approval: `apps/web/app/boq-pro/**`,
`package.json`, `pnpm-lock.yaml`, `next.config.js`, `middleware.ts`.
This includes indirect edits (e.g. don't add a dependency by hand-editing
`pnpm-lock.yaml`). If a task seems to require touching one of these,
stop and ask before proceeding — don't route around it.

## RULE 7 — Docs ownership

Only SCRIBE edits `AGENTS.md`, `docs/WAVE_QUEUE.md` (row content/rules),
and role/seat docs. Other seats read the rules from `main` and don't
fork or locally override them. (In practice CRANE does edit
`WAVE_QUEUE.md` to claim/DONE-mark its own rows — that's row-status
bookkeeping, not rule authorship; don't confuse the two.)

## RULE 8 — Session rotation

If a session is degraded (context exhausted, tool failures, stuck),
stop and leave a HANDOFF note in the seat's `docs/seats/<SEAT>.md` —
current branch, last claimed row, what's left — before rotating.

## RULE 9 — Seat directory isolation

Each seat commits only from its own git worktree, checked out from
`origin/main`. The shared main checkout is `scripts/land.ps1` territory
only — no seat runs `git checkout`/`git switch` there. Never leave main
dirty; clean build artifacts (`apps/web/out`, `.next`,
`tsconfig.tsbuildinfo`) before and after every `git status` check there.

## RULE 10 — Undo discipline

Every `docs/WAVE_QUEUE.md` row includes an `UNDO:` field — a one-line
inverse command for that row's change (e.g. `UNDO: git revert <sha>`).
Rollback must be deterministic, not reconstructed after the fact.

## RULE 11 — Skills catalog

`docs/SKILLS.md` lists each seat's expert skills, used by the conductor
to route sub-tasks by fit, not just availability.

## RULE 12 — Sub-agent gate dispatch

When blocked on an operator gate (a secret, an approval, a design
decision that isn't yours to make), report the gate and hold — don't
sit idle on the row, but don't guess past the gate either. The
conductor dispatches the unblocking sub-task to the seat that owns that
kind of work.

## RULE 13 — Screenshot extrapolation

When the operator flags one instance of a defect (a placeholder, a fake
claim, an unwired feature) from a screenshot or spot-check, the fix
scope is automatically all similar instances site-wide, not just the
flagged one. Inventory every occurrence of that defect class across the
site before claiming the row done.

## Compliance discipline (docs/COMPLIANCE_GATE.md)

Stage-1 (informational) may ship with disclaimers now. Stage-2
(transactional) is BLOCKED until qualified counsel signs off — never
build past that gate on the assumption it'll be fine.

Stage-1 rules, in force on every Transact-adjacent surface:
- Every calculator/estimate is watermarked **INDICATIVE — NOT A LEGAL
  OPINION**. This is not optional cosmetic copy — it's the load-bearing
  disclaimer that keeps Stage-1 informational rather than transactional.
- Disclaimers present everywhere: Ferrum is a facilitator, not a legal
  practitioner; reports are due-diligence aids, not legal advice or
  title insurance; stamp duty/registration is paid by the user directly
  to government, never through Ferrum.
- No guarantee language. ("Legally green" means a workflow status, never
  a warranty.)
- No commission or pricing claims. No transactional marketing.

Any government rate, endpoint URL, legal conclusion, or technical claim
must be independently verifiable — never invented. If real research
would be needed to state something as fact, either do that research or
label the claim as illustrative/sample data, explicitly.

## Practical checklist before claiming a row

1. Verify the row actually exists on `origin/main` (not a stale local
   checkout) — `git fetch` then read the real file, or `git show
   origin/main:docs/WAVE_QUEUE.md`.
2. Check RULE 6 protected paths aren't in scope without approval.
3. Check the disjoint-ownership file split (RULE 1) if two seats are
   active concurrently.
4. Claim → worktree → build → real verification (not just "it compiles")
   → commit → push → land via `scripts/land.ps1` → confirm LIVE per
   RULE 4 → DONE-mark → land again → confirm.
