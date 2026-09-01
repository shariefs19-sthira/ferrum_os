# CONCIERGE_LLM GROUNDING DESIGN (CRANE-authored, 2026-09-01)

## 0. Scope and status

This is the design for W2-315's implementation: an LLM-backed upgrade
to the deterministic Concierge (`docs/AGENT_INTERFACE.md`, W2-307).
Research/docs only — no code lands from this document. W2-315 itself
stays gated on `ANTHROPIC_API_KEY` secret provisioning and operator
budget approval (`docs/WAVE_QUEUE.md` W2-308/315); this document is
the spec that build gets checked against once those clear.

The deterministic Concierge (W2-307) is not being replaced — it is
the fallback this design routes to whenever the LLM path can't answer
confidently (§3). CONCIERGE_LLM is additive capability, not a
rewrite.

## 1. Why retrieval over the site catalog, not open generation

The deterministic Concierge already has a build-time catalog
(`lib/concierge/catalog.ts`, W2-307) — 10 products, 9 real tools, 6
general pages, each with keywords. CONCIERGE_LLM's retrieval corpus
is the same catalog, expanded with the actual page content each
catalog entry links to (product page copy, tool descriptions, FAQ
text already live on the site). This is a deliberate constraint: the
LLM answers from what Ferrum OS has actually published, not from
general knowledge about construction, real estate, or investing. An
LLM given free rein to answer construction-domain questions from its
training data would produce plausible-sounding but unverified claims
in a product surface `docs/COMPLIANCE_GATE.md` already treats as
high-stakes (Transact) and `docs/AGENT_INTERFACE.md` already commits
to being INDICATIVE and honest everywhere else. Retrieval-only closes
that gap: every claim traces to a real, published source.

## 2. Mandatory citations

Every generated answer includes a citation to the specific catalog
entry (and, where the entry links to a specific section, the section)
the answer was grounded in. This is not optional metadata — an answer
with no traceable source is not returned to the user; it falls
through to the deterministic fallback (§3) instead. The citation
format mirrors what a human could click through to verify: a link to
the real page, not a paraphrase of "according to our records."

This also gives the user (or a downstream agent reading the citation)
a mechanism the deterministic Concierge already has for free — a real
`href` to navigate to, not just prose. The LLM path should feel like
a superset of the deterministic path, not a different interaction
model.

## 3. Deterministic-router fallback

Three conditions route back to the deterministic Concierge
(`matchIntent`, `lib/concierge/intents.ts`) instead of returning an
LLM-generated answer:

1. **Retrieval confidence below threshold.** If the retrieval step
   can't find catalog content that clearly answers the question, the
   system does not let the LLM answer from its own knowledge — it
   falls through to `matchIntent`'s keyword scoring, and if that also
   comes up empty, the same honest `FALLBACK_MESSAGE` the
   deterministic Concierge already returns.
2. **The question matches a deterministic intent better than a
   retrieval-worthy question.** "Where's the pricing page" doesn't
   need an LLM — `matchIntent` already answers it instantly and for
   free. The router tries the deterministic match first, and only
   escalates to retrieval+LLM when no deterministic match clears its
   own threshold. This keeps the common case cheap and fast, and
   reserves the LLM budget (§4) for the queries that actually need it.
3. **The LLM call itself fails or times out.** Any provider error,
   rate limit, or timeout falls through to the deterministic
   fallback rather than surfacing an error to the user — the same
   principle as `docs/AGENT_INTERFACE.md`'s "never a silent fake":
   a broken LLM call degrading to a working deterministic answer is
   honest; a broken LLM call surfacing a raw error is not.

## 4. Abuse and cost model

- **Rate limits per session/IP**, at the Worker edge, mirroring the
  same per-IP rate-limiting posture `docs/AGENT_INTERFACE.md` §5
  already establishes for the read tools — generous enough for normal
  exploratory use, tight enough that a scripted loop can't run up an
  unbounded API bill.
- **Budget caps**, tracked server-side (a running spend counter against
  a configured ceiling, checked before each LLM call — implementation
  detail for W2-315, not fixed here). When the cap is reached, the
  system falls through to the deterministic Concierge for the rest of
  the budget period rather than continuing to spend past the operator-
  approved ceiling. This is the same fallback path as §3 — one
  fallback mechanism, multiple trigger conditions.
- **No per-user cost attribution at launch** — there's no signed-in
  session (per `docs/AGENT_INTERFACE.md` §5's no-auth-at-launch
  posture, until W2-317 lands), so budget tracking is aggregate, not
  per-user. Per-user budgets become possible once W2-317's auth
  exists; not a W2-315 launch requirement.
- **Prompt-injection posture**: retrieved catalog content is site-
  authored copy Ferrum OS controls, not third-party or user-submitted
  content, so the injection surface here is narrower than a general
  RAG system over untrusted documents. The user's own input is still
  treated as untrusted (never concatenated into a system prompt in a
  way that could override grounding instructions) — a concrete prompt
  structure is a W2-315 implementation decision, not fixed here.

## 5. What this document does not cover

- The specific LLM provider call shape, prompt template text, or
  retrieval implementation (embedding model, vector store vs. simple
  keyword+rerank) — W2-315 implementation decisions.
- Exact rate-limit numbers and budget-cap values — set when
  `ANTHROPIC_API_KEY` provisioning and operator budget approval
  actually happen (the two gates W2-315 is blocked on).
- Per-user budget tracking — deferred until W2-317's auth exists.
- Any capability beyond answering questions about Ferrum OS's own
  published catalog — this design does not extend the Concierge into
  general-purpose assistant territory.
