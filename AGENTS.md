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