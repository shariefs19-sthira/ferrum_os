# Task Ledger (TASK_LEDGER.md)

This document provides a consolidated view of task statuses across the project.

## Ledger Table

| id | seat | status | sha/branch | logged-in |
|----|------|--------|------------|-----------|
| W1-01 | Qoder-CN | DONE | (Assumed from WAVE_QUEUE) | WAVE_QUEUE.md |
| W1-02 | Qoder-CN | DONE | (Assumed from WAVE_QUEUE) | WAVE_QUEUE.md |
| W1-03 | Qoder-CN | OPEN | N/A | WAVE_QUEUE.md |
| W1-04 | Qoder-CN | DONE | (Assumed from WAVE_QUEUE) | WAVE_QUEUE.md |
| W1-05 | Qoder-CN | OPEN | N/A | WAVE_QUEUE.md |
| W1-06 | Qoder-CN | OPEN | N/A | WAVE_QUEUE.md |
| W1-07 | Jules-Owner-B | DONE | (Assumed from WAVE_QUEUE) | WAVE_QUEUE.md |
| W1-08 | Jules-Fork-A | DONE | (Assumed from WAVE_QUEUE) | WAVE_QUEUE.md |
| W1-09 | (to be assigned) | OPEN | N/A | WAVE_QUEUE.md |
| W1-10 | (to be assigned) | OPEN | N/A | WAVE_QUEUE.md |
| W1-11 | Cline-GLM-Flash | DONE-evidenced | (Assumed from WAVE_QUEUE) | WAVE_QUEUE.md |
| W1-12 | Jules-Fork-A | OPEN | N/A | WAVE_QUEUE.md |
| W1-13 | Jules-Owner-B | DONE | (Assumed from WAVE_QUEUE) | WAVE_QUEUE.md |
| W1-14 | Jules-Owner-B | OPEN | N/A | WAVE_QUEUE.md |
| W1-15 | Jules-Fork-A | OPEN | N/A | WAVE_QUEUE.md |
| W1-16 | (to be assigned) | OPEN | N/A | WAVE_QUEUE.md |
| W1-17 | (to be assigned) | OPEN | N/A | WAVE_QUEUE.md |
| W1-18 | Cline-GLM-Flash | DONE | (Assumed from WAVE_QUEUE) | WAVE_QUEUE.md |
| W1-19 | (to be assigned) | OPEN | N/A | WAVE_QUEUE.md |
| W1-20 | Cline-GLM-Flash | DONE | (Assumed from WAVE_QUEUE) | WAVE_QUEUE.md |
| W1-21 | Scout (seat-unfilled) | DONE | (Assumed from WAVE_QUEUE) | WAVE_QUEUE.md |
| W1-22 | Scout (seat-unfilled) | DONE | (Assumed from WAVE_QUEUE) | WAVE_QUEUE.md |
| W1-23 | Operator | OPEN | N/A | WAVE_QUEUE.md |
| W1-23.1 | Qoder-CN | OPEN | N/A | WAVE_QUEUE.md |
| W1-24 | Operator | OPEN | N/A | WAVE_QUEUE.md |
| W1-25 | Scout | OPEN | N/A | WAVE_QUEUE.md |
| W2-68 | copilot-cli-vscode | PARKED-DEP-GAP | N/A | WAVE_QUEUE.md |
| W2-69 | copilot-cli-vscode | DONE | 922f283 | git log |
| W2-70 | copilot-cli-vscode | DONE | 922f283 | git log |
| W2-80 | copilot-cli-vscode | CLAIMED-copilot-cli-vscode | db1cdec (w2-80 branch) | WAVE_QUEUE.md / git log |
| W2-81 | copilot-cli-vscode | DONE | 1f57049 | git log |
| W2-82 | copilot-cli-vscode | DONE | 3e4c6b7 | git log |
| W2-85 | copilot-cli-vscode | DONE | e89ad25 | git log |
| RULE-47 | Qoder-CN | LANDED | 43ed037 (canonical copy) | This ledger (from git log) |
| RULE-47 | Qoder-CN | LANDED | 3ee4491 (w2-82 branch hunk) | This ledger (from git log) |
| RULE-47 | Qoder-CN | CONSUMED | Stash Pop (ignored) | This ledger (from instructions) |

## Mismatch Analysis

- **landed-not-logged (found in git log, not explicitly LANDED in WAVE_QUEUE with SHA):**
  - W2-80 (SHA: db1cdec, status in log is implied by branch/commit, but WAVE_QUEUE shows CLAIMED)
  - W2-81 (SHA: 1f57049)
  - W2-82 (SHA: 3e4c6b7)
  - W2-85 (SHA: e89ad25)
  - RULE-47 (SHA: 3ee4491 - on w2-82 branch, not on main)
- **claimed-no-sha (found claimed in WAVE_QUEUE, no corresponding commit SHA for completion):**
  - W2-85 (Status: CLAIMED-copilot-cli-vscode in WAVE_QUEUE, but git log shows it as DONE/created with SHA e89ad25 - status mismatch between source and log)
