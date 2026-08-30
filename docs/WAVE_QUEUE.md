# Wave Queue

## Dormant Seats
> **DORMANT SEATS (do not assign until conductor unlocks):**
> - **Claude Code**: login pending ETA ~48h; unlock = one-bit confirm.

## Rollup Rule
A task's status is considered DONE only if its own status is DONE AND all of its spawned subtasks (children) are also marked as DONE. The batch conductor verifies this recursively.

## Batch Status
| Batch | Status |
|-------|--------|
| B1    | DONE   |
| B1-E  | DONE   |
| B2    | DONE   |
| B3    | CLOSED |

## WAVE-1

| Task ID | Parent | Batch | J/Domain | Assigned To | Status | Est. Duration |
|---------|--------|-------|----------|-------------|--------|---------------|
| W1-01   |        | B1    | J06      | Qoder-CN    | DONE   | 4 hrs         |
| W1-02   |        | B1    | J06      | Qoder-CN    | DONE   | 3 hrs         |
| W1-04   |        | B1    | J15      | Qoder-CN    | DONE   | 2 hrs         |
| W1-07   |        | B1    | J04      | Jules-Owner-B | DONE   | 5 hrs         |
| W1-13   |        | B1    | J15      | Jules-Owner-B | DONE   | 4 hrs         |
| W1-08   |        | B1    | J07      | Jules-Fork-A  | DONE   | 2 hrs         |
| W1-11   |        | B1-E  | J13      | Cline-GLM-Flash | DONE-evidenced   | 1 hr          |
| W1-21   |        | B1    | J16/D-RES| Scout (seat-unfilled) | DONE   | 8 hrs         |
| W1-22   |        | B1    | J16/D-RES| Scout (seat-unfilled) | DONE   | 8 hrs         |
| W1-18   |        | B1-E  | J08      | Cline-GLM-Flash | DONE   | 1 hr          |
| W1-20   |        | B1-E  | J13      | Cline-GLM-Flash | DONE   | 1 hr          |
| W1-03   |        | B2    | J10      | Qoder-CN    | OPEN   | 6 hrs         |
| W1-05   |        | B2    | J15      | Qoder-CN    | OPEN   | 2 hrs         |
| W1-06   |        | B2    | J15      | Qoder-CN    | OPEN   | 2 hrs         |
| W1-12   |        | B2    | J01      | Jules-Fork-A  | OPEN   | 3 hrs         |
| W1-15   |        | B2    | J07      | Jules-Fork-A  | OPEN   | 2 hrs         |
| W1-14   |        | B2    | J14      | Jules-Owner-B | PARKED   | 8 hrs         |
| W1-09   |        | B3    | J09      | (to be assigned) | OPEN   | 10 hrs        |
| W1-10   |        | B3    | J12      | (to be assigned) | OPEN   | 10 hrs        |
| W1-16   |        | B3    | J02      | (to be assigned) | OPEN   | 4 hrs         |
| W1-17   |        | B3    | J11      | (to be assigned) | DONE   | 3 hrs         |
| W1-19   |        | B3    | J15      | (to be assigned) | OPEN   | 2 hrs         |
| W1-23   |        | B2    | J03      | Operator    | OPEN   | 4 hrs         |
| W1-23.1 | W1-23  | B2    | J01      | Qoder-CN    | OPEN   | 2 hrs         |
| W1-24   |        | B2    | J08      | Operator    | OPEN   | 2 hrs         |
| W1-25   |        | B2    | J16/D-RES| Scout       | OPEN   | 6 hrs         |

## WAVE-2

| Task ID | Parent | Batch | J/Domain | Assigned To | Status | Land SHA | Notes |
|---------|--------|-------|----------|-------------|--------|----------|-------|
| W2-04   |        | B2    | J10      | Copilot     | DONE   | 4034607  | homepage Relume rebuild |
| W2-05   |        | B2    | J09      | Copilot     | DONE   | 06dd7e1  | LandIntel Relume features section |
| W2-06   |        | B2    | J08      | Copilot     | DONE   | f369f40  | IS Code Guides page |
| W2-07   |        | B2    | J08      | Cline-GLM-Flash | DONE   | 148eed8  | branded 404 + loading skeleton |
| W2-08   |        | B2    | J08      | Copilot     | DONE   | 2449e45  | blog + case-studies stubs |
| W2-09   |        | B2    | J08      | Cline-GLM-Flash | DONE   | 682c018  | robots + sitemap |
| W2-10   |        | B2    | J08      | Copilot     | DONE   | 6d15693  | footer component + layout render |
| W2-11   |        | B2    | J08      | Cline-GLM-Flash | DONE   | f6d0842  | web manifest |
| W2-12   |        | B2    | J08      | Cline-GLM-Flash | DONE   | 60c6746  | static pricing page |
| W2-13   |        | B2    | J08      | Copilot     | DONE   | N/A      | docs catchup |
| W2-14   |        | B2    | J08      | Copilot     | DONE   | N/A      | get started page |
| W2-15   |        | B2    | J08      | Qoder-CN    | DONE   | N/A      | fix documentation page |
| W2-16   |        | B2    | J08      | Copilot     | DONE   | N/A      | get started page |
| W2-17   |        | B2    | J08      | Qoder-CN    | DONE   | N/A      | demo page |
| W2-18   |        | B2    | J08      | Qoder-CN    | DONE   | N/A      | login page |
| W2-19   |        | B2    | J08      | Qoder-CN    | DONE   | N/A      | signup page |
| W2-20   |        | B2    | J08      | Qoder-CN    | DONE   | N/A      | structura page |
| W2-21   |        | B2    | J08      | Qoder-CN    | DONE   | N/A      | worktree merge |
| W2-22   |        | B2    | J08      | Qoder-CN    | DONE   | 980cd74  | copilot buildos |
| W2-23   |        | B2    | J08      | Qoder-CN    | DONE   | c8d3bf6  | cline layouts |
| W2-24   |        | B2    | J08      | Qoder-CN    | DONE   | 0a58b81  | cline legal |
| W2-25   |        | B2    | J08      | Qoder-CN    | DONE   | 4913df7  | cline layouts2 |
| W2-26   |        | B2    | J08      | Qoder-CN    | DONE   | d0ee60e  | copilot investflow |
| W2-27   |        | B2    | J08      | Qoder-CN    | DONE   | 86caff7  | cline layouts3 |
| W2-28   |        | B2    | J08      | Qoder-CN    | DONE   | c3f4eab  | copilot promarket |
| W2-29   |        | B2    | J08      | Qoder-CN    | DONE   | N/A      | cline layouts4 |
| W2-30   |        | B2    | J08      | Qoder-CN    | DONE   | f2baa00  | copilot designstudio |
| W2-31   |        | B2    | J08      | Qoder-CN    | DONE   | N/A      | cline layouts (duplicate) |
| W2-32   |        | B2    | J08      | Qoder-CN    | DONE   | N/A      | favicon and layout |
| W2-33   |        | B2    | J08      | Qoder-CN    | DONE   | N/A      | copilot procurehub |
| W2-34   |        | B2    | J08      | Qoder-CN    | DONE   | N/A      | cline layouts6 |
| W2-35   |        | B2    | J08      | Qoder-CN    | DONE   | N/A      | copilot communitybuild |
| W2-36   |        | B2    | J08      | Qoder-CN    | DONE   | N/A      | cline blog |
| W2-37   |        | B2    | J08      | Cline-GLM-Flash | DONE   | c97fb43  | Qoder-CN touched: home content polish |
| W2-38   |        | B2    | J08      | Cline-GLM-Flash | DONE   | e79d23a  | 3 case study stubs |
| W2-39   |        | B2    | J08      | Cline-GLM-Flash | DONE   | c97fb43  | Qoder-CN copilot sweep3 |
| W2-40   |        | B2    | J08      | Copilot     | DONE   | 60956f7  | MobileMenu component |
| W2-41   |        | B2    | J08      | Cline-GLM-Flash | DONE   | 0cf6b8c  | resources layouts (resources/blog + resources/case-studies parents) |
| W2-42   |        | B2    | J08      | Copilot     | DONE   | 085f12b  | content links (cross-link articles and products) |
| W2-43   |        | B2    | J08      | Cline-GLM-Flash | DONE   | c4c3d7c  | get-started/demo/contact layouts |
| W2-44   |        | B2    | J08      | Cline-GLM-Flash | DONE   | 47cc602  | login/signup/privacy/terms layouts |
| W2-45   |        | B2    | J08      | Copilot     | DONE   | 2fc64d3  | JSON-LD SEO |
| W2-46   |        | B2    | J08      | Cline-GLM-Flash | DONE   | 76c7084  | 3 blog article layouts |
| W2-48   |        | B2    | J08      | Copilot     | DROPPED | N/A      | header to layout refactor — superseded by W2-40 MobileMenu (conflicts on land) |
| W2-49   |        | B2    | J08      | Cline-GLM-Flash | DONE   | 1354754  | demo + get-started layout metadata refinement |
| W2-50   |        | B2    | J08      | Cline-GLM-Flash | DONE   | N/A      | buildos + designstudio layouts (closeout) |
| W2-51   |        | B2    | J08      | Cline-GLM-Flash | DONE   | 5ae954e  | sitemap 6 article routes |
| W2-52   |        | B2    | J08      | Copilot     | DONE   | 98838b2  | homepage FAQ section |
| W2-53   |        | B2    | J08      | Cline-GLM-Flash (LANDER) | DONE   | b1f9738  | component-class homepage highlight block |
| W2-54   |        | B2    | J08      | Cline-GLM-Flash | DONE   | 2ca6c04  | case-study subpage layouts (greenfield / self-build / contractor) — superseded by W2-61 |
| W2-61   |        | B2    | J08      | Cline-GLM-Flash | DONE   | 2ca6c04  | case-study article layouts (greenfield-developer / self-build-family / contractor-fleet layout.tsx) — landed via W2-54 cherry-pick |
| W2-66   |        | B2    | J08      | Cline-GLM-Flash | DONE   | 5ec695b  | 4th blog article resources/blog/advanced-ulpin (h1+3 sections) — landed on main |
| W2-67   |        | B2    | J08      | Cline-GLM-Flash | DONE   | b02d1c9  | 4th case-study resources/case-studies/infrastructure-contractor (challenge/approach/outcome) — cherry-picked a6b113f to main |
| W2-69   |        | B2    | J08      | Cline-GLM-Flash (LANDER) | DONE | b9241aa | surgical cherry-pick: ProductSpecs.tsx + TestimonialStrip.tsx (other 4 files in branch commit already in main richer) |
| W2-70   |        | B2    | J08      | Cline-GLM-Flash (LANDER) | DONE | b9241aa | TestimonialStrip.tsx — bundled with W2-69 surgical cherry-pick |
| W2-75   |        | B2    | J08      | Cline-GLM-Flash (LANDER) | DONE | d062bda | docs: AGENT_BOARD roster refresh (Qwen-Web conductor, Cline-A/B, Continue, Claude Code DORMANT) |
| W2-78   |        | B2    | J08      | Cline-GLM-Flash | DONE   | 28d099e  | structura/page.tsx — static beam-size quick-lookup table (IS 456, 6 spans) |
| W2-83   |        | B2    | J08      | Cline-GLM-Flash | DONE   | d0d4373  | documentation/page.tsx — "Getting started" section (1) IS-Code guides (2) Blog (3) Case studies |