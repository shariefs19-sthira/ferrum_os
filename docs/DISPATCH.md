# Dispatch Protocol

## Purpose
This document outlines the protocol for assigning tasks to AI agents based on the optimal model for the job domain. The [POS:DISPATCHER] role is responsible for this assignment, using both internal performance data and external benchmarks.

## Decision Template

### ASSIGN `<task_id>` | domain | recommended model/tier | est cost | INTERNAL: `<per-domain stats>` | EXTERNAL: `<benchmark rank, price, community signal, dated>` | CONFIDENCE | VETO window.

- **task_id**: The unique identifier for the task (e.g., W1-01).
- **domain**: The constant domain of the task (e.g., D-UI, D-BE, D-QA).
- **recommended model/tier**: The suggested AI model and its capability tier (S+/S/A/B/C).
- **est cost**: Estimated computational or time cost (FREE/LOW/MID/HIGH).
- **INTERNAL**: Aggregate statistics from `AGENT_REGISTRY.md` for agents working in this domain. Includes metrics like average landing rate, average CI break rate, average time to completion, etc.
- **EXTERNAL**: Relevant external data such as model benchmark scores, current pricing, community sentiment, and the date of the information. Example: "GPT-4o ranks high for code gen (2024-05), but Qwen3.5 is 5x cheaper for QA tasks (price check 2024-05-23)".
- **CONFIDENCE**: Dispatcher's confidence level in the recommendation (High/Medium/Low).
- **VETO window**: A 24-hour period during which a human can override the dispatcher's assignment.

## Cadence
- A new dispatch decision is made for every task at every wave boundary.
- Decisions are also reviewed and potentially updated upon the release of major new AI models.

## Calibration
After a task is completed and landed, the actual performance (cost, time, quality) is recorded in `ASSIGNMENT_LOG.md` against the prediction. The dispatcher's effectiveness is measured by comparing predictions to outcomes.