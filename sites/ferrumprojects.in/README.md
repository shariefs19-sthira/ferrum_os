# ferrumprojects.in — pre-incorporation holding page

Static, framework-free HTML/CSS artifact for the `ferrumprojects.in` sister
site. Not part of the `apps/web`/Ferrum OS pnpm workspace (`sites/*` is not
listed in `pnpm-workspace.yaml`'s `packages` globs) and not wired into any
build, deploy, or DNS configuration.

## What this is

A single static page (`index.html` + `styles.css`) that says the site is
being prepared and does not assert:

- that Ferrum Projects is an incorporated company,
- that any construction, PMC, RCC, structural-steel, or procurement service
  exists or is available,
- any pricing, coverage, licence, professional roster, client, capacity, or
  project-history claim.

`<meta name="robots" content="noindex, nofollow" />` is set so this page is
never indexed while it holds no real content.

## What this is NOT

- Not deployed. No hosting, DNS, or Cloudflare configuration was touched by
  this task.
- Not linked from any build pipeline — `apps/web`'s `pnpm build`/`wrangler
  deploy` do not read this directory.
- Not the final site. Real corporate/service content is deliberately withheld
  here until incorporation completes and a professional (CS/CA/lawyer)
  reviews and approves publication, per
  `docs/corporate/company-registration/COMPANY_SITE_SCOPE.md`.

## Next steps (post-incorporation, out of this task's scope)

1. Operator/CS supplies approved legal name, CIN, registered-office and
   statutory-disclosure text.
2. Content is reviewed against `docs/corporate/company-registration/
   COMPANY_SITE_SCOPE.md`'s publication controls (no unverified claim ships).
3. Domain DNS and hosting are configured separately — not part of this
   artifact or this task.
4. `noindex` is removed only once real, approved content replaces this
   holding page.
