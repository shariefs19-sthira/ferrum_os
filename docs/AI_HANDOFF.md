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
*   Established the Universal Agent Factory (v2) with capability tiers (S+/S/A/B/C) and vendor-agnostic roles.
*   Defined a structured Workflow (v2) with a job taxonomy (J01-J15), cost routing, wave protocol, and immediate checks.
*   Created foundational documents for jobs (JOBS.md), standards (STANDARDS.md), and an ideas log (IDEAS_LOG.md).

**Current State:**
*   The `main` branch contains the updated `AGENTS.md`, `ROLES.md`, `WORKFLOW.md`, and the new documents `JOBS.md`, `STANDARDS.md`, `IDEAS_LOG.md`, and `AI_HANDOFF.md`.
*   The CI/CD pipeline is configured as per previous changes.
*   The agent fleet is now tracked via `docs/AGENT_BOARD.md` and monitored by the `scripts/fleet-status.mjs` script, which is accessible via `npm run fleet`.
*   Security planning has been initiated with a pre-seeded `docs/SECURITY.md`.

**Next Steps:**
*   Agent responsible for M24 and onwards should implement the pull-based labeled queue as outlined in the workflow and ideas log.
*   Continue populating `docs/IDEAS_LOG.md` with workflow improvements discovered during execution.
*   Ensure all agents adhere to the HEARTBEAT rule (Rule 16) in `AGENTS.md`.

**Context/Links:**
*   Refer to `docs/ACTIVITY_LOG.md` for a chronological list of completed tasks.
*   Check `docs/AGENT_BOARD.md` for the current status of any assigned agents.