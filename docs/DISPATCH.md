# Dispatch Protocol

## Purpose
This document outlines the protocol for assigning tasks to AI agents based on the optimal model for the job domain. The [POS:DISPATCHER] role is responsible for this assignment, using both internal performance data and external benchmarks.

## Decision Template

### ASSIGN `<task_id>` | domain | recommended model/tier | est duration | est cost | INTERNAL: `<per-domain stats>` | EXTERNAL: `<benchmark rank, price, community signal, dated>` | PROPHECY INPUT: `<summary of relevant prophecies>` | CONFIDENCE | VETO window.

- **task_id**: The unique identifier for the task (e.g., W1-01).
- **domain**: The constant domain of the task (e.g., D-UI, D-BE, D-QA).
- **recommended model/tier**: The suggested AI model and its capability tier (S+/S/A/B/C).
- **est duration**: Estimated time to completion based on model speed and task size (e.g., 1hr, 4hrs). Used for pace-aware dispatch (Rule 30).
- **est cost**: Estimated computational or time cost (FREE/LOW/MID/HIGH).
- **INTERNAL**: Aggregate statistics from `AGENT_REGISTRY.md` for agents working in this domain. Includes metrics like average landing rate, average CI break rate, average time to completion, etc.
- **EXTERNAL**: Relevant external data such as model benchmark scores, current pricing, community sentiment, and the date of the information. Example: "GPT-4o ranks high for code gen (2024-05), but Qwen3.5 is 5x cheaper for QA tasks (price check 2024-05-23)".
- **PROPHECY INPUT**: Relevant predictions from `PROPHECY_LOG.md` that might affect the assignment choice or risk assessment for this task.
- **CONFIDENCE**: Dispatcher's confidence level in the recommendation (High/Medium/Low).
- **VETO window**: A 24-hour period during which a human can override the dispatcher's assignment.

## Cadence
- A new dispatch decision is made for every task at every wave boundary.
- Decisions are also reviewed and potentially updated upon the release of major new AI models.

## Calibration
After a task is completed and landed, the actual performance (cost, time, quality) is recorded in `ASSIGNMENT_LOG.md` against the prediction. The dispatcher's effectiveness is measured by comparing predictions to outcomes.

## Interaction with [POS:PROPHET]
- The [POS:DISPATCHER] must consult `PROPHECY_LOG.md` before making an assignment.
- If a prophecy related to the task or agent has a credibility score > 70, the dispatcher must explicitly respond to it in the assignment notes or record why it's being disregarded.
- If a prophecy related to a HIGH-cost task (J06, J09, J10, J14) has a credibility score > 85, the dispatcher must incorporate its recommendation or defer the task.

## Batch Composition Scoring
When composing a batch, the dispatcher scores potential compositions based on:
- **Priority**: Higher priority tasks are included first.
- **Domain Coverage**: Balancing load across different domains (D-UI, D-BE, D-QA, etc.) to prevent bottlenecks.
- **Agent Availability**: Matching task domains to the currently available and suitable agents.
- **Cheapest Fit**: Selecting the lowest tier capable of performing the task effectively.
- **Estimated Duration**: Distributing long-running or slow tasks across economy batches to maintain the pace of critical batches.

## LOOKAHEAD
While the current batch is in progress, the dispatcher drafts assignments for the *next* batch. This allows for proactive preparation and smoother transitions. The WIP (Work In Progress) limit is 1 active batch per agent to prevent overload.