# AI Handoff Protocol

## Core Principle: Model Rotation (Universal Tiers)
Any AI agent can be replaced mid-mission by any other agent of equal or higher capability tier (S+, S, A, B, C as defined in AGENTS.md). Continuity is maintained through documentation (ACTIVITY_LOG.md, this file), not session state. If an agent is retired or unavailable, its successor resumes from the latest documented state.

## Purpose
This document provides the initial context and current state for any AI agent taking over an ongoing mission. It summarizes the goal, the work completed so far by previous agents, the current status, and the immediate next steps.

## Content Structure
1.  **Mission Goal:** A concise statement of the overall objective.
2.  **Previous Work Summary:** Key accomplishments and decisions made by prior agents, referencing commit hashes or log entries where possible.
3.  **Current State:** The status of the codebase, open PRs, CI, etc., as of the last update.
4.  **Next Steps:** Clear, actionable items for the incoming agent.
5.  **Context/Links:** Relevant PRs, issues, or external resources.

---

## Current Mission Handoff Point

**Mission Goal:** Implement a robust, scalable, and observable AI agent coordination system based on capability tiers and structured workflows.

**Previous Work Summary:**
*   Established the Universal Agent Factory (v2) with capability tiers and vendor-agnostic roles.
*   Defined a structured Workflow (v2) with a job taxonomy (J01-J15), cost routing, wave protocol, and immediate checks.
*   Implemented fleet tracking with heartbeat rules and an agent board.
*   Created a permanent ledger for agent identities and lifetimes (AGENT_REGISTRY.md).
*   Established a formal queue for work items (WAVE_QUEUE.md), now organized into batches.
*   Defined the Automation Matrix and Auto-Merge Policy.
*   Introduced task tags for automated tracking.
*   Implemented a continuous standards cadence with a technology and domain radar (STANDARDS_RADAR.md).
*   Established the Universal Task Structure (PREPARE -> EXECUTE -> LOG) for all work types.
*   Implemented the Dispatcher role for experience-driven model routing, with lookahead drafting.
*   Implemented the Prophet role for calibrated forecasting.
*   Implemented the Batch Conductor for automated, gated batch releases, with recursive verification.
*   Implemented the Subtask Spawning protocol for dynamic task hierarchies.

**Current State:**
*   The `main` branch contains the updated coordination stack and recent landings up to W2-30 (f2baa00) and task completions up to W2-32 (c05d5ca).
*   The `docs/AGENT_REGISTRY.md` remains the source of truth for registered agents and their status. The `docs/AGENT_BOARD.md` shows Qoder-CN as ACTIVE.
*   The `docs/WAVE_QUEUE.md` has been updated to include tasks W2-13 through W2-36 and reflects the current status of recent landings.
*   The `docs/STANDARDS_RADAR.md` and `docs/STANDARDS.md` remain authoritative for technology and process review cycles.
*   `docs/METHOD_LOG.md` is normalized to a stateless, evidence-first template for task records.
*   `docs/IDEAS_LOG.md` contains historical records. The `docs/AUDIT_LOG.md` was requested but not found, indicating a potential procedure gap.
*   The `.githooks/pre-push` script is in place and functional, enforcing builds on push to main. The `live-server.ps1` and `live-smoke.ps1` scripts manage the LIVE environment verification and restart cycle. Rule 46 (VERIFIED GREEN) has been added to documentation (WORKFLOW.md, AGENTS.md).
*   The next known operational step is to continue with the open queue only when the current branch and handoff state are documented in the logs.

**Next Steps:**
*   Continue landing pending branches (w2-33, w2-34, w2-35, w2-36) and completing the current task queue (W2-39 upcoming).
*   Perform a worktree cleanup pass to remove obsolete worktrees.
*   Maintain the `docs/ACTIVITY_LOG.md` with ongoing task reports and smoke test results.
*   The [POS:CONDUCTOR] (infra bot) will manage batch progression based on queue status. Agents should pull tasks from the currently OPEN batch as listed in `WAVE_QUEUE.md`.

**Next Steps:**
*   Continue landing pending branches (w2-33, w2-34, w2-35, w2-36) and completing the current task queue (W2-39 upcoming).
*   Perform a worktree cleanup pass to remove obsolete worktrees.
*   Maintain the `docs/ACTIVITY_LOG.md` with ongoing task reports and smoke test results.
*   The [POS:CONDUCTOR] (infra bot) will manage batch progression based on queue status. Agents should pull tasks from the currently OPEN batch as listed in `WAVE_QUEUE.md`.

**Notes:**
*   The audit revealed that WORKFLOW.md was missing Rule 46, which has now been added. The agent board status for Qoder-CN was corrected from SUSPENDED to ACTIVE. The wave queue was populated with missing entries. The AI_HANDOFF state was refreshed. The pre-push hook and server scripts are aligned with defined procedures.
*   Refer to `docs/ACTIVITY_LOG.md` for a chronological list of completed tasks.
*   Check `docs/AGENT_BOARD.md` for the current status of any assigned agents and any messages from the Conductor.
*   Consult `docs/ROLES.md`, `docs/JOBS.md`, `docs/WORKFLOW.md`, `docs/STANDARDS.md`, `METHOD_LOG.md`, `docs/DISPATCH.md`, `docs/PROPHECY_LOG.md`, and `docs/agents/PROPHET.md` for role assignments, job definitions, workflow rules, current standards, required logging, dispatch protocol, and prophecy protocol.