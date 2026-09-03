# W2-375 typography second-pass evidence

This evidence is supplied for conductor/ATLAS review; it is not a self-certification.

## Scope and method

- Playwright crawled all 87 routable `apps/web/app/**/page.tsx` paths at 1440x900. Underscore-prefixed source templates are excluded because Next does not expose them as routes.
- `/`, `/products/landintel`, `/resources`, and `/resources/tools` were captured at 1920x1080, 1440x900, 1366x768, 1280x800, 1024x768, 768x1024, and 375x812.
- The audit checks document overflow, horizontally clipped text, narrow wrapped links/labels, short orphan heading lines, footer tagline line count/measure, and the open mobile menu at 768 and 375.
- `before/audit.json` and `after/audit.json` are machine-readable. PNG names use `<route>-<viewport>.png`; the home route also includes open-menu captures at 768 and 375.

## Before / after

| Viewport | Before | After |
| --- | --- | --- |
| 1920, 1440, 1366, 1280 | Footer tagline: 4 lines, 19.2ch measure | Footer tagline: 2 lines, 39.9ch measure |
| 1024 | Footer tagline: 4 lines, 18.1ch measure | Footer tagline: 2 lines, 48ch measure; home hero uses a full-width composition |
| 768 | Desktop header text collided; resource/pricing links and figures wrapped in narrow three-column cards; footer tagline: 4 lines | Tablet hamburger active; open panel is 320px with zero wrapped links; content grids use two columns; footer tagline: 2 lines, 48ch |
| 375 | Base layout had no document overflow; footer tagline was already 2 lines | Base layout remains overflow-free; open panel is 343px with zero wrapped links; footer tagline remains 2 lines |
| All 87 routes at 1440 | Footer defect repeated globally | 0 horizontal overflows, 0 wrapped links, 0 cramped labels, 0 orphan headings, 0 horizontally clipped text |

Four console resource errors in the local 1440 crawl are the expected `/api/auth/session` 404s on unauthenticated account/workspace pages under `next dev`, where the Cloudflare Worker API is not attached. They are retained in the JSON rather than hidden and are outside this typography-only row.
