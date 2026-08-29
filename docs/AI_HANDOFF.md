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
*   Established a formal queue for work items (WAVE_QUEUE.md).

**Current State:**
*   The `main` branch contains all the updated documentation and scripts for the agent system.
*   The `docs/AGENT_REGISTRY.md` lists all known agents.
*   The `docs/WAVE_QUEUE.md` contains the initial set of tasks for WAVE-1.
*   All agents are required to register in `docs/AGENT_REGISTRY.md` before committing code.

**Next Steps:**
*   New agents should register in `docs/AGENT_REGISTRY.md`.
*   Agents should pull tasks from `docs/WAVE_QUEUE.md` according to their tier and the cost-routing rules.
*   Ensure all commits include the `[AI: handle]` tag and all log entries include `**By:** handle [POS:tag]`.

**Context/Links:**
*   Refer to `docs/ACTIVITY_LOG.md` for a chronological list of completed tasks.
*   Check `docs/AGENT_BOARD.md` for the current status of any assigned agents.
*   Consult `docs/ROLES.md` and `docs/JOBS.md` for role assignments and job definitions.