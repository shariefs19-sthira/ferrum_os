# Standards (STANDARDS.md)

This document defines the coding, architectural, and operational standards for the Ferrum OS project. It is a living document, updated as practices evolve.

## Version Control Standards

1.  **Explicit Paths:** All `git add` and `git commit` commands must explicitly list file paths. `git add .` or `git add -A` is prohibited for agents. This promotes awareness of the exact scope of changes.
2.  **Pre-commit Gates for Scripts:** Every change to a `.ps1` or `.mjs` file must pass a syntax parse check (e.g., `node --check` or `powershell -c "Parser::ParseFile()"`) and a `--dry-run` test (if applicable) before being committed. This prevents unparseable or logically incorrect scripts from entering the repository.

## Coding Standards

1.  **Language Choice:** New logic should prefer TypeScript for type safety and clarity. Python is acceptable for data science or specific integrations. Bash/PowerShell scripts are discouraged for complex logic; Node.js `.mjs` is preferred for cross-platform compatibility.
2.  **Async/Await:** Prefer `async`/`await` over raw Promises and callbacks for readability.
3.  **Error Handling:** All async operations must have explicit error handling using `try...catch` or equivalent.
4.  **Logging:** Use structured logging with consistent levels (INFO, WARN, ERROR) and include relevant context (e.g., task ID, file path).
5.  **Naming:** Use descriptive names for variables, functions, and files. Follow camelCase for JavaScript/TypeScript, snake_case for Python.

## Architectural Standards

1.  **Microservice Boundaries:** Services should align with business domains. Communication via well-defined APIs or events.
2.  **API Design:** RESTful principles for synchronous communication. Consistent error formats.
3.  **Database Per Service:** Each service owns its data. Avoid shared databases.
4.  **Frontend Structure:** Use Next.js App Router for page-based routing. Shared components in `apps/web/components`.

## Operational Standards

1.  **Agent Scoping:** Agents must strictly adhere to the declared scope for their assigned task. Accessing files or systems outside the scope requires a HUMAN-HOLD.
2.  **Operator QA Verification:** Before running automated QA checks (like those performed by the Operator agent), the environment must be verified. Specifically, for web applications, the QA process must confirm the correct server harness is running (e.g., checking for server banners like '__next' for Next.js) before executing tests. Failure to do so can result in false positives/negatives due to incorrect harnesses (e.g., Vite vs. Next.js dev servers).

## Guard Checks Standards

1.  **Required Status Checks:** After the first successful run (M19), guard checks including security scans and compliance validations join the required status check list for pull requests to main.
2.  **Human Approval:** Changes to sensitive files (AGENTS.md, .github/**, .gitignore, apps/api/**, package.json, *lock* files) require explicit "HUMAN-APPROVED" in the PR description.
3.  **Task Tagging:** All commits and PR titles should include [task:] tags for proper tracking and accountability.