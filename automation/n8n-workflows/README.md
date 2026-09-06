# W-74 INTEGRATE_N8N — workflow definitions

**License confirmation (this row's own blocking prerequisite, done
first, per its own text):** fetched the real Sustainable Use License
text directly from `n8n-io/n8n`'s repository (not a summary site or
the GitHub license-badge inference). Relevant clauses:

> "You may use or modify the software only for your own internal
> business purposes or for non-commercial or personal use."
>
> "You may distribute the software or provide it to others only if
> you do so free of charge for non-commercial purposes."

**Finding: self-hosting n8n for internal automation — KB/rate-refresh
jobs (W-60), fleet deploy alerts — is within the license's terms.**
None of these workflows resell n8n, expose it to third parties, or
build a competing commercial product on top of it; they are internal
business-purpose automation only. This clears the row's own gate to
proceed with workflow authoring.

## Status

Self-hosting the n8n instance itself is **not done in this pass**
("author the workflow definitions now, self-host later" — per the
operator's own explicit sequencing). The three JSON files here are
schema-correct against n8n's documented workflow-export format
(`n8n-nodes-base.scheduleTrigger`, `n8n-nodes-base.executeCommand`,
`n8n-nodes-base.httpRequest`, `n8n-nodes-base.if`) but **have not been
verified by an actual import into a running n8n instance** — none
exists yet to import into. Flagged honestly rather than claimed as
tested; re-verify on first real import.

## Workflows

- `kb-rate-refresh.json` — weekly: re-runs the real, already-existing
  live-fetch adapter test suites (`lib/knowledgeBase`, `lib/rateEngine`,
  `lib/tileSources` — every one of these actually re-fetches its real
  public source when run, per this session's own adapter-first
  discipline) via `pnpm --filter ./apps/web exec vitest run`, in the
  real repo checkout path. A non-zero exit (a source went offline, a
  page changed shape, a rate/clause value drifted) triggers an ntfy
  alert via the same `ntfy.sh/<topic>` HTTP pattern `FLEET_WATCH.ps1`
  already uses — this workflow does not invent a second alert channel.
- `deploy-alert-fanout.json` — a Webhook receiver `FLEET_WATCH.ps1`'s
  auto-deploy path (or any future deploy path) can POST a
  `{ sha, status, message }` payload to, fanning it out to ntfy. This
  is deliberately redundant with `FLEET_WATCH.ps1`'s own direct
  `Send-NtfyAlert` calls, not a replacement — n8n's role here is to be
  the one place additional alert channels get added later (email,
  Slack, etc.) without editing the PowerShell harness itself.
