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

## RELAY OPERATIONS

### RULE 44 — CONTINUOUS ASSIGNMENT
Every active seat always holds a claimed task. The conductor issues the next task in the same relay as any green report. A green seat left idle is logged as a correction against AG-008.

### RULE 45 — NO FORCE PUSH TO MAIN
A push rejection triggers a `pull --rebase`, followed by a re-push. Any force-push attempt to `origin/main` results in a logged correction. The `--no-verify` flag is banned for all operations.

### RULE 46 — VERIFIED GREEN
Any "build green" claim must include the final 3 build lines and the exit code. An unverified claim results in a logged correction.

### RULE 47 — Qoder ops: (a) before any git command, cd to the stated repo path (D:\ferrum_os_recovered); (b) never run git init; (c) never halt on a preflight mismatch — report it and continue with the corrected path; (d) no unbounded scans (git log --all --grep); use bounded logs (-60) + docs/WAVE_QUEUE.md.

### RULE 48 — ATLAS ops: execute only prompts addressed to ATLAS; anything else → reply MISDIRECTED and hold. Name Registry: Qoder-CN (ATLAS), Qoder-A (Qoder-CN), Jules-Owner-B (Jules-Operator), Jules-Fork-A (Jules-Observer), Cline-GLM-Flash (Cline-GLM-Standard), Copilot (Copilot-CLI-VSCode), Claude-Code (Claude-Code-Dev), Continue (Continue-Dev), Qwen-Web (Qwen-Web-Conductor), Operator (Human-Operator), Scout (Scout-Dev), Raven (Raven-Agent), Prophet (Prophet-Agent).