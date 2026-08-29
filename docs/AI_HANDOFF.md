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
*   The `main` branch contains the updated coordination stack for agent capability tiers, workflow discipline, dispatch, prophecy, batch control, and task-scope guardrails.
*   The `docs/AGENT_REGISTRY.md` remains the source of truth for registered agents and their status.
*   The `docs/WAVE_QUEUE.md` remains batch-organized (B1/B2/B3), with the latest infrastructure note that W1-06 landed via the Qoder branch and the seat returned to standby after the double-assignment incident.
*   The `docs/STANDARDS_RADAR.md` and `docs/STANDARDS.md` remain authoritative for technology and process review cycles.
*   `docs/METHOD_LOG.md` is now normalized to a stateless, evidence-first template for task records.
*   `docs/IDEAS_LOG.md` includes the updated record for IDEA-066 and the human-review veto pattern for the Auto-Merge Enabler.
*   The `.github/workflows/auto-merge.yml` pattern is in place for non-draft PRs that are not blocked by the `HUMAN-REVIEW` veto string.
*   `W1-06` is logged as landed, with the Copilot protocol recorded as correct and the branch closed after the dispatcher double-assignment recovery.
*   The next known operational step is to continue with the open queue only when the current branch and handoff state are documented in the logs.

**Next Steps:**
*   The designated [POS:DISPATCHER] agent should continue assigning models for tasks in the OPEN batch (B2) and draft assignments for B3.
*   Agents should pull tasks only from the currently OPEN batch (B2) as listed in `WAVE_QUEUE.md`.
*   The [POS:CONDUCTOR] (infra bot) will automatically release B3 once all tasks in B2, and their recursive subtasks, are marked as DONE in the queue file.
*   Agents may now spawn subtasks according to rule 28 in `AGENTS.md`.
*   Continue executing tasks following the PREPARE -> EXECUTE -> LOG structure.
*   Maintain all relevant logs and documentation as new work is performed.

**Context/Links:**
*   Refer to `docs/ACTIVITY_LOG.md` for a chronological list of completed tasks.
*   Check `docs/AGENT_BOARD.md` for the current status of any assigned agents and any messages from the Conductor.
*   Consult `docs/ROLES.md`, `docs/JOBS.md`, `docs/WORKFLOW.md`, `docs/STANDARDS.md`, `METHOD_LOG.md`, `docs/DISPATCH.md`, `docs/PROPHECY_LOG.md`, and `docs/agents/PROPHET.md` for role assignments, job definitions, workflow rules, current standards, required logging, dispatch protocol, and prophecy protocol.