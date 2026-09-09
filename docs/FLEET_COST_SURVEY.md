# FLEET_COST_SURVEY.md — OVERRIDE-3 conductor-directed research

Research only, no procurement action taken. Live-verified 2026-09-09 against current Anthropic/OpenAI pricing pages and third-party trackers (Anthropic and OpenAI don't publish exact token-per-plan caps, only relative multipliers — flagged where a figure is a multiplier, not a hard number).

## 1. Claude plan tiers vs. Max-tier limits

| Plan | Price | Weekly limit (relative) | Session limit | Notes |
|---|---|---|---|---|
| Free | $0 | Lowest | 5-hour rolling window | Not fleet-viable |
| Pro | $20/mo ($17/mo annual) | Baseline (1x) | 5-hour rolling window | Single-seat interactive use only |
| **Max 5x** | $100/mo | 5× Pro | 5-hour rolling window | Entry fleet-seat tier |
| **Max 20x** | $200/mo | 20× Pro; **up to 480 Sonnet-hours/week or 40 Opus-hours/week** (Anthropic's own published ceiling, session-concurrency-dependent) | 5-hour rolling window | Aimed explicitly at all-day Claude Code, parallel sessions, weekly-cap-bound workloads — the correct tier for an always-on fleet seat |
| Team (Standard) | $25/seat/mo | Pro-equivalent per seat | 5-hour rolling window | Per-seat billing, not clearly cheaper than Max for a small fixed fleet |
| Team (Premium) | $125/seat/mo | Higher | 5-hour rolling window | Priced between Max 5x and Max 20x per seat |

**Headless `-p` spawns (how the fleet actually revives seats — confirmed in `docs/FLEET_SEATS.json`'s `reviveCmdTemplate: "claude -p ..."`):** as of **2026-06-15**, Anthropic paused the separate Agent SDK credit pool — **programmatic usage via `claude -p`, the Agent SDK, and third-party apps all draw from the same subscription weekly pool as interactive chat and Cowork**, not a separate allotment. This is directly relevant: the fleet's headless revival mechanism competes for the same weekly budget as any interactive Claude Code session on that account, not a free/separate channel.

**API fallback (when weekly caps are hit):** Anthropic's own guidance, confirmed via search: use the Max subscription for primary/everyday interactive work, and point **overnight/burst fleets at a direct `ANTHROPIC_API_KEY`** billed at standard per-token API rates — a flat-rate-plus-metered-overflow model, not an either/or choice.

**Current Anthropic API rates (Sonnet 5, the fleet's primary model per `FLEET_SEATS.json`):** **$3/M input tokens, $15/M output tokens** (introductory $2/$10 rate ended 2026-08-31). Batch processing: 50% cheaper. Prompt caching: 90% cheaper on cached input — highly relevant for a fleet re-sending the same `AGENTS.md`/system-prompt context on every headless spawn.

## 2. Codex plan tiers + limit behavior

| Plan | Price | Relative usage | Limit window |
|---|---|---|---|
| Free | $0 | Limited | — |
| Go | $8/mo | Entry | 5-hour rolling window |
| Plus | $20/mo | "A few focused coding sessions each week" | 5-hour rolling window |
| **Pro 5x** | $100/mo | 5× Plus | 5-hour rolling window |
| **Pro 20x** | $200/mo | 20× Plus | 5-hour rolling window |
| Business | $25/user/mo (monthly) or $20/user/mo (annual), min. 2 users | Team-scale | 5-hour rolling window |
| Enterprise | Custom | Custom | — |

**Limit behavior:** all Codex plan tiers meter on the **same 5-hour rolling window model as Claude**, not a daily/monthly cap — directly comparable mechanics. Real-world reported cost: **$100–$200 per active developer per month** for typical Codex usage (varies by model, parallel-instance count, and "fast mode"). Note: **as of 2026-04-02, OpenAI retired per-message pricing** for Plus/Pro/Business in favor of token-based credits — the flat-fee subscription now converts to a metered credit balance internally, closer to Claude's token-metered-behind-a-subscription model than the old flat "N messages" framing.

## 3. Cost-per-landing estimate

Given this fleet's actual shape (per `docs/FLEET_SEATS.json`: 5 Claude-adapter seats — CRANE, ATLAS, SCRIBE, FERRITE, PI — and 2 Codex-adapter seats — MASON, RIVET) and this session's own observed pattern (a research-doc landing cycle: research + write + commit + push + `land.ps1` verification runs roughly 10–20 minutes of active model work per row):

| Model | Cost basis | Estimated cost/landing (chain-heavy, ~10–20 min/row) |
|---|---|---|
| Claude Sonnet 5, **Max 20x subscription** | $200/mo flat, amortized across weekly capacity (480 Sonnet-hrs/wk) | **Effectively near-zero marginal cost per landing** as long as total fleet usage stays under the weekly hour ceiling — the binding constraint is *time*, not *dollars*, until the cap is hit |
| Claude Sonnet 5, **API key (overflow/burst)** | $3/M in, $15/M out | A single research-doc landing in this session's own pattern (multiple searches, file reads, a multi-hundred-line doc write, commit) plausibly runs 50–150K tokens total → **roughly $0.30–$1.50/landing** at list rates, less with prompt caching on repeated system-prompt/`AGENTS.md` context |
| Codex, **Pro 20x subscription** | $200/mo flat | Same "near-zero marginal, capacity-bound" logic as Claude Max — real-world reports put typical *total* monthly cost at $100–$200/developer regardless of per-landing counting |
| Codex, **API-metered credits** (post-April-2026 retirement of per-message pricing) | Token-based credits, rate not separately published in this search pass | **UNVERIFIED** exact per-token rate — flagged rather than estimated without a source |

## 4. Recommendation for THIS fleet's shape (6 active seats, ~10 open rows, chain-heavy)

**Subscription-first, API-overflow-second — not API-only.** Chain-heavy work (many small sequential landings, each re-establishing context) is exactly the pattern that makes a flat-rate weekly-hour plan cost-effective relative to pure per-token billing: the *marginal* cost of one more small landing under an unused Max/Pro allocation is ~$0, while the same pattern on pure API billing pays full context-reload cost on every single small landing (partially offset by prompt caching, but not eliminated).

- **The 5 Claude-adapter seats** (CRANE, ATLAS, SCRIBE, FERRITE, PI) should run on **Max 20x** ($200/mo each, or consolidated differently if the account structure allows pooling — not independently verified whether Max plans support cross-seat pooling under one account this pass, flagged as an open question) given the "all-day Claude Code, parallel sessions" framing is Anthropic's own stated use case for that exact tier.
- **The 2 Codex-adapter seats** (MASON, RIVET) should run on **Codex Pro 20x** ($200/mo each) for the same reasoning, matching Codex's own tier structure to Claude's.
- **Both should fall back to API-key billing only for genuine overflow** — a seat that's about to hit its weekly cap mid-chain, not as the default operating mode. This matches Anthropic's own explicit guidance found in this research, and avoids per-token costs stacking up across ~10 open rows' worth of chained landings, each of which re-sends a large shared system-prompt/`AGENTS.md` context that benefits heavily from the *subscription* model's flat-rate framing (and from prompt caching when API fallback is used).
- **At this fleet's current scale (6 seats, ~10 rows), total ceiling cost is ~$1,200–$1,400/month** (5×$200 Claude Max 20x + 2×$200 Codex Pro 20x) if every seat runs the top tier continuously — likely **more capacity than ~10 open rows actually consumes** given this session's own observed pace (a handful of research-doc landings per multi-hour pass); the real lever for cost efficiency is **right-sizing individual seats to Max 5x/Pro 5x** where a seat's actual weekly load doesn't approach the 20x ceiling, not switching the fleet to pure API billing.

---

*Every price/limit figure above is sourced from live search this session (Anthropic's and OpenAI's own pricing pages plus third-party trackers), not recalled from training data — pricing in this space changes frequently (both providers changed billing models mid-2026) and this document should be re-verified before being used for an actual procurement decision, which this row explicitly does not authorize.*
