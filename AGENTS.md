# AGENTS.md — Ferrum OS Agent Operating Rules
Applies to ALL AI agents (Qoder CN, Jules, Qwen Code, VS Code Agents).

## BEFORE any task
1. Read last 20 lines of docs/ACTIVITY_LOG.md.
2. Read packages/shared/src/relume-contracts.ts; all UI must match Relume wireframe specs.
3. Run: git fetch origin; git log origin/main --oneline -5 — STOP and report if unexpected.
4. Confirm dev server responds at http://localhost:3001 (npm run dev if not).

## WHILE working
- PowerShell: single-line commands; ';' separator, NEVER '&&'.
- Stage files explicitly; NEVER 'git add .'.
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
## MULTI-AGENT ISOLATION (mandatory at 3+ agents)
1. WRITER LIMIT: at most one agent writes the main working tree; all other concurrent missions run in worktrees or forks and land via PR.
2. LANDING QUEUE: land one branch at a time; rebase onto origin/main before landing; after any landing, running agents rebase before pushing.
3. SHARED FILES: docs/ACTIVITY_LOG.md is append-only; on conflict keep both entries.
4. SERVERS: ports fixed 3001/8000/8001; only the agent that started a server may restart it.
5. COMPLETIONS: one inline-completion extension enabled at a time.

10. NON-INTERACTIVE GIT: every git command runs non-interactive; commits always with -m; pulls rely on pull.rebase or --rebase --no-edit; merges only --no-edit; rebase before every push; abort any editor or prompt with Ctrl+C.
11. PROTECTED FILES: AGENTS.md, .github/workflows/** and .gitignore may only change via an explicitly human-approved docs commit. Mission agents must never edit them - propose changes in the activity log instead.
