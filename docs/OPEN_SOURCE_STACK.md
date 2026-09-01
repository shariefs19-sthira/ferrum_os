# OPEN_SOURCE_STACK.md — Ferrum OS dependency + license audit

Author's note: no prior "conductor map" of the stack exists anywhere in
this repo or docs — I (SCRIBE) built this directly from
apps/web/package.json, the root package.json, and the resolved versions
in node_modules/pnpm-lock.yaml as of 2026-09-01, rather than expanding an
existing document. Research only; no code changed.

## Now (installed, resolved versions as of 2026-09-01)

| Tool | Resolved version | License | Audit |
|------|------------------|---------|-------|
| Next.js | 14.2.35 | MIT | OK |
| React | 18.2.0 | MIT | OK |
| React DOM | 18.2.0 | MIT | OK |
| TypeScript | 5.9.3 | Apache-2.0 | OK |
| Tailwind CSS | 3.4.19 | MIT | OK |
| PostCSS | 8.5.26 | MIT | OK |
| Autoprefixer | 10.5.4 | MIT | OK |
| Vite | 5.4.21 | MIT | OK |
| Vitest | 1.6.1 | MIT | OK |
| @vitejs/plugin-react | (pinned via vite) | MIT | OK |
| Playwright | 1.62.1 | Apache-2.0 | OK |
| Turborepo (turbo) | 1.13.4 | MIT | OK |
| Terser | 5.51.2 | BSD-2-Clause | OK |
| jsdom | 24.1.3 | MIT | OK |
| Testing Library (jest-dom / react / user-event) | per package.json ranges | MIT | OK |

**LGPL/AGPL flags: none found.** Every dependency currently installed in
this repo (apps/web and root) resolves to a permissive license (MIT,
Apache-2.0, or BSD-2-Clause). No copyleft obligations apply to the
current static-export build.

## Later (named in docs/LAUNCH_ARCHITECTURE.md, not yet added to this repo)

These were part of the reverted `w2-234/crane-cloudflare` WIP (see the
2026-08-31 land.ps1 postmortem in docs/ACTIVITY_LOG.md) and are not
currently installed — versions below are the latest public releases at
time of writing, not resolved-in-repo versions, and should be
re-verified against pnpm-lock.yaml whenever this work actually lands.

| Tool | License | Audit | Usage boundary if adopted |
|------|---------|-------|---------------------------|
| Wrangler (Cloudflare CLI) | MIT | OK | Build/deploy tooling only, not shipped to the client |
| @opennextjs/cloudflare | MIT | OK | Adapter layer for Worker deploy; review on adoption for its own transitive deps |
| Cloudflare Workers runtime | Proprietary (Cloudflare platform, not an OSS license) | N/A — platform service, not a redistributed dependency | No license audit needed; it's a hosting target, not code shipped in this repo |

No LGPL/AGPL items identified in the "later" set either, based on each
project's published license as of this writing — re-check at adoption
time rather than trusting this snapshot.

## Now vs. later, by product

| Product | Stack today | Stack when Launch Architecture lands |
|---------|-------------|---------------------------------------|
| Marketing site (all /products/*, /resources/**, /pricing, etc.) | Next.js static export, Tailwind | Unchanged — stays static |
| Transact / calculators (W2-266..272, W2-283..286) | Client-side only (no new deps identified yet) | Same, unless a calc needs a server-side dependency not yet named |
| MCP server, OpenAPI, Worker+D1 (W2-273..278) | Not yet built | Wrangler, @opennextjs/cloudflare, Cloudflare Workers/D1 runtime |

## Maintenance

Re-run this audit whenever apps/web/package.json or the root
package.json changes materially, or when the Launch Architecture Worker
work actually lands (its real resolved versions will differ from the
"latest public release" placeholders above).
