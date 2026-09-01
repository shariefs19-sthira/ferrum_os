# ROLE_MAP.md — Ferrum OS Fleet Roster

Authoritative as of 2026-08-31. Maintained only by SCRIBE (AGENTS.md RULE 4).
Supersedes any prior roster claims made in chat that are not reflected here
or in git history on `main`.

## ACTIVE

| Seat   | Role                          | Notes |
|--------|-------------------------------|-------|
| CRANE  | Executor + Lander + REGENT    | Writes code, lands branches via `scripts/land.ps1`, and runs REGENT quality gates on its own landings. 19+ `[AI: CRANE]` commits on `main` as of 2026-08-31. |
| SCRIBE | Docs / Ledger / Rules / Registry | Owns AGENTS.md, ROLE_MAP.md, WAVE_QUEUE.md, docs/seats/*. Only seat permitted to commit rule changes (RULE 4). |
| ATLAS  | Architect + Executor (dual role, assigned slice) | Reactivated 2026-09-01. Works WAVE_QUEUE rows in its assigned slice (see below); disjoint-ownership protocol with CRANE — see AGENTS.md RULE 1. |

### ATLAS / CRANE disjoint-ownership protocol (2026-09-01)

- ATLAS's assigned slice (as of 2026-09-01): W2-320, 321, 323, 331, 332,
  333, 338, 339, 342.
- CRANE's assigned slice for the same batch: W2-322, 324, 326, 327, 328,
  329, 330, 334, 335, 337, 340, 341.
- ATLAS never edits `worker.ts` / auth / payments files.
- CRANE never edits sitemap / nav / footer / legal / resources files.
- Dependency additions (`package.json` / `pnpm-lock.yaml`) are CRANE-only.
- Both seats push from their own worktree (AGENTS.md RULE 9); landing is
  serialized through `scripts/land.ps1` regardless of which seat authored
  the branch.
- SWEEP_100 (final certification) is run mechanically by CRANE; each seat
  then spot-audits the other's half. No self-certification.

## CONDUCTOR

| Seat     | Role |
|----------|------|
| Qwen-Web | Assigns/sequences wave tasks across active seats. |

## OPERATOR

| Seat  | Role |
|-------|------|
| Human | Final authority; approves consolidation and rule changes. |

## PARKED (reactivatable when Codex/Cursor join)

| Seat    | Origin       | Notes |
|---------|--------------|-------|
| MASON   | Qoder        | Held OPEN rows in WAVE_QUEUE (W2-120/121/123/124/126/128/129/131) before parking; reassign to CRANE. |
| RIVET   | Qoder        | Held OPEN rows in WAVE_QUEUE (W2-122/125/127/130) before parking; reassign to CRANE. |
| GIRDER  | Qoder        | No commits or WAVE_QUEUE rows found on `main` as of 2026-08-31; parked with the rest of the Qoder set pending verification of prior use. |
| Copilot / copilot-cli-vscode | VS Code Agent | Long history of `[AI: ...]`-tagged landings (W2-04 through W2-101 range); parked, reactivatable. |
| Continue | VS Code Agent | Parked. |
| Jules    | — | Parked (owner/fork observer roles). |
| Cline-GLM-Flash / Cline-GLM-Standard | — | Parked; large land history (W2 series). |

## Name registry (AGENTS.md RULE 3)

Seat name -> underlying tool, kept for audit purposes:

- CRANE -> Claude Code (executor/lander/REGENT role for this fleet)
- SCRIBE -> Claude Code (docs/rules seat, this session)
- ATLAS -> Qoder-CN (active, dual role — see above)
- MASON, RIVET, GIRDER -> Qoder (parked)
- Qwen-Web -> Qwen-Web-Conductor

## Change log

- 2026-08-31: SCRIBE consolidation. Declared CRANE+SCRIBE as the active
  fleet; parked all Qoder seats (ATLAS, MASON, RIVET, GIRDER) and the older
  Copilot/Continue/Jules/Cline seats pending Codex/Cursor onboarding. This
  is a fresh baseline, not a continuation of a prior numbered rule set —
  no earlier "RULE 57" or equivalent existed on `main` before this commit.
- 2026-09-01: ATLAS reactivated as ACTIVE with a dual role (architect +
  executor for its assigned WAVE_QUEUE slice). Disjoint-ownership protocol
  established with CRANE (file-scope separation, CRANE-only deps, no
  self-certification on SWEEP_100). MASON, RIVET, GIRDER remain PARKED.
