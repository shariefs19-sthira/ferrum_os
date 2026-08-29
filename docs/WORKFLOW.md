# Workflow Rules (WORKFLOW.md)

## Purpose
This document defines the operational workflow, roles, and job definitions for the AI agent system.

## Agent Positions (POS tags)
- `[POS:WRITER-MAIN]`: Primary writer agents, authorized for direct commits to the main branch.
- `[POS:WRITER-BRANCH]`: Branch writer agents, work on feature branches that are later merged.
- `[POS:WRITER-FORK]`: Fork writer agents, operate from a personal fork and submit pull requests.
- `[POS:ARCHITECT]`: Advisory agents focusing on system design, standards, and coordination. No direct code commits.
- `[POS:SCOUT]`: Research agents for standards and technology radar sweeps.
- `[POS:DISPATCHER]`: Agent responsible for assigning tasks to other agents based on capability and load.
- `[POS:PROPHET]`: Agent responsible for forecasting potential issues and opportunities based on historical data.
- `[POS:CONDUCTOR]`: Automated agent responsible for releasing batches of work based on completion criteria.
- `[POS:WRITER-VOLUME]`: High-volume, low-latency agents for small-scoped, light-weight tasks.
- `[POS:OPERATOR]`: Computer-use agents capable of interacting with the system through terminal and browser interfaces within a sandboxed environment.

## Escalation Policy
When an agent becomes stuck on a task, the following escalation procedure applies:
- If the blocker is terminal-resolvable (git tangles, env/PATH issues, version pins, file ops, server starts), immediately hand the task to Qoder-CN (WRITER-MAIN, real checkout + terminal) as the unblocking step.
- The stuck agent should wait or continue working on non-blocked aspects of the scope.
- Such unblocking commits should be tagged as [AI: Qoder-CN][unblock:<task-id>].
- If the issue is not terminal-resolvable, escalate to human decision for guidance.

## Worktree Management
For parallel execution and isolation of tasks, use git worktrees:
- To create a new isolated workspace: `git worktree add D:\ferrum_os.wt\<task-id> -b <branch> origin/main`
- Open the new folder in a new VS Code window to create a new Qoder chat instance
- This ensures parallelism without shared checkout conflicts

## Runner Rules
- Root directory operations should only execute harness scripts (e.g., conductor, fleet-status).
- All build and test operations must use pnpm filters: `pnpm --filter ./apps/web build` or similar.
- Package managers at root level: use pnpm exclusively, no npm commands allowed.

## Operating Rules
- ONE WRITER PER CHECKOUT (rule 39): D:\ferrum_os (main) is Qoder-CN exclusive. Every other seat operates only in its assigned worktree path. Encountering a dirty/merge/cherry-pick/rebase state you did not create -> STOP and report via conductor. Resolving another seat's operation = logged correction.
- SINGLE CANONICAL LOGS (rule 40): ACTIVITY_LOG.md, METHOD_LOG.md, IDEAS_LOG.md, AI_HANDOFF.md live under docs/ ONLY. Creating a second path for an existing log = logged correction.
- DISPATCH SERIALIZATION + PREFLIGHT (rule 41): AG-008 sequences mutating dispatches; at most ONE seat holds a mutating operation on a shared path at a time. Before ANY mutating git command every seat runs: git branch --show-current; git status --porcelain and aborts+reports if output differs from the dispatch expectation. Non-main seats NEVER push origin/main; worktree+PR only.