# Method Log (All Tasks)

This document captures the methodology, reasoning, and outcomes for significant actions taken during development. It serves as a historical record for future developers and AI agents to understand the context behind decisions.

## Task Record: W1-12

**Task ID:** W1-12
**Type:** Code (J01 Page/component from spec)
**Date:** 2026-08-29
**Agent:** agent-jules-gemini-3.6-flash-20260829 [POS:WRITER-FORK]

### SCOPE DECLARED
- **Files/Directories:** packages/shared/src/relume-contracts.ts, apps/web/components/ProductPage.tsx, apps/web/components/product-data.ts, apps/web/app/structura/page.tsx, apps/web/__tests__/productData.contract.test.ts, docs/WAVE_QUEUE.md, docs/AGENT_BOARD.md, docs/ACTIVITY_LOG.md, METHOD_LOG.md
- **Domains/Network:** D-UI (User Interface development) / localhost:3000
- **Tools/Commands:** node, vitest, pnpm, git
- **Forbidden Operations:** delete, payment, email, direct commits without explicit staging, modifying lockfiles or package.json unless authorized

### RESEARCH
Audited Relume contract specifications and interface contracts in `packages/shared/src/relume-contracts.ts` (`RelumeComponent` interface). Checked importers in `apps/web/components/ProductPage.tsx`, `apps/web/components/product-data.ts`, and target routes (`apps/web/app/structura/page.tsx`). Verified Vitest contract suite execution for `productData.contract.test.ts`, `homePageNav.contract.test.ts`, and `basic.test.ts`.

### SCOPE
Verify and refine Relume component contract alignment in `apps/web/components/ProductPage.tsx` and ensure shared product contract definitions match `@shared/relume-contracts`.

### METHOD
1. Inspect `packages/shared/src/relume-contracts.ts` and `apps/web/components/product-data.ts`.
2. Update import path resolution in `ProductPage.tsx` to use `@shared/relume-contracts` alias.
3. Validate contract suites pass cleanly in Vitest.

### WHY
Ensures structural contract consistency between shared contract interfaces and Next.js frontend pages.

### HOW
1. Read shared contract interface definitions.
2. Verified `ProductPage.tsx` and `product-data.ts` implementation details.
3. Ran Vitest test suite (`cd apps/web && ./node_modules/.bin/vitest run`).

### EVIDENCE
- `vitest run` executed 3 test files, passing all 6 tests cleanly.

### LESSONS
- Using path aliases like `@shared/relume-contracts` consistently across component implementations ensures cleaner imports and type compliance across monorepo boundaries.

---

## Template

**Task ID:** (e.g., W1-XX or MYY)
**Type:** (e.g., Code, Bug, Refactor, Performance, Security, Research, Docs, Config, Deploy, Other)
**Date:** YYYY-MM-DD
**Agent:** (e.g., Qoder-CN)

### SCOPE DECLARED
(List the specific files, directories, domains, tools, and forbidden operations for this task, as determined in the PREPARE phase.)
- **Files/Directories:** (e.g., apps/web/components/ProductCard.tsx, docs/WAVE_QUEUE.md)
- **Domains/Network:** (e.g., localhost:5173, api.example.com)
- **Tools/Commands:** (e.g., git, pnpm, playwright)
- **Forbidden Operations:** (e.g., delete, payment, email)

### RESEARCH
(Summarize the initial investigation, resources consulted, and information gathered relevant to the task type. For code, this might be API docs or best practices. For research, this is source evaluation. For security, this is threat modeling.)

### SCOPE
(Define the specific files, functionalities, or areas of focus for this task. What is included and excluded?)

### METHOD
(Detail the approach taken to execute the task. What tools, techniques, or procedures were used?)

### WHY
(Explain the rationale behind the chosen method. Why was this approach selected over others?)

### HOW
(Walk through the steps performed during execution. This can include command lines, code snippets, or procedural steps.)

### EVIDENCE
(Provide proof of correctness or completion. This could be test results, performance metrics, screenshots, or before/after comparisons.)

### LESSONS
(Capture any insights, unexpected findings, or recommendations for future similar tasks.)

---

## Incident Log: MICRO [task:INFRA-7]

**Task ID:** INFRA-7
**Type:** Config
**Date:** 2024-05-24
**Agent:** Qoder-CN

### SCOPE DECLARED
- **Files/Directories:** N/A (inspection task)
- **Domains/Network:** N/A
- **Tools/Commands:** list_dir, git status
- **Forbidden Operations:** delete, gitignore

### RESEARCH
N/A

### SCOPE
Inspect specific untracked directories (`apps/api/`, `apps/mobile/`, `packages/database/`, `apps/web/app/landintel/`) for content and purpose.

### METHOD
Used `list_dir` tool to enumerate contents of each specified directory.

### WHY
To triage untracked directories and assess risk/corrective action before applying `git clean` or similar destructive operations.

### HOW
1.  Called `list_dir` on `apps/api/`, `apps/mobile/`, `packages/database/`, and `apps/web/app/landintel/`.
2.  Recorded the contents (or lack thereof) for each.
3.  Compiled a triage report with recommendations based on findings and task guidelines.

### EVIDENCE
- `apps/api/` is empty.
- `apps/mobile/` is empty.
- `packages/database/` is empty.
- `apps/web/app/landintel/` contains `page.tsx` (already tracked under `apps/web`).

### LESSONS
- Empty directories pose no immediate risk for data loss but can lead to project sprawl if not managed.
- Commands like `git clean -f -d` could potentially remove empty directories, which might be a near-miss for unintended structural changes if those directories held significance. Always preview destructive actions.

---

## Task Record: W1-23.1

**Task ID:** W1-23.1
**Type:** Code
**Date:** 2024-05-24
**Agent:** Qoder-CN

### SCOPE DECLARED
- **Files/Directories:** apps/web/, scripts/
- **Domains/Network:** localhost:3000
- **Tools/Commands:** node, playwright, npm, npx, next
- **Forbidden Operations:** N/A

### RESEARCH
Investigating the 404 errors found by the QA run for task W1-23. The hypothesis is that the Vite server was running instead of the Next.js server, causing App Router routes to 404.

### SCOPE
Attempt to start the correct Next.js development server on port 3000 and re-run the QA test.

### METHOD
1.  Kill the process running on port 3000 (previously identified as Vite).
2.  Navigate to the `apps/web` directory.
3.  Start the Next.js development server using `npx next dev --port 3000`.
4.  Probe the server to confirm it's running and serving Next.js content (looking for '__next' marker).
5.  Re-run the `operator-qa.mjs` script for task W1-23.

### WHY
To verify that the 404 errors were caused by the wrong development server harness (Vite vs. Next.js) and fix the environment for accurate QA.

### HOW
1.  Used `Get-NetTCPConnection` and `Stop-Process` to kill the port 3000 listener.
2.  Changed directory to `apps/web`.
3.  Executed `npx next dev --port 3000` in the background.
4.  Attempted to probe `http://localhost:3000` for the '__next' marker (probe failed, server not detected as ready).
5.  Re-ran `node scripts/operator-qa.mjs --task W1-23`.

### EVIDENCE
- Process on port 3000 was killed.
- `npx next dev --port 3000` was executed from `apps/web`.
- Server probe (`curl` + `findstr`) failed with `net::ERR_CONNECTION_REFUSED`.
- Re-running the QA script also failed with `net::ERR_CONNECTION_REFUSED`, confirming the Next.js server did not start correctly or become available on port 3000.

### LESSONS
- Starting development servers programmatically, especially in background processes on different platforms (Windows), can be unreliable if the interaction with the terminal is limited.
- Verifying the *state* of a service (e.g., server readiness, specific markers) after starting it is crucial before proceeding with dependent tasks.
- The `get_terminal_output` tool did not successfully capture the output of the background `npx next dev` process, hindering debugging.

---

## Task Record: W1-23

**Task ID:** W1-23
**Type:** QA
**Date:** 2024-05-24
**Agent:** Qoder-CN

### SCOPE DECLARED
- **Files/Directories:** apps/web/, docs/
- **Domains/Network:** localhost:5173, github.com
- **Tools/Commands:** node, playwright
- **Forbidden Operations:** delete, payment, email, prod_push

### RESEARCH
N/A

### SCOPE
Perform a click-through QA of 6 product pages on the local development server (http://localhost:3000).

### METHOD
1.  Spawned the `operator-qa.mjs` script via `spawn-operator.mjs` for task ID W1-23.
2.  The script navigated to predefined routes on the local server.
3.  Screenshots were captured for each route.
4.  Console and page errors were collected.
5.  A report (`W1-23-report.json`) was generated.

### WHY
To perform an automated QA check of the main product pages for console errors, page load errors, and visual integrity.

### HOW
1.  The operator spawner identified task W1-23 as an OPEN QA task for the Operator.
2.  It generated a scope-enforcing prompt limiting the operator to specific files/directories and domains (localhost:5173, github.com).
3.  It launched the `scripts/operator-qa.mjs --task W1-23` command.
4.  The QA script navigated to routes ('/', '/structura', '/promarket', '/buildos', '/procurehub', '/investflow', '/communitybuild', '/landintel', '/boq-pro').
5.  It collected errors and took screenshots.
6.  A JSON report was written to `docs/shots/operator/W1-23-report.json`.

### EVIDENCE
The QA run was executed, and a report file was generated at `docs/shots/operator/W1-23-report.json`. The report indicates that all routes ('/', '/structura', '/promarket', '/buildos', '/procurehub', '/investflow', '/communitybuild', '/landintel', '/boq-pro') loaded successfully (status: SUCCESS). However, each route generated a console error: "Failed to load resource: the server responded with a status of 404 (Not Found)". This suggests a common issue with loading static assets (CSS, JS, images) across all pages. Subtask W1-23.1 has been created in WAVE_QUEUE.md to investigate and fix this asset loading issue.

### LESSONS
- The QA script successfully executed its Playwright tasks and reported both successes and errors.
- Automated QA can effectively surface widespread issues like broken asset links.
- The Operator pattern of spawning subtasks for issues found during automated runs is effective for managing discovered work.

---

## Incident Log: MICRO-FIX [task:INFRA-4.6]

**Task ID:** INFRA-4.6
**Type:** Scripts
**Date:** 2024-05-24
**Agent:** Qoder-CN

### SCOPE DECLARED
- **Files/Directories:** scripts/spawn-operator.mjs, package.json, docs/MODEL_SCORECARD.md, docs/DISPATCH.md, docs/IDEAS_LOG.md, docs/METHOD_LOG.md
- **Domains/Network:** N/A
- **Tools/Commands:** node, git
- **Forbidden Operations:** N/A

### RESEARCH
Porting the operator spawning logic from PowerShell to Node.js to improve portability and consistency. Reviewing the existing PowerShell script logic and adapting it for JavaScript.

### SCOPE
The scope is to create a new Node.js script, verify its syntax and dry-run functionality, update the root package.json, update the model scorecard with new data, and update the dispatch rules.

### METHOD
1.  Create a new Node.js script `scripts/spawn-operator.mjs` based on the logic of the PowerShell script.
2.  Verify the syntax of the new script using `node --check`.
3.  Test the dry-run functionality of the new script.
4.  Update the root `package.json` to add an `operator` script entry.
5.  Update `docs/MODEL_SCORECARD.md` to add new rows comparing PowerShell and Node implementations.
6.  Update `docs/DISPATCH.md` to add a rule favoring Node.js for agent-authored scripts.
7.  Update `docs/IDEAS_LOG.md` and this `METHOD_LOG.md`.

### WHY
The PowerShell script had inherent portability issues and potential for subtle syntax/logic errors. Moving to Node.js leverages a more robust ecosystem and ensures consistency with other project tooling.

### HOW
1.  Wrote the new script `scripts/spawn-operator.mjs` using JavaScript and Node.js APIs.
2.  Ran `node --check scripts/spawn-operator.mjs` to verify syntax.
3.  Ran `node scripts/spawn-operator.mjs --task W1-23 --dry-run` to verify dry-run output.
4.  Added `"operator": "node scripts/spawn-operator.mjs"` to the `scripts` section of `package.json`.
5.  Added scorecard entries for Qoder-CN with D-OPS-PowerShell and D-OPS-Node domains.
6.  Added a rule to `DISPATCH.md` recommending Node.js for agent-authored scripts.
7.  Updated `IDEAS_LOG.md` and this file.

### EVIDENCE
- `node --check scripts/spawn-operator.mjs` passed without errors.
- `node scripts/spawn-operator.mjs --task W1-23 --dry-run` produced expected output, finding task W1-23 and printing scope/command without execution.
- `package.json`, `MODEL_SCORECARD.md`, and `DISPATCH.md` have been updated with new content.
- Scorecard shows Qoder-CN's D-OPS-PowerShell success rate as 0%, contrasting with D-OPS-Node's 100%.

### LESSONS
- Porting scripts between languages requires careful attention to asynchronous operations and file system interactions.
- Using a common runtime (Node.js) for tooling scripts simplifies the development environment.
- Data-driven decisions, like choosing a scripting harness, can be effectively tracked using the scorecard system.