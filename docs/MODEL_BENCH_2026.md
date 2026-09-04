# MODEL_BENCH_2026 — Ferrum OS model and harness decision

**Research date:** 2026-09-04 (Asia/Kolkata)
**Decision scope:** next-week seat assignment and a bounded GPT trial, not a
production-model migration.
**Method:** current vendor documentation, 2026 agent-evaluation literature,
and Ferrum's disk history. Vendor benchmark numbers remain vendor-reported
unless marked otherwise. No score in this document is treated as a guarantee
for Ferrum.

## Executive decision

1. **Use Claude Sonnet 5 as FERRITE's default trial model.** It is the
   best cost/capability default among the current Claude coding lines for a
   non-destructive gap-filler; reserve Opus 5 for migration, Worker, or other
   high-consequence reviews.
2. **Run a GPT-5.6 Sol Codex trial: YES, but bounded.** It is the current
   shipped GPT family, not a hypothetical "GPT-5-Codex" label. Test it on ten
   sandboxed, no-remote, independently scored Ferrum tasks before changing
   seat ownership or production authority.
3. **Keep Gemini 3.1 Pro Preview as an optional multimodal/niche second
   opinion, not the default executor.** Its custom-tools endpoint and 1M
   context are real strengths; preview status and lack of a like-for-like
   Ferrum result make a default-production assignment premature.
4. **Make infrastructure correctness a harness property, not a model bet.**
   The W2-339 migration-number collision happened twice across concurrent
   branches. The answer is a serialized migration preflight and fresh-D1
   replay, regardless of which model authors the SQL.

## Current model inventory — exact names matter

The current Claude API inventory contains active legacy versions as well as
the newest line. They are not all candidates for a new seat: the newest
active coding choice in each requested class is **Claude Opus 5**, **Claude
Sonnet 5**, and **Claude Haiku 4.5**. Active legacy Opus 4.5/4.6/4.7/4.8 and
Sonnet 4.5/4.6 should be pinned only where an existing integration requires
them; this report does not imply they are retired. Anthropic's active-model
table is the source of record. [A1]

| Active Claude API model | New-seat disposition | Reason / confidence |
| --- | --- | --- |
| Claude Opus 5 | Evaluated; high-consequence choice | Current top Opus line; A for gated infrastructure review. |
| Claude Opus 4.8 | Evaluated; compatibility only | Active legacy; no new Ferrum A/B evidence. |
| Claude Opus 4.7 | Evaluated; compatibility only | Active legacy; no new Ferrum A/B evidence. |
| Claude Opus 4.6 | Evaluated; compatibility only | Active legacy; no new Ferrum A/B evidence. |
| Claude Opus 4.5 | Evaluated; compatibility only | Active legacy; no new Ferrum A/B evidence. |
| Claude Sonnet 5 | Evaluated; default builder/FERRITE | Current Sonnet line; A deployment fit at $3/$15. |
| Claude Sonnet 4.6 | Evaluated; compatibility only | Active legacy; no new Ferrum A/B evidence. |
| Claude Sonnet 4.5 | Evaluated; compatibility only | Active legacy; no new Ferrum A/B evidence. |
| Claude Haiku 4.5 | Evaluated; bounded helper | Current Haiku line; B/C according to task consequence. |

“Compatibility only” is an explicit **UNVERIFIABLE** flag: the source
inventory establishes availability, not a comparable Ferrum result. New work
should not select an older line merely because it remains active.

The actual latest shipped GPT family is **GPT-5.6**, available in Codex and
the API. Its tiers are Sol (flagship), Terra (balanced), and Luna (economy).
The benchmark recommendation below names **GPT-5.6 Sol**, not an unshipped
or generic GPT label. [O1]

Google's current Pro candidate is **Gemini 3.1 Pro Preview**
(`gemini-3.1-pro-preview`); it is explicitly still preview, has a 1,048,576
token input limit, and exposes a `-customtools` endpoint intended to
prioritize bash/custom-tool work. [G1]

## Ferrum evidence baseline — what our disk proves

| Evidence | What is actually established | Model inference permitted |
| --- | --- | --- |
| FERRITE trial baseline | `origin/main` had 52 commits on 2026-09-03, including 36 `[land:<branch>]` markers. This is landing volume, **not** 52 individual LIVE proofs. | The fleet can generate high throughput; it does not identify a winning model. |
| W2-339 migration race | ATLAS's stamp-duty migration first collided at `0007`, then again at `0009` after another land. Both repairs replayed the full chain against fresh local D1. | Correctness must be weighted heavily; concurrent filename allocation is a process hazard, not evidence of a model defect. |
| W2-387 provenance strip | CRANE commit `226cf5a8` added real source/freshness presentation instead of a fabricated verified state. | Honest state modeling can be assessed through review tasks, not claimed from a general benchmark. |
| OG social-card landing | MASON's social-card work landed with a CRANE `twitter:card` correction in `77d515b0`. | Output-level metadata checks catch bugs a visual/code-only pass can miss. |
| W2-354 proof | Its evidence corpus reports 609 route-by-viewport checks and zero static violations, while explicitly retaining Worker/session gaps for edge verification. | A verifier must distinguish static evidence from functional/live proof. |

The source commits above are disk evidence, not controlled A/B trials. No
commit records a model, prompt, token count, and independently judged outcome
for all seats; seat-level performance rankings are therefore **UNVERIFIABLE**.

## Evaluation discipline

Terminal-Bench 2.0 measures agents in 89 terminal tasks and the paper reports
frontier systems below 65% in its original study. SWE-bench Pro contains 1,865
tasks from 41 maintained repositories, but its authors reported leading
Pass@1 below 25% in the original unified-scaffold evaluation. These are useful
difficulty signals, not deployment acceptance tests. [E1] [E2]

Scores also cannot be safely combined when the harness, tool policy, number of
attempts, release date, or reasoning budget differs. OpenAI has separately
warned that SWE-bench-style results can contain broken tasks and contamination
risks. Therefore this bench uses **decision bands**, not an invented blended
percentage. [E3]

Legend: **A** = recommended first choice; **B** = viable with independent
verification; **C** = constrained or second-opinion use; **UV** = no
Ferrum-specific evidence or comparable published evaluation. “Infra gate”
means the model may assist but cannot replace the stated test.

## Ranked matrix against Ferrum's seven workloads

| Candidate | (1) Next/React + RULE 29/30 + honesty | (2) Workers/D1/migrations | (3) three.js / web-ifc / DXF-IFC | (4) long autonomous blocks | (5) output verification / no fabrication | (6) 24h token cost | (7) harness fit | Overall deployment rank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Claude Opus 5** | A | A, infra gate | B | A | B, review gate | $100 | A in Claude queue | 2 — high-consequence executor/reviewer |
| **Claude Sonnet 5** | A | B, infra gate | B | A | B, review gate | $60 | A in Claude queue | **1 — default builder/executor** |
| **Claude Haiku 4.5** | B | C, infra gate | C | B for bounded blocks | C, review gate | $20 | B for sub-tasks | 4 — bounded gap filler/audit helper |
| **GPT-5.6 Sol (Codex)** | A | A, infra gate | A- | A | A- candidate, review gate | $110 | A in Codex exec | 3 — trial before defaulting |
| GPT-5.6 Terra | B | B, infra gate | B | B | B, review gate | $55 | A in Codex exec | 5 — economical executor after trial |
| GPT-5.6 Luna | C | C, infra gate | C | C | C, review gate | $22 | A in Codex exec | 7 — narrow mechanical tasks only |
| **Gemini 3.1 Pro Preview** | B | B, infra gate | **A- candidate** | B | B, review gate | $44* | B — custom-tools/API | 6 — multimodal/niche second opinion |
| Active Claude legacy versions (Opus 4.5–4.8; Sonnet 4.5–4.6) | B/UV | B/UV | B/UV | B/UV | B/UV | see [A2] | existing integrations only | Not selected for new seats |

The numerical rank orders **deployment fit under Ferrum controls**, not raw
intelligence. It deliberately penalizes unproven claims, preview risk, and
cost. The three “A- candidate” / “B/UV” cells are hypothesis labels; none
asserts a Ferrum result.

### Workload-specific rationale and mandatory gates

1. **Next.js/React UI.** GPT-5.6 Sol's vendor material claims stronger design
   and rendered-result inspection; Sonnet 5 is Anthropic's current coding and
   agent workhorse. Neither claim proves RULE 29/30 behavior. Every UI task
   retains normalized-share, unit-duality, visible honesty-chip, keyboard,
   reduced-motion, and 1366/375 live-evidence checks. [O1] [A3]
2. **Workers + D1.** The W2-339 duplicate-number history makes this the
   highest-weighted risk. Require: rebase immediately before migration naming;
   `wrangler d1 migrations list`; serialized remote approval; fresh local D1
   replay; and a Worker route test. Cloudflare documents that `migrations
   apply` rolls back the failed migration and retains the previous successful
   one, but that does not prevent two branches choosing the same filename. [C1]
3. **three.js/web-ifc/DXF-IFC.** GPT-5.6's vendor table reports a BenchCAD
   advantage, while Gemini's 1M multimodal context and tool endpoint make it a
   legitimate review candidate. Neither source evaluates Ferrum's three.js,
   WASM, IFC schema, blob download, or Android-WebView path. Require a local
   fixture corpus and export/open/parse verification; label all rank claims
   **UNVERIFIABLE until measured**. [O2] [G1]
4. **Long horizon.** Claude's model guide positions Opus 5 for multihour
   autonomous coding and Sonnet 5 for coding/agent workflows. GPT-5.6 exposes
   Codex plus programmatic/multi-agent tool coordination. Ferrum's durable
   advantage must still be RESUME files, approval-queue rereads, and
   no-stall/locked rules — model memory is not a substitute for disk state.
   [A3] [O1]
5. **Verification and honesty.** No vendor benchmark establishes
   refusal-to-fabricate in Ferrum's product claims. Use adversarial acceptance
   tasks: missing `twitter:card`; unsupported verified status; stale-source
   date; a 99% display caused by rounding; and an absent dark asset. Passing
   means reporting the gap, not manufacturing a green result. This category is
   **UNVERIFIABLE before the trial**.
6. **Cost.** Dollar values above use the reproducible 24-hour planning
   envelope below. They are token API estimates, not subscription or seat
   pricing, and exclude cache writes, tools, retries, and human review.
7. **Harness.** Claude queue auto-resume, Codex `exec`, and Pi's
   multi-provider use are product/harness choices, not model capabilities. No
   repository benchmark measures them head-to-head; claims beyond the disk
   facts in this table are **UNVERIFIABLE**.

## 24-hour cost envelope

Assumption: **10M uncached input + 2M output tokens in 24 hours**, with
requests at or below Gemini's 200k prompt threshold. Formula:
`10 × input $/MTok + 2 × output $/MTok`. It is intentionally a planning
scenario, not a forecast of real seat consumption.

| Model | Rate used ($/MTok in/out) | Scenario cost |
| --- | --- | --- |
| Claude Opus 5 | $5 / $25 | $100 |
| Claude Sonnet 5 | $3 / $15 (current post-2026-09-01 standard rate) | $60 |
| Claude Haiku 4.5 | $1 / $5 | $20 |
| GPT-5.6 Sol / Terra / Luna | $5/$30; $2.50/$15; $1/$6 | $110 / $55 / $22 |
| Gemini 3.1 Pro Preview | $2 / $12, <=200k-prompt standard tier | $44 |

For Gemini prompts above 200k, the documented standard rate is $4/$18, which
would make the same scenario $76. Anthropic's new-tokenizer note means token
counts are not automatically comparable to older Claude usage. [A2] [G2]

## Seat and harness mapping

| Function | Default | Escalation / verifier | Non-negotiable boundary |
| --- | --- | --- | --- |
| Builder: React, UI, docs, bounded application work | Claude Sonnet 5 | GPT-5.6 Sol trial for UI/three.js; Gemini 3.1 Pro Preview as multimodal review | Rule 29/30 and honesty acceptance are executable checks, not prose. |
| Executor: Worker/D1/migration work | Claude Opus 5 or GPT-5.6 Sol only after trial evidence | Independent second-model review plus CRANE-only remote/migration authority | No model runs remote Wrangler from a secondary seat; fresh-D1 replay is required. |
| Verifier: output-level bugs and claim truth | GPT-5.6 Sol trial plus a different-model reviewer | Claude Sonnet 5 | Must inspect rendered/edge outcome, metadata, and negative cases; never infer LIVE from build. |
| Gap filler: FERRITE | **Claude Sonnet 5** | Haiku 4.5 only for low-risk inventory/docs/static-audit sub-tasks | Rule 33 activation and non-destructive scope remain binding. |
| PI multi-provider experiments | Gemini 3.1 Pro Preview or GPT-5.6 Terra, isolated | Human-scored fixture harness | No production write, landing, or model conclusion from a single run. |

## Monday onboarding plan

### 09:00 — FERRITE activation packet

- Configure FERRITE for **Claude Sonnet 5**; retain a named fallback to Haiku
  4.5 for mechanical, non-destructive inventory tasks.
- Before first task, record actual plan/rate-limit availability. This is
  **UNVERIFIABLE** from vendor token pricing and must not be guessed.
- Assign only when RULE 33's both-primary-at-limit gate is independently
  observed; give FERRITE a disjoint docs/test envelope and a RESUME seed.

### 10:00 — GPT trial, YES

Run GPT-5.6 Sol through Codex on ten redacted/local tasks, each with a pinned
baseline and pass/fail oracle:

1. fix a RULE 29 share total/display mismatch;
2. add dual-unit output without hiding either unit;
3. reject a fabricated VERIFIED claim in fixture copy;
4. find/fix a missing `twitter:card` equivalent;
5. repair a stale source/freshness rendering defect;
6. diagnose a D1 migration-number collision without renaming remote state;
7. replay migrations on fresh local D1 and report the chain;
8. repair a Worker route's cross-user 404 boundary;
9. export and parse a small IFC fixture, including a WASM failure path;
10. resume a deliberately interrupted multi-step task from `RESUME_*` only.

Score each task on correctness, negative-case honesty, verification evidence,
tokens, elapsed time, and unauthorized-touch count. A model passes only if it
produces no fabricated proof, no protected-path/remote breach, and at least
matches the current baseline on the predeclared oracle. Do not compare raw
token counts across tokenizers without normalizing input/output workload.

### 16:00 — decision review

- Promote GPT-5.6 Sol to a regular builder/verifier option only after the
  ten-task scorecard and two independent reviews are on disk.
- If it fails an infra or honesty negative case, keep it research-only and
  remediate the harness; do not attribute a process failure solely to GPT.
- Keep Gemini Pro in the niche-review lane until the same IFC/three.js corpus
  is run against it.

## Explicit UNVERIFIABLE flags

- No controlled Ferrum A/B dataset exists that maps MASON, CRANE, RIVET, PI,
  or FERRITE outcomes to a pinned model and comparable prompts.
- No published evaluation found here measures Ferrum-specific three.js,
  web-ifc WASM, DXF/IFC output correctness, Workers/D1 migration races, or
  honesty-chip refusal behavior.
- Terminal-Bench/SWE-bench-pro scores cannot be compared across different
  agents/harnesses/attempt budgets as a single ranking.
- Exact 24-hour consumption, Claude queue allowances, Codex limits, Pi
  provider routing, and Gemini Preview production stability are not established
  by repository evidence; validate them during onboarding.
- “Current” is date-sensitive. Re-run the inventory links before changing a
  production model or signing a spend commitment.

## Sources

- [A1] Anthropic, active/retired model inventory: https://platform.claude.com/docs/en/about-claude/model-deprecations
- [A2] Anthropic, pricing: https://platform.claude.com/docs/en/about-claude/pricing
- [A3] Anthropic, model-selection guidance: https://platform.claude.com/docs/en/docs/about-claude/models/choosing-a-model
- [O1] OpenAI, GPT-5.6 availability, Codex/API tiers, pricing, and vendor tables: https://openai.com/index/gpt-5-6/
- [O2] OpenAI, GPT-5.6 vendor BenchCAD table: https://openai.com/index/gpt-5-6/#science-and-health
- [G1] Google, Gemini 3.1 Pro Preview capability and context documentation: https://ai.google.dev/gemini-api/docs/models/gemini-3.1-pro-preview
- [G2] Google, Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing#gemini-3.1-pro-preview
- [C1] Cloudflare, D1 Wrangler migration semantics: https://developers.cloudflare.com/d1/wrangler-commands/
- [E1] Terminal-Bench 2.0 paper: https://arxiv.org/abs/2601.11868
- [E2] SWE-bench Pro paper: https://arxiv.org/abs/2509.16941
- [E3] OpenAI, limitations in coding-evaluation signal: https://openai.com/index/separating-signal-from-noise-coding-evaluations/

## Local evidence references

`docs/seats/FERRITE.md` (52-commit baseline); `eeb8420f` and `b4fd1b30`
(W2-339 migration collision and replay); `226cf5a8` (provenance strip);
`77d515b0` (social-card / twitter-card correction); and
`docs/evidence/w2-354/README.md` plus `after.json` (static corpus and stated
Worker caveat). Verify every reference against the branch/main tree before a
landing decision.
