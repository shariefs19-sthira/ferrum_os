# AGENTS.md — Ferrum OS Agent Operating Rules
Applies to ALL AI agents (Qoder CN, Jules, Qwen Code, VS Code Agents).

## BEFORE any task
1. Read last 20 lines of docs/ACTIVITY_LOG.md.
2. Read packages/shared/src/relume-contracts.ts; all UI must match Relume wireframe specs.
3. Run: git fetch origin; git log origin/main --oneline -5 — STOP and report if unexpected.
4. Confirm dev server responds at http://localhost:3001 (npm run dev if not).

## WHILE working
- PowerShell: single-line commands; ';' separator, NEVER '&&'.
- Stage files explicitly; NEVER 'git add .' .
- Do NOT modify without explicit approval: apps/web/app/boq-pro/*, package.json, pnpm-lock.yaml, .next/**.
- One writer per file at a time.

## AFTER any task
1. Test affected routes at localhost:3001 (200 + expected content).
2. Append to docs/ACTIVITY_LOG.md: ## HH:mm - [Task] / **Action:** / **By:** [agent] / **Status:** ✅ Complete / **Files Modified:** / **Next Steps:**
3. Single-line commit+push: git add <files>; git commit -m "<type>: <desc>"; git push origin main
4. Verify push; update CURRENT STATE in docs/AI_HANDOFF.md; separate docs commit.

## Ports
Frontend 3000/3001 · LandIntel backend 8000 · BOQ backend 8001

## Additional Notes
Health checks must use curl.exe -m 5 (5s max) to prevent hung agent loops.

## TIMEOUT DISCIPLINE (mandatory — no agent may block on the outside world)
1. HARD TIMEOUTS: every network probe uses curl.exe -m 5 or Invoke-RestMethod -TimeoutSec 5. No exceptions.
2. SLEEP+PROBE pattern: Start-Sleep -Seconds N; curl.exe -m 5 <url> — never 'timeout /t', and '&' / '&&' are forbidden (';' is the only separator).
3. SERVERS: started only in dedicated background terminals, never in blocking tool calls. Name the terminal in the activity log entry.
4. BOUNDED RETRIES: maximum ONE retry on any failed or timed-out check; then proceed with the fallback assumption and log "unhealthy, fallback verified".
5. SELF-ABORT: if any terminal or tool call has not returned within 60 seconds, abort it (Ctrl+C or Stop) and continue from the next step with the fallback assumption. Never remain in a Generating/waiting state.
6. LONG OPERATIONS: pushes, installs, builds run with visible progress; if one exceeds 120 seconds, abort, log it, and report — do not retry blindly.
7. PORT PREFLIGHT: before any e2e, probe each required port once (3001, 8000, 8001); a missing server is started once in a background terminal, then probed once with -m 5.

## SESSION LIFECYCLE: a session ends when its PR lands; never continue in a session whose branch was merged or deleted; new mission = new session.

## HYGIENE RULES: NEVER commit __pycache__ or *.pyc. On push rejection: discard or stash dirt, pull --rebase, commit, push — maximum one loop, then report.

## SYNC-HANDOFF (rule 35): finished agents go IDLE, no self-pull; conductor posts ALL-IDLE when no CLAIMED/IN-PROGRESS rows remain; dispatcher broadcasts next assignments in one window.

## TERMINAL-FIRST FOR SMALL FIXES (rule 36): systemic few-line fixes (version pins, config integers, path corrections) are executed by the human directly in the terminal on the correct branch, tagged [human][task:<id>]; agents are not dispatched for changes under ~3 files / ~20 lines unless delegated. Also: always run git branch --show-current before committing — silent checkout failures cause mis-branched commits.

## STUCK->QODER (rule 37): any task (any agent or the human) stuck on a terminal-resolvable blocker (git tangles, env/PATH issues, version pins, file ops, server starts) is immediately handed to Qoder-CN (WRITER-MAIN, real checkout + terminal) as the unblocking step; the stuck agent waits or continues on non-blocked scope. Tag such commits [AI: Qoder-CN][unblock:<task-id>].

## ROUTE BY OBSERVED CORRECTION COST (rule 38): default execution = Qoder chats (one per worktree, one branch each); volume/docs = Cline + Copilot; Jules = overnight overflow only, re-earned by scorecard. Parallelism via worktrees, never shared checkouts.

## ONE WRITER PER CHECKOUT (rule 39): D:\ferrum_os (main) is Qoder-CN exclusive. Every other seat operates only in its assigned worktree path. Encountering a dirty/merge/cherry-pick/rebase state you did not create -> STOP and report via conductor. Resolving another seat's operation = logged correction.

## SINGLE CANONICAL LOGS (rule 40): ACTIVITY_LOG.md, METHOD_LOG.md, IDEAS_LOG.md, AI_HANDOFF.md live under docs/ ONLY. Creating a second path for an existing log = logged correction.

## DISPATCH SERIALIZATION + PREFLIGHT (rule 41): AG-008 sequences mutating dispatches; at most ONE seat holds a mutating operation on a shared path at a time. Before ANY mutating git command every seat runs: git branch --show-current; git status --porcelain and aborts+reports if output differs from the dispatch expectation. Non-main seats NEVER push origin/main; worktree+PR only.

## OBSERVED CORRECTION COUNTER (rule 42): every landing commit/PR body carries corrections:<n>; METHOD_LOG entries carry a **Corrections:** line; MODEL_SCORECARD updates per landing, not per week.

## SCOUT DELIVERABLE FORMAT (rule 43): research outputs end with an adopt/hold/drop table + revisit trigger + cost estimate; narrative-only reports = logged correction.