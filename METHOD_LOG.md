# Method Log (All Tasks)

This document captures the methodology, reasoning, and outcomes for significant actions taken during development. It serves as a historical record for future developers and AI agents to understand the context behind decisions.

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