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

## Incident Log: MICRO-FIX [task:INFRA-4.3]

**Task ID:** INFRA-4.3
**Type:** Scripts
**Date:** 2024-05-24
**Agent:** Qoder-CN

### SCOPE DECLARED
- **Files/Directories:** scripts/spawn-operator.ps1
- **Domains/Network:** N/A
- **Tools/Commands:** PowerShell
- **Forbidden Operations:** N/A

### RESEARCH
Reviewing the `spawn-operator.ps1` script for adherence to scope control rules and correctness of process ID handling.

### SCOPE
Editing the PowerShell script `scripts/spawn-operator.ps1` to fix variable naming and dry-run logic.

### METHOD
1.  Identified incorrect use of automatic variable `$PID` in the script. This is read-only and should not be assigned.
2.  Renamed the variable used to capture the job ID to `$opPid`.
3.  Ensured the `-DryRun` switch exits the script before any process is launched or any file is written.
4.  Verified the `Update-AgentBoard` function uses the correct variable (`$opPid`).

### WHY
The original script incorrectly tried to assign to the automatic read-only variable `$PID`, which would cause an error. The dry-run mode did not properly prevent side effects like launching a process or writing to the board, leading to false positives in testing.

### HOW
1.  Opened `scripts/spawn-operator.ps1`.
2.  Replaced all instances of `$pid` (the variable) with `$opPid`.
3.  Added a conditional block `if ($DryRun)` that prints diagnostic information and then calls `exit 0` before any launch or write operations.
4.  Confirmed the `Update-AgentBoard` function call uses `$opPid`.

### EVIDENCE
- Scope prompt generated correctly during dry-run.
- Two instances of incorrect `$pid` usage identified and fixed.
- Dry-run mode now correctly exits without launching a process or writing to the board.
- Real-run path correctly captures job ID into `$opPid` and passes it to `Update-AgentBoard`.

### LESSONS
- Always verify that dry-run flags completely prevent all side effects (launching processes, writing files).
- Be cautious with PowerShell automatic variables like `$PID`, `$HOST`, `$ERROR`, etc. They are reserved and often read-only. Prefer explicitly named variables (e.g., `$processId`, `$opPid`).