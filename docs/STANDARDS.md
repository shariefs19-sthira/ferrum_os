# Standards

This document defines the coding and operational standards for the project.

## Scripting Standards (PowerShell, Bash, etc.)

- Use descriptive variable names.
- Always quote string literals.
- Include error handling.
- Add comments for complex logic.
- **NEW:** Avoid using reserved or automatic variable names specific to the shell (e.g., `$PID`, `$HOST`, `$ERROR` in PowerShell). Use explicitly named variables instead (e.g., `$ProcessId`, `$OpPid`).
- **NEW:** Every change to a `.ps1` file must pass two checks before committing: (a) a parse check (e.g., `[System.Management.Automation.Language.Parser]::ParseFile(...)`) and (b) a dry-run execution (e.g., `script.ps1 -DryRun`) with zero errors and no unintended side effects. This acts as a regression gate, similar to CI for code.

## Coding Standards (TypeScript, Python, etc.)

- Use camelCase for variable and function names.
- Use PascalCase for class names.
- Use UPPER_SNAKE_CASE for constants.
- Use JSDoc/Docstring comments for public functions/classes.
- Prefer const/let over var in JavaScript/TypeScript.
- Use async/await over callbacks for asynchronous operations.
- Use destructuring assignment where appropriate.
- Use template literals over string concatenation.
- Use arrow functions where appropriate.
- Use modules to organize code.
- Use strict mode in JavaScript.
- Use TypeScript for type safety.
- Use consistent indentation (2 spaces).
- Use consistent line endings (LF).
- Use consistent quoting (single quotes for strings).
- Use consistent spacing (around operators, after commas, etc.).
- Use consistent casing (lowercase for filenames).
- Use consistent naming (kebab-case for filenames).
- Use consistent file extensions (.ts, .tsx, .js, .jsx, .py, .md, etc.).
- Use consistent import/export syntax.
- Use consistent module resolution.
- Use consistent dependency management (package.json, requirements.txt, etc.).
- Use consistent testing frameworks (Jest, Vitest, PyTest, etc.).
- Use consistent linters/formatters (ESLint, Prettier, Black, etc.).
- Use consistent CI/CD practices.
- Use consistent security practices.
- Use consistent performance practices.
- Use consistent accessibility practices.
- Use consistent internationalization practices.
- Use consistent documentation practices.
- Use consistent logging practices.
- Use consistent error handling practices.
- Use consistent configuration management practices.
- Use consistent deployment practices.
- Use consistent monitoring practices.
- Use consistent alerting practices.
- Use consistent disaster recovery practices.
- Use consistent security incident response practices.