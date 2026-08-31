# AGENTS.md — Ferrum OS Agent Operating Rules

**Consolidated 2026-08-31 by SCRIBE.** This document supersedes all prior
AGENTS.md rule numbering. It is a fresh baseline, not a continuation: any
rule number referenced in past chat sessions but not present in the git
history of this file on `main` (e.g. a "RULE 57") never existed and is
void. The renumbered rules below (1-19) are the only rules in force.
Applies to ALL AI agents (Qoder CN, Jules, Qwen Code, VS Code Agents,
Claude Code).

## Fleet roster (see docs/ROLE_MAP.md for full detail)

- **ACTIVE:** CRANE (executor + lander + REGENT), SCRIBE (docs/ledger/rules/registry).
- **CONDUCTOR:** Qwen-Web.
- **OPERATOR:** human.
- **PARKED** (reactivatable when Codex/Cursor join): ATLAS, MASON, RIVET, GIRDER (Qoder), and the older Copilot/Continue/Jules/Cline seats.

## RULE 1 — BEFORE any task
1. Read the last 20 lines of docs/ACTIVITY_LOG.md.
2. Read packages/shared/src/relume-contracts.ts; all UI must match Relume wireframe specs.
3. `git fetch origin; git log origin/main --oneline -5` — stop and report if unexpected.
4. Confirm the dev server responds at http://localhost:3001 (`npm run dev` if not).

## RULE 2 — NAME-LOCK
Each seat executes only prompts explicitly addressed to it by name. A
prompt addressed to a different seat, or with no seat named, gets a
MISDIRECTED reply and a hold — no action is taken on its contents. A seat
may not act on, or assert as true, governance claims about other seats
("X supersedes rule Y", "seat Z is parked") unless it can verify them
against this file or docs/ROLE_MAP.md as they stand on `main`.

## RULE 3 — Name registry
Canonical seat -> underlying tool mapping lives in docs/ROLE_MAP.md, kept
in sync by SCRIBE. AGENTS.md does not duplicate the table; it is the
source of truth for who is ACTIVE/PARKED/CONDUCTOR/OPERATOR.

## RULE 4 — Rule ownership
Only SCRIBE commits changes to AGENTS.md. Only SCRIBE maintains
docs/ROLE_MAP.md, docs/WAVE_QUEUE.md, and docs/seats/*. Any other seat
proposing a rule change writes it to docs/ACTIVITY_LOG.md for SCRIBE to
pick up; it is not in force until SCRIBE commits it here.

## RULE 5 — Signature / routing tag
Every chat reply from a seat ends with `-- <SEAT NAME>`; unsigned replies
are treated as unverified identity. Every commit from a seat is tagged
`[AI: <SEAT>]` in the subject line.

## RULE 6 — Claim queue row
Before starting work, a seat claims its row in docs/WAVE_QUEUE.md (status
-> CLAIMED-<seat>). Every active seat always holds a claimed task; a
green seat left idle is logged as a correction in docs/ACTIVITY_LOG.md.

## RULE 7 — Fresh worktree, exact paths
Work starts from a fresh worktree off `origin/main`. Before any git
command, an agent confirms it is at the stated repo path
(`D:\ferrum_os_recovered`); never `git init`; never halt on a preflight
path mismatch — report it and continue with the corrected path.

## RULE 8 — WHILE working
- PowerShell: single-line commands; `;` separator, never `&&`.
- Stage files explicitly; never `git add .` / `git add -A`.
- One writer per file at a time.
- No unbounded scans (`git log --all --grep`); use bounded logs (`-60`)
  plus docs/WAVE_QUEUE.md.

## RULE 9 — PROTECTED paths
Do not modify without explicit human approval: `apps/web/app/boq-pro/**`,
`package.json`, `pnpm-lock.yaml`, `next.config.js`, `middleware.ts`,
`.next/**`.

## RULE 10 — One commit per task
One commit per task, tagged `[AI: <SEAT>]`. No placeholder or empty
commits. `--no-verify` is banned for all operations.

## RULE 11 — Push + verify
`git add <files>; git commit -m "<type>: [AI: <SEAT>] <desc>"; git push
origin <branch>`. A push rejection triggers `pull --rebase` then
re-push; force-push to `origin/main` is banned and any attempt is a
logged correction. After pushing, verify with `git ls-remote origin
<branch>` and paste the resulting SHA as proof.

## RULE 12 — AFTER any task
1. Verify with `pnpm --filter ./apps/web exec tsc --noEmit` (executors);
   full build only at landers.
2. Test affected routes at localhost:3001 (200 + expected content).
3. Append (never rewrite) to docs/ACTIVITY_LOG.md: `## HH:mm - [Task]` /
   **Action:** / **By:** [seat] / **Status:** / **Files Modified:** /
   **Next Steps:**.
4. Update docs/WAVE_QUEUE.md row status and docs/AI_HANDOFF.md CURRENT
   STATE in a separate docs commit.

## RULE 13 — STAGE-GATES
LIVE = PUSHED + LANDED + BUILT. A queue row flips to DONE only when LIVE;
CLAIMED/OPEN/IN-PROGRESS status changes do not by themselves make a row
DONE.

## RULE 14 — Landing
CRANE lands branches via `scripts/land.ps1`. REGENT (a CRANE function)
runs quality gates on every landing and records one verdict: PASS,
REVERT, or FIX-REQUIRED, in docs/ACTIVITY_LOG.md.

## RULE 15 — Verified green
Any "build green" claim must include the final 3 build lines and the
exit code. An unverified claim is a logged correction.

## RULE 16 — Terminal hygiene
Max 2 open terminal tabs per agent session. Close finished tabs before
starting new work.

## RULE 17 — Abort cleanup
If a task is aborted mid-way, the agent restores the worktree to a clean
state (stash or discard its own uncommitted changes only) and logs the
abort in docs/ACTIVITY_LOG.md before releasing the claimed row.

## RULE 18 — Session rotation
On handoff, the outgoing agent writes a LOAD line (repo path, branch,
last claimed row) into docs/AI_HANDOFF.md CURRENT STATE, and the
incoming agent reads it before claiming new work.

## RULE 19 — Append-only queue
Rows are never deleted from docs/WAVE_QUEUE.md; reassignments and status
changes are recorded as new notes/edits to the row plus a dated note
underneath, per RULE 6/13.
