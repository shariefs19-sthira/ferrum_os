# Model Scorecard

This document provides a deterministic scorecard for assigning tasks to agents based on historical performance data. The [POS:DISPATCHER] uses this data for routine assignments when `n >= 2`.

## Scoring Formula
`score = (success_rate * 0.4) - (fix_loops_avg * 0.1) - (ci_breaks_per_task * 0.2) - (dur_vs_est_penalty * 0.1) + (cost_efficiency_bonus * 0.2)`

Cost efficiency bonus is higher for lower-cost models (FREE/HIGH) performing well.

## Legend
- `n`: Number of completed tasks for this agent-domain pair.
- `success%`: Percentage of tasks completed successfully without major rework.
- `fix-loops`: Average number of correction loops required per task.
- `ci-breaks`: Total number of CI pipeline failures attributed to tasks completed by this agent.
- `dur-vs-est`: Average ratio of actual duration to estimated duration. Penalties apply for consistently overrunning estimates.
- `cost`: The operational cost tier of the agent (FREE, LOW, MID, HIGH).
- `score`: The calculated score used for deterministic assignment.

## Scorecard Data

| model | domain | n | success% | fix-loops | ci-breaks | dur-vs-est | cost | score |
|-------|--------|---|----------|-----------|-----------|------------|------|-------|
| Qoder-CN | D-CI | 6 | 83% | 0.2 | 1 | 1.1 | 0.15 | 82 |
| Jules-Fork-A | D-UI | 1 | 100% | 0 | 0 | 0.95 | 0.25 | 95 |
| Jules-Owner-B | D-BE | 1 | 0% | 1 | 1 | 2.5 | 0.25 | 20 |
| Cline-GLM | D-QA | 2 | 100% | 0 | 0 | 0.5 | 0.05 | 95 |
| Cline-GLM | D-DOC | 3 | 100% | 0 | 0 | 0.8 | 0.05 | 97 |
| Qoder-CN | D-OPS-PowerShell | 4 | 0% | - | - | - | - | 0 |
| Qoder-CN | D-OPS-Node | 2 | 100% | 0 | 0 | 0.85 | 0.1 | 94 |