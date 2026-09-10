# Ferrum OS — docs index

Ferrum OS is an India-focused construction/real-estate SaaS platform:
ten integrated products (LandIntel, DesignStudio, Structura, BOQPro,
ProMarket, ProcureHub, InvestFlow, BuildOS, CommunityBuild, Transact)
sharing one deterministic engine and one live project-state model. This
repo is built and operated by a multi-agent fleet (SCRIBE, CRANE,
MASON, RIVET, ATLAS, PI, FERRITE) coordinated through
[`AGENTS.md`](../AGENTS.md), the operating rulebook every seat follows.

## Quick start

- **Operating rules:** [`AGENTS.md`](../AGENTS.md) — read this first,
  it is authoritative for every seat's behavior.
- **Live work queue:** [`TASK_BOARD.md`](TASK_BOARD.md) — the
  pull-queue every seat drains from.
- **Independent verification:** [`EXECUTION_LEDGER.md`](EXECUTION_LEDGER.md)
  — PI's own oversight ledger, one block per row.
- **Full activity history:** [`ACTIVITY_LOG.md`](ACTIVITY_LOG.md) —
  append-only log of every landed action.
- **Reconciled task view:** [`MASTER_TASK_LIST.md`](MASTER_TASK_LIST.md)
  — a deduped, cross-referenced view of the board for operator review.

## Governance

- [`governance/RULES_REFERENCE.md`](governance/RULES_REFERENCE.md) —
  compiled reference for RULE 48/51/52/55/56/59/61, the Reserved Five,
  and the OVERRIDE process. `AGENTS.md` remains the authoritative
  source; this is a navigation layer over it.

## Architecture, API, deployment, and contribution docs

**Not yet authored.** A comprehensive architecture/API/deployment/
contribution documentation suite has been requested and is queued on
`docs/TASK_BOARD.md` as row **W-124** (see below), assigned to CRANE —
consistent with this fleet's own established division of labor:
SCRIBE maintains the ledger/rules/registry and compiles reference
material from content that already exists, but does not independently
author new substantive technical research/content docs from scratch.
This section will be filled in with real links once that row lands.

## Fleet seats

Per-seat scope and standing instructions live in
[`seats/`](seats/) — one file per seat (`SCRIBE.md`, `CRANE.md`,
`MASON.md`, `RIVET.md`, `ATLAS.md`, `PI.md`, `FERRITE.md`).

## Method

[`FERRUM_METHOD_PLAYBOOK.md`](FERRUM_METHOD_PLAYBOOK.md) generalizes
this engagement's fleet-coordination method for reuse in future
engagements.
