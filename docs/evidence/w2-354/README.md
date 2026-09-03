# W2-354 responsive matrix

Playwright audited the production static export across every routable `page.tsx` surface. Private underscore folders and dynamic route templates are excluded from the route inventory because they do not emit deployable pages.

## Re-crawl result

| Viewport | Routes | Responsive violations |
| --- | ---: | ---: |
| 375 × 667 | 87 | 0 |
| 390 × 844 | 87 | 0 |
| 768 × 1024 | 87 | 0 |
| 1024 × 768 | 87 | 0 |
| 1366 × 768 | 87 | 0 |
| 1920 × 1080 | 87 | 0 |
| 844 × 390 (landscape phone) | 87 | 0 |
| **Total** | **609 combinations** | **0** |

Checks cover HTTP status, viewport metadata, horizontal document overflow, clipped controls/media, 44px touch targets, table overflow containment, text below 10px, footer clipping, desktop/mobile navigation behavior, Escape close and focus return, and visible controls on product tools.

## First-pass findings and resolution

| Element | Was | Now |
| --- | --- | --- |
| Home step selector | 8 × 44px dot button | 44 × 44px hit area with the 8px dot retained inside |
| `/boq-pro` compact inputs | 28–35 × 44px | Global form-control floor is 44 × 44px; no protected BOQ path edited |
| Partner application CTAs | 36px high | 44px minimum height |
| LandIntel Leaflet zoom controls | 30 × 30px | 44 × 44px |
| LandIntel map marker target | 25 × 41px | 44 × 44px minimum target with artwork contained |
| LandIntel hero at 768px | ULPIN/map tool forced its grid track 13px beyond the viewport | Hero and tool grid tracks can shrink without clipping |
| CommunityBuild status control at 375/390px | Project ID and action shared one unshrinkable row, overflowing by 17px/2px | Controls stack below 640px and retain a 44px target floor |
| Resource tool card links | Link text box appeared undersized to the first detector | Confirmed whole-card pseudo-element hit area; detector now recognises the existing expanded target |
| ProcureHub roadmap page | No calculator control | Not a responsive violation; W2-354 does not create product functionality |

## Static-server diagnostics

The report retains 14 console messages: `/account` and `/project-workspace` request the Worker-owned `/api/auth/session` route at each of seven viewports, which a plain static file server cannot provide. `/project-workspace` consequently records seven JSON parse errors. These are not suppressed in `after.json`; they are kept separate from responsive findings and require edge/Worker verification under the relevant auth task.

## Evidence

- `after.json` — all 609 route/viewport records and measurements.
- `screenshots/` — every required viewport on home plus all ten product first viewports at 375px (17 PNGs).
- `scripts/w2-354-responsive-audit.mjs` — reproducible audit harness.

The harness declares reduced-data mode in its isolated headless context so
Next.js does not prefetch every linked route during a route-by-route crawl.
This preserves rendered-page behavior while preventing prefetch traffic from
exhausting local test-server sockets; console evidence therefore contains only
the Worker-owned API diagnostics described above.
