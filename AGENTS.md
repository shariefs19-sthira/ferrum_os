# Ferrum OS Agent Operating Rules (AGENTS.md)

## Rules
1.  **DO NO HARM**: Never modify `apps/api/` or any part of the system managing customer funds, user authentication, or financial transactions.
2.  **MAXIMIZE RESULTS**: Prioritize completing assigned tasks and achieving goals over stopping to ask for clarification. Use best judgment and proceed.
3.  **END-TO-END COMPLETION**: Complete multi-step tasks within a single session. Execute all phases of a task before reporting completion.
4.  **REPORT HASHES**: After any `git push`, report the commit hash and, if applicable, the status of subsequent CI jobs.
5.  **MINIMAL COMMUNICATION**: Provide concise, direct responses. Avoid verbose explanations unless specifically requested. Use bullet points and headers for clarity.
6.  **EXPLICIT STAGING**: Make explicit `git add` and `git commit` calls for each logical change group. Use descriptive commit messages in imperative mood.
7.  **ACTIVITY LOGGING**: Log major completed tasks in `docs/ACTIVITY_LOG.md` by appending a line: `* YYYY-MM-DD: Brief description (By: Your Name/Nickname)`
8.  **STAGING OVER BRANCHING**: Favor explicit staging and direct pushes to `main` over creating and managing feature branches.
9.  **CONTRACT OVER UI TESTING**: When UI tests prove difficult due to environment setup, prioritize contract tests that verify data structures and business logic.
10. NON-INTERACTIVE GIT: every git command runs non-interactive. Commits always with -m; pulls rely on pull.rebase (or --rebase --no-edit); merges only with --no-edit; rebase onto origin/main immediately before every push. If any editor, pager, or prompt ever appears, abort with Ctrl+C and re-run non-interactively.
11. HUMAN-APPROVED: Certain critical changes require explicit human authorization before execution. Look for 'HUMAN-APPROVED' in the instructions.
12. HISTORY SCRUBS: When restoring files or reverting changes, restore the file content without rewriting the Git history (e.g., do not use `git reset` or `git rebase -i` to alter history). Use `git checkout HEAD~N -- <file>` or restore from a backup if necessary.
13. COST ROUTING: work is assigned by J-type to the cheapest sufficient tier; agents must not claim tasks above their tier; pay-HIGH slots are J06/J09/J10/J14.
14. IDEAS OBLIGATION: any agent that discovers a workflow improvement appends to docs/IDEAS_LOG.md (never edits WORKFLOW.md); humans promote.
15. WAVE DISCIPLINE: an agent works only its pulled task; scope = the labeled file set; exceeding it fails Danger.
16. HEARTBEAT: every assigned agent updates docs/AGENT_BOARD.md on: task pull, each commit, entering gate-wait, completion, and any wait >15 min (status BLOCKED + reason). Silence >30 min = IDLE; human returns the task to the labeled queue.
17. DISCUSSION CAPTURE: any workflow/security/process insight from a human-agent conversation is appended to docs/IDEAS_LOG.md (or the owning doc) before session end. No valuable discussion dies in chat history.
18. REGISTRY: no AI commits before registering (unique handle + position + tier). Every commit: [AI: handle]; every log: **By:** handle [POS:tag]. Exit = update row (status, stats, reason). Unexpected death = monitor flags, human marks EXITED-UNEXPECTED.
19. TASK TAGS: every commit includes [task:<id>] from docs/WAVE_QUEUE.md; fleet-status auto-updates queue + board from tags; manual board edits only for BLOCKED/IDLE.
20. STANDARDS CADENCE: sweeps at every wave boundary + monthly deep; BEFORE step includes modernity check vs radar; PR descriptions cite standards implemented; Group B rejects PRs lacking citations for J01/J03/J04/J10/J12 jobs.
24. UNIVERSAL TASK STRUCTURE: every task follows BEFORE → PREPARE → EXECUTE → LOG.
- BEFORE: environment preflight (existing)
- PREPARE: task-type-appropriate preparation:
  * Code tasks: research current best practice (radar + standards + web)
  * Bug/review tasks: define coverage plan (boundary + lenses + methods)
  * Refactor tasks: capture current behavior baseline (tests, snapshots, metrics)
  * Performance tasks: measure current state (Lighthouse, bundle, runtime)
  * Security tasks: threat model + attack surface mapping
  * Research tasks: source evaluation + knowledge gap analysis
  * Docs tasks: audience + intent + existing coverage audit
  * Config tasks: current state dump + desired diff
  * Deploy tasks: rollback plan + validation criteria
  * Any other: agent defines appropriate prep and logs it
- EXECUTE: work within self-declared scope (no scope creep without queue return)
- LOG: METHOD record (why + how + evidence + lessons) for every task
25. DISPATCH: model selection belongs to [POS:DISPATCHER], not humans or agents; every assignment cites INTERNAL (registry stats per domain) + EXTERNAL (dated benchmarks/pricing/community); agents pull only dispatcher-tagged tasks; human veto window 24h.
26. PROPHECY: [POS:PROPHET] reads fleet/CI/method/assignment data, emits dated prophecies; dispatcher advisory input; credibility ladder 50-start, HIT+5/PARTIAL+2/MISS-4; >70 = dispatcher must respond; >85 = mandatory gate on HIGH tasks.
27. BATCH RELEASE: agents work only OPEN-batch tasks; batches open only via conductor verification; preflight pulls the queue; HUMAN-HOLD flag freezes releases.

## UNIVERSAL ONBOARDING (any model, any vendor, any capability)
1. Read this file fully. Every rule applies to every AI agent regardless of vendor.
2. Declare capabilities in your first ACTIVITY_LOG entry (Danger will check):
   T1: shell on a persistent checkout? T2: push branches / open PRs? T3: isolated sandbox (not the human's machine)? T4: web/API access? T5: UI inspection (browser/screenshots)?
3. Your tier = highest permission you may exercise (ROLES.md). Never exceed it; the first PR's shape verifies your claim.
4. Pick a stable handle "agent-<vendor>-<model>-<YYYYMMDD>"; use it in every commit tag [AI: handle] and log **By:** handle.
5. Commit to a file scope BEFORE writing; never exceed it.
6. Missing capability = delegate that step to human or infrastructure; never fake it.

## CAPABILITY TIERS -> PERMISSIONS
- S  (T1+T2): branch writer; lands via PR; all gates.
- S+ (T1+T2+T3): sandboxed writer; eligible for risky missions (upgrades, migrations).
- A  (T1 only): local writer; main-tree commits ONLY if human designates you PRIMARY WRITER; otherwise worktree/branch.
- B  (no T1, T2 via API): patch submitter; max 3 files; clean-branch PR.
- C  (read-only): reviewer/advisor; may comment, never merge.

## MODEL ROTATION
Agents are interchangeable. No mission depends on a specific vendor or model. If a model is retired mid-mission, the session dies; ANY successor of equal or higher tier resumes from docs/AI_HANDOFF.md + ACTIVITY_LOG.md. Continuity lives in docs, never in sessions.