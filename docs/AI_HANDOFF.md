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
*   Implemented the Dispatcher role for experience-driven model routing.
*   Implemented the Prophet role for calibrated forecasting.
*   Implemented the Batch Conductor for automated, gated batch releases.

**Current State:**
*   The `main` branch contains all the updated documentation for the agent system, standards, task structure, dispatch, prophecy, and batch control.
*   The `docs/AGENT_REGISTRY.md` lists all known agents, including the new Dispatcher, Prophet, and Conductor.
*   The `docs/WAVE_QUEUE.md` is now organized into B1, B2, and B3 batches, with B1 marked as complete and B2 as OPEN.
*   The `docs/STANDARDS_RADAR.md` provides a dynamic view of technology and domain practices.
*   The `docs/STANDARDS.md` has been updated with review cycles and checklists tied to job types.
*   The `METHOD_LOG.md` template is now universal for all task types.
*   The `docs/DISPATCH.md` protocol defines how tasks are assigned based on domain and model capability, incorporating prophecy input.
*   The `docs/PROPHECY_LOG.md` is ready to track predictions and their outcomes for calibration.
*   A dedicated role card for the Prophet exists at `docs/agents/PROPHET.md`.
*   A new script `scripts/batch-conductor.mjs` and a corresponding workflow `.github/workflows/conductor.yml` automate the release of batches based on task completion.

**Next Steps:**
*   The designated [POS:DISPATCHER] agent should assign models for tasks in the OPEN batch (B2) and the upcoming B3.
*   Agents should pull tasks only from the currently OPEN batch (B2) as listed in `WAVE_QUEUE.md`.
*   The [POS:CONDUCTOR] (infra bot) will automatically release B3 once all tasks in B2 are marked as DONE in the queue file.
*   Continue executing tasks following the PREPARE -> EXECUTE -> LOG structure.
*   Maintain all relevant logs and documentation as new work is performed.

**Context/Links:**
*   Refer to `docs/ACTIVITY_LOG.md` for a chronological list of completed tasks.
*   Check `docs/AGENT_BOARD.md` for the current status of any assigned agents and any messages from the Conductor.
*   Consult `docs/ROLES.md`, `docs/JOBS.md`, `docs/WORKFLOW.md`, `docs/STANDARDS.md`, `METHOD_LOG.md`, `docs/DISPATCH.md`, `docs/PROPHECY_LOG.md`, and `docs/agents/PROPHET.md` for role assignments, job definitions, workflow rules, current standards, required logging, dispatch protocol, and prophecy protocol.