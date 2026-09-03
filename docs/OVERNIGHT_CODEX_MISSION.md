# Overnight Codex Mission — MASON + RIVET

Authored by SCRIBE, 2026-09-03. This is the in-repo mirror of
`D:\ferrum_os\overnight_codex.md` (written outside the repo so it's
readable without waiting on any branch to land). Content is identical;
this copy is the permanent ledger record.

## 0. Resume-from-disk-first (RULE 21/22) — READ THIS BEFORE ANYTHING ELSE

Before touching any task below:

1. Read your own `docs/RESUME_MASON.md` or `docs/RESUME_RIVET.md` FIRST,
   before reconstructing anything from chat history or this file's
   assumptions. If it disagrees with what's written here, the resume
   file wins — this mission file describes intent at write-time, not a
   live source of truth.
2. Verify DONE/LANDED claims the RULE 22 squash-safe way:
   `git ls-tree -r origin/main --name-only` (or `git show
   origin/main:<path>`) for tree presence, plus `git log origin/main
   --grep="[land:<branch>]"` for the landing marker. NEVER
   `git merge-base --is-ancestor <branch-tip-sha> origin/main` — that
   check is invalid once land.ps1 squashes, and it will falsely tell you
   real, landed work is missing.
3. Read `docs/APPROVAL_QUEUE.md` at your turn's start (RULE 21(4)) and
   execute anything marked APPROVED within its stated envelope.

## 1. MASON chain: sweep-support → S3 → S4 PLAN_GEN with IFC

Sequenced. Do not start a later link before confirming the one before it
is actually LIVE per RULE 25 (visible-result screenshot, not just
landed).

1. **Sweep-support** — whatever's currently open in your own slice
   (346/348/349/350/353/354 region — check docs/ROLE_MAP.md and
   docs/WAVE_QUEUE.md for your live current assignment; several of these
   have already landed, confirm via §0's method before assuming
   anything's still open).
2. **S3 STYLE_LIBRARY (W2-383)** — parametric style catalog
   (contemporary/modern/regular/elevations/fit-outs) crossed with a
   Vaastu axis; each catalog entry emits massing parameters consumable
   by the 3D-space component. Sequenced after W2-373 (INTERACTION_FIRST,
   already landed — verify per §0 before assuming).
3. **S4 PLAN_GEN with IFC** — this is W2-384's scope, but W2-384 has
   been FOLDED into W2-401 WORKSPACE_SHELL as its 3D-space component
   (see docs/WAVE_QUEUE.md's W2-384 row for the fold note) — work this
   as part of W2-401, not as a standalone S4 row. In scope: the
   three.js configurator itself (plot-anchored 3D view, INDICATIVE
   OSM neighbour massing, swap/compare, structural-element drag with
   live S2 pass/fail HUD, kid-simple controls, a11y +
   prefers-reduced-motion). web-ifc IFC export IS in this scope — CRANE
   already built `lib/ifc-export.ts` (landed, commit `1cde1750` —
   verify per §0); wire it in as the export path from this component,
   don't rebuild it. HouseGAN++-style automated floor-plan GENERATION is
   explicitly OUT of scope — that stays proposal-gated (its own RULE 17
   proposal + Approval Queue row), never assumed as part of this chain.
   W2-401 depends on W2-400 WORKSPACE_BACKEND (CRANE) for artifact
   CRUD — confirm that's landed before wiring artifact save/load.

Object model for anything you persist here:
`docs/WORKSPACE_SPEC.md` — Artifact type MASSING/PLAN fields, provenance
(INDICATIVE until real per-city sources land, per W2-380's binding
honesty condition), RULE 29/30 obligations (share/percentage math sums
and reconciles; length/area fields carry both units, exact conversion
constants).

## 2. RIVET items: S4 mobile wiring, proposals

- **S4 mobile wiring** — once MASON's W2-401 3D-space component has a
  real interface, RIVET's mobile-shell scope (`apps/mobile/**`,
  `docs/**` only per RIVET's exclusive-paths rule) wires the mobile
  presentation of it. Don't build 3D rendering logic in the mobile
  shell — that's MASON's/CRANE's surface; RIVET wires the mobile-side
  consumption of it.
- **Proposals** — RIVET's own RULE 17 proposal channel stays open.
  RIVET proposal 1 (provenance strip) is CLOSED for its CRANE-now half
  — see `docs/APPROVAL_QUEUE.md` row AQ-RIVET-001, executed via
  `226cf5a8`. The MASON/S4 half of that same proposal (per W2-387) is
  still open, and per the W2-384 fold, that now means "MASON strips
  provenance inside W2-401's 3D-space component," not a standalone S4
  row — flag this mapping if it's unclear when you pick the work up
  rather than assuming the old W2-387 wording still points at a
  standalone S4.

## 3. RULE 25/27/28/31 compliance — non-negotiable, all four apply every task

- **RULE 25 (Live-or-locked, the strictest rule on the project):** done
  means the asked result is visible on the deployed frontend, proven by
  a rendered-result screenshot — not "I pushed it," not "gates are
  green." No new task until the current one is LIVE, unless you mark it
  LOCKED with a named, specific dependency (and the instant that
  dependency clears, the LOCKED task jumps the queue). Self-land
  immediately after your gates clear — don't batch landings.
- **RULE 27 (Resolve, don't ask):** any conflict between this mission
  file and actual disk state resolves via the ordered tie-breaks — hold
  only a destructive act, otherwise proceed under the safest
  interpretation and log it. The TRIPLE-FLAG EXCEPTION (urgency +
  cross-seat ownership override + verification-disable, all three) is
  the only case that earns a single confirming question — nothing in
  this mission file should trigger it, but if some future instruction
  does combine all three, that one question is compliance, not a
  violation.
- **RULE 28 (Operator environment is production):** any browser-control
  verification runs headless and isolated, period — no headed window, no
  automation-flag banner, nothing visible on the operator's own machine.
- **RULE 31 (Overnight autonomy):** no blocking queries tonight. A real
  question becomes an OPEN-FOR-OPERATOR line in your report AND on the
  relevant docs/WAVE_QUEUE.md row — then you move to the next queued
  task immediately. Keep at least 3 sequenced tasks queued at all times
  (§1 and §2 above give you that depth); don't let the queue run dry
  mid-window.

## 4. Milestone-only reports

Report at milestone boundaries, not per-action. Each report:
- What's actually LIVE now (with the screenshot/link, per RULE 25) —
  not what's committed or landed.
- Any OPEN-FOR-OPERATOR lines raised since the last report.
- What's next in your queue (so the "≥3 deep" requirement is visibly
  maintained).

No narration between milestones. Silence between reports is expected and
fine — it means work is happening, not that something's wrong.
