> **Conductor Status:** ACTIVE - Managing batch B2 and subsequent tasks.
# Agent Board (AGENT_BOARD.md)

This document tracks the current activity of agents in the Ferrum OS fleet. Updated by agents on pull, commit, wait, and completion.

**Rule:** Only the batch conductor or the fleet status script reconcile the board state against the WAVE_QUEUE. Individual agents should only write to their own row when updating their status/heartbeat/next action. Board state should reflect active, verifiable work, not historic assertions without traceability.

| ID | Handle | Task ID | Status | Heartbeat | Next Action |
|----|--------|---------|--------|-----------|-------------|
| AG-008 | Qwen-Web | (conductor) | ACTIVE | 2026-08-30 06:45 UTC | Conductor — orchestrating B2/B3 wave landings, cherry-pick reconciliation, queue refresh. |
| AG-013 | Copilot | W2-04..W2-10, W2-33, W2-40, W2-45, W2-52 | ACTIVE | 2026-08-30 06:45 UTC | Included model, components; active on homepage, resources, footer, JSON-LD, FAQ, MobileMenu. |
| AG-003a | Cline-A | W2-53, W2-61, W2-68 | ACTIVE | 2026-08-30 06:45 UTC | model: minimax-m3:free; roles: lander + static-content (homepage highlights, case-study reconciliation, sweep). |
| AG-003b | Cline-B | W2-50, W2-54, W2-66, W2-67 | ACTIVE | 2026-08-30 06:45 UTC | model: minimax-m3:free; role: static-content (layouts + 4th blog + 4th case study). |
| AG-009 | Continue | W2-41, W2-43, W2-49 | ACTIVE | 2026-08-30 06:45 UTC | Ollama local; patterned static-content (resources layouts, demo/get-started, metadata refinement). |
| AG-001 | Qoder-CN | W1-23.1 | PARKED | 2026-08-30 06:45 UTC | Dead-worktree loop; pending conductor unstick. |
| AG-010 | Claude Code | — | DORMANT | 2026-08-30 06:45 UTC | Not onboarded to relay. |
| AG-002 | Jules | W1-14 | RETIRED | 2026-08-30 06:45 UTC | Retired after W1 batch. |
| AG-007 | Replit | browser | DORMANT | 2026-08-30 06:45 UTC | Seat dormant per conductor ruling. |
