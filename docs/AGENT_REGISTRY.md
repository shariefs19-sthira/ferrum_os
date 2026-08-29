# Agent Registry (AGENT_REGISTRY.md)

# Agent Registry (AGENT_REGISTRY.md)

This file tracks all AI agents in the system, their capabilities, status, and performance metrics.

## MACHINES
| Machine ID | Description | Cost | T-rating | Best Task | Trigger | Verified Date |
|------------|-------------|------|----------|-----------|---------|---------------|
| GitHub Actions | Cloud-based CI/CD runner | Free tier | T2 | Automated workflows | PR open | UNVERIFIED |
| Local Terminal | Developer workstation | Paid | T4 | Complex local tasks | Manual | UNVERIFIED |
| Vercel | Cloud deployment platform | Free tier | T3 | Frontend deployments | Git push | UNVERIFIED |

## AGENTS

| ID | Name | Model | Machine | Role | Domain | Status | Scorecard Ref | Notes |
|----|------|-------|---------|------|--------|--------|-------------|-------|
| AG-001 | Qoder-CN | Claude 4 | Local Terminal | WRITER-MAIN | Full-stack | ACTIVE | docs/MODEL_SCORECARD.md | Primary writer, handles core development |
| AG-002 | Jules | GPT-4 | Local Terminal | ARCHITECT | System Design | RETIRED | docs/MODEL_SCORECARD.md | Overnight overflow only, retired 2026-08-29; work stopped; W1-07/W1-13 landed as record |
| AG-003 | Cline | Claude 3.5 Sonnet | Local Terminal | WRITER-VOLUME | Code assist | ACTIVE | docs/MODEL_SCORECARD.md | Volume/docs tasks |
| AG-004 | Copilot | GPT-4 | Local Terminal | WRITER-VOLUME | Code assist | OVERFLOW | docs/MODEL_SCORECARD.md | Demoted 2026-08-29, scorecard evidence: 8+ corrections vs Qoder ~1-shot |
| AG-005 | Qwen-Code | Qwen Max | Local Terminal | SCOUT | Research | OVERFLOW | docs/MODEL_SCORECARD.md | Demoted 2026-08-29, scorecard evidence: 8+ corrections vs Qoder ~1-shot |
| AG-006 | Operator | GPT-4 | Local Terminal | OPERATOR | Computer Use | ACTIVE | docs/MODEL_SCORECARD.md | QA and system interaction tasks |
| AG-007 | Replit | Custom Model | Replit | OPERATOR | Browser Automation | ACTIVE | docs/MODEL_SCORECARD.md | Browser-based automation tasks |

| ID | handle | vendor/model | tier | position tag | onboarded | exited | status | missions | landed | ci-breaks | notes |
|----|--------|--------------|------|--------------|-----------|--------|--------|----------|--------|-----------|-------|
| AG-001 | Copilot-Prime | GitHub Copilot | A | [POS:WRITER-MAIN] | M5 | post-M9 | RETIRED | M1-M9 | 3 | 1 | first builder, retired per lifecycle. |
| AG-002 | Qoder-CN | Qoder backend | A | [POS:WRITER-MAIN] | M5 | - | ACTIVE | M5+ | many | 2 | primary writer, honest failures. |
| AG-003 | Jules-BOQ-1 | Jules/Gemini | S | [POS:WRITER-BRANCH] | M1-era | errored | RETIRED | BOQ | 1 | 0 | died mid-task, salvaged. |
| AG-004 | Jules-Fork-A | Jules/Gemini-3.6-Flash | S | [POS:WRITER-FORK] | M10 | - | ACTIVE | M10 | 1 | 0 | cross-fork landings. |
| AG-005 | Jules-Owner-B | Jules/Gemini | S | [POS:WRITER-BRANCH] | M11 | - | RETIRED | M11/M13 | 1 | 0 | history-rewrite incident IDEA-004. |
| AG-006 | Qwen3.8-Advisor | Qwen3.8 | C | [POS:ARCHITECT] | 2026-08-28 | - | ACTIVE | planning | 0 | 0 | advisory, no repo writes. |
| AG-007 | Dispatcher | interim: Qwen3.8-Advisor (AG-006 dual-hat) | C+T4 | [POS:DISPATCHER] | 2024-05-23 | - | ACTIVE | D-RES | 0 | 0 | experience-driven model routing. |
| AG-008 | Prophet | seat open (first pull by any T1+T4 agent) | C writes to PROPHECY_LOG | [POS:PROPHET] | 2024-05-23 | - | ACTIVE | D-RES | 0 | 0 | calibrated forecasting. |
| AG-009 | Conductor | infra bot | infra | [POS:CONDUCTOR] | 2024-05-23 | - | ACTIVE | D-OPS | 0 | 0 | batch gated release train. |
| AG-010 | Cline-GLM-Flash | harness Cline + GLM-4-Flash | B | [POS:WRITER-VOLUME] | 2024-05-24 | - | ACTIVE | D-QA, D-DOC | 0 | 0 | free, very-fast, light-quality. |
| AG-011 | Operator | Open Interpreter + agent-browser | S+ | [POS:OPERATOR] | 2024-05-24 | - | ACTIVE | D-QA, D-OPS | 0 | 0 | computer-use (T5+T6) via sandboxed Chrome. Safety controls: allowlist Chrome profile, no personal logins, domain allowlist (localhost/127.0.0.1/github.com), file whitelist (apps/, services/, docs/, scripts/) |
| AG-013 | copilot-cli-vscode | GitHub Copilot (VS Code runtime) | B | [POS:WRITER-HOTFIX] | 2026-08-29 | - | ACTIVE | W1-18 | 0 | 0 | T1:Yes (persistent checkout); T2:Yes (push branches/PR); T3:No (no isolated sandbox); T4:Yes (limited web/API access); T5:Limited (UI inspection requires human). |