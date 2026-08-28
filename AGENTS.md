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