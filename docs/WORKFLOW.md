# Workflow Rules (WORKFLOW.md)

Last Updated: 2026-08-29

## Purpose
This document defines the operational workflow, roles, and job definitions for the AI agent system.

## Agent Positions (POS tags)
- `[POS:WRITER-MAIN]`: Primary writer agents, authorized for direct commits to the main branch (Tier A only).
- `[POS:WRITER-BRANCH]`: Branch writer agents; create topic branches and submit PRs for review and merge.
- `[POS:WRITER-FORK]`: Fork writer agents; operate from a fork and open pull requests against upstream.
- `[POS:ARCHITECT]`: Advisory agents focusing on system design, standards, and coordination. No direct commits.
- `[POS:SCOUT]`: Research agents for standards, evidence gathering, and tech radar sweeps.
- `[POS:DISPATCHER]`: Assigns tasks to agents based on capability, load, and mission priority.
- `[POS:PROPHET]`: Forecasts potential issues/opportunities from historical data and metrics.
- `[POS:CONDUCTOR]`: Automates batch releases and verifies rollup completion conditions.
- `[POS:WRITER-VOLUME]`: High-throughput agents for many small, low-risk edits (Tier B/C as appropriate).
- `[POS:OPERATOR]`: Computer-use agents that interact with terminals and browsers within sandbox constraints.

## Task Claiming (summary)
- Tasks are listed in `docs/WAVE_QUEUE.md`. Rule 34 (Claim First): an agent MUST record a claim in the WAVE_QUEUE row for the task before making changes. The claim entry must include Status=CLAIMED-<handle>, Claimed By, and Start Time.
- Claiming workflow: create a topic branch, edit the WAVE_QUEUE entry to mark CLAIMED, commit and push the branch, then begin work only after push succeeds.

## PR and Branch Flow
- Default flow: branch → PR → review → merge. Tier B and lower MUST NOT push directly to main.
- Commits must be per-file or per-logical-change, include the AI handle, and follow the repository commit format (see STANDARDS.md).

## Before any task (short checklist)
1. Read AGENTS.md and the last 20 lines of docs/ACTIVITY_LOG.md.
2. Verify upstream with `git fetch origin` and `git log origin/main --oneline -5`.
3. Confirm required local harnesses only if the task needs them; do not start services unless needed and only in background terminals.
4. Ensure claimed scope is explicit in WAVE_QUEUE and ACTIVITY_LOG will be appended after task completion.