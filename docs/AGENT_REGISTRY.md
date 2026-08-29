# Agent Registry

| ID | handle | vendor/model | tier | position tag | onboarded | exited | status | missions | landed | ci-breaks | notes |
|----|--------|--------------|------|--------------|-----------|--------|--------|----------|--------|-----------|-------|
| AG-001 | Copilot-Prime | GitHub Copilot | A | [POS:WRITER-MAIN] | pre-M1 | post-M9 | RETIRED | M1-M9 | 3 | 1 | first builder, retired per lifecycle. |
| AG-002 | Qoder-CN | Qoder backend | A | [POS:WRITER-MAIN] | M5 | - | ACTIVE | M5+ | many | 2 | primary writer, honest failures. |
| AG-003 | Jules-BOQ-1 | Jules/Gemini | S | [POS:WRITER-BRANCH] | M1-era | errored | RETIRED | BOQ | 1 | 0 | died mid-task, salvaged. |
| AG-004 | Jules-Fork-A | Jules/Gemini-3.6-Flash | S | [POS:WRITER-FORK] | M10 | - | ACTIVE | M10 | 1 | 0 | cross-fork landings. |
| AG-005 | Jules-Owner-B | Jules/Gemini | S | [POS:WRITER-BRANCH] | M11 | - | ACTIVE | M11/M13 | 1 | 0 | history-rewrite incident IDEA-004. |
| AG-006 | Qwen3.8-Advisor | Qwen3.8 | C | [POS:ARCHITECT] | 2026-08-28 | - | ACTIVE | planning | 0 | 0 | advisory, no repo writes. |
| AG-007 | Dispatcher | interim: Qwen3.8-Advisor (AG-006 dual-hat) | C+T4 | [POS:DISPATCHER] | 2024-05-23 | - | ACTIVE | D-RES | 0 | 0 | experience-driven model routing. |
| AG-008 | Prophet | seat open (first pull by any T1+T4 agent) | C writes to PROPHECY_LOG | [POS:PROPHET] | 2024-05-23 | - | ACTIVE | D-RES | 0 | 0 | calibrated forecasting. |
| AG-009 | Conductor | infra bot | infra | [POS:CONDUCTOR] | 2024-05-23 | - | ACTIVE | D-OPS | 0 | 0 | batch gated release train. |
| AG-010 | Cline-GLM-Flash | harness Cline + GLM-4-Flash | B | [POS:WRITER-VOLUME] | 2024-05-24 | - | ACTIVE | D-QA, D-DOC | 0 | 0 | free, very-fast, light-quality. |
| AG-011 | Operator | Open Interpreter + agent-browser | S+ | [POS:OPERATOR] | 2024-05-24 | - | ACTIVE | D-QA, D-OPS | 0 | 0 | computer-use (T5+T6) via sandboxed Chrome. Safety controls: allowlist Chrome profile, no personal logins, domain allowlist (localhost/127.0.0.1/github.com), file whitelist (apps/, services/, docs/, scripts/) |
| AG-012 | Operator | Open Interpreter + agent-browser | S+ | [POS:OPERATOR] | 2024-05-24 | - | ACTIVE | D-QA, D-OPS | 0 | 0 | MACHINES: Cross-linked with machine infrastructure for computer-use (T5+T6) via sandboxed Chrome. |
| AG-014 | Replit | Online IDE platform | T2 | [POS:REPLIT] | 2024-05-24 | - | ACTIVE | D-PROTO | 0 | 0 | MACHINES: Cross-linked with Replit machine for rapid prototyping and collaborative coding. |

## MACHINES

Infrastructure machines (not agents) used for various purposes:

| Machine | Description | Cross-link |
|---------|-------------|------------|
| GitHub Actions | CI/CD automation | AG-012 Operator uses for automation |
| Local Terminal | Manual development | Primary development environment |
| Vercel | Frontend hosting | Deployment platform for frontend |
| Replit | Online IDE/prototyping | AG-014 Replit for rapid prototyping |
| Railway | Backend hosting | API deployment and database hosting |
| AWS EC2 | Cloud compute | Scalable infrastructure for production |
| Google Cloud Platform | Cloud services | Advanced cloud services, ML/AI workloads |
| Docker | Containerization | Consistent environments, microservices |
| Kubernetes | Container orchestration | Large-scale deployments, auto-scaling |