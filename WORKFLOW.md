# WORKFLOW.md — Ferrum OS Relay Workflow

## RELAY OPERATIONS

### RULE 44 — CONTINUOUS ASSIGNMENT
Every active seat always holds a claimed task. The conductor issues the next task in the same relay as any green report. A green seat left idle is logged as a correction against AG-008.

### RULE 45 — NO FORCE PUSH TO MAIN
A push rejection triggers a `pull --rebase`, followed by a re-push. Any force-push attempt to `origin/main` results in a logged correction.

### RULE 46 — VERIFIED GREEN
Any "build green" claim must include the final 3 build lines and the exit code. An unverified claim results in a logged correction.