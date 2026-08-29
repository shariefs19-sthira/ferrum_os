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
| AG-002 | Jules | GPT-4 | Local Terminal | ARCHITECT | System Design | OVERFLOW | docs/MODEL_SCORECARD.md | Overnight overflow only, re-earned by scorecard |
| AG-003 | Cline | Claude 3.5 Sonnet | Local Terminal | WRITER-VOLUME | Code assist | ACTIVE | docs/MODEL_SCORECARD.md | Volume/docs tasks |
| AG-004 | Copilot | GPT-4 | Local Terminal | WRITER-VOLUME | Code assist | OVERFLOW | docs/MODEL_SCORECARD.md | Demoted 2026-08-29, scorecard evidence: 8+ corrections vs Qoder ~1-shot |
| AG-005 | Qwen-Code | Qwen Max | Local Terminal | SCOUT | Research | OVERFLOW | docs/MODEL_SCORECARD.md | Demoted 2026-08-29, scorecard evidence: 8+ corrections vs Qoder ~1-shot |
| AG-006 | Operator | GPT-4 | Local Terminal | OPERATOR | Computer Use | ACTIVE | docs/MODEL_SCORECARD.md | QA and system interaction tasks |
| AG-007 | Replit | Custom Model | Replit | OPERATOR | Browser Automation | ACTIVE | docs/MODEL_SCORECARD.md | Browser-based automation tasks |