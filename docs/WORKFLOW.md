# Workflow Rules (WORKFLOW.md)

## Purpose
This document defines the operational workflow, roles, and job definitions for the AI agent system.

## Agent Positions (POS tags)
- `[POS:WRITER-MAIN]`: Primary writer agents, authorized for direct commits to the main branch.
- `[POS:WRITER-BRANCH]`: Branch writer agents, work on feature branches that are later merged.
- `[POS:WRITER-FORK]`: Fork writer agents, operate from a personal fork and submit pull requests.
- `[POS:ARCHITECT]`: Advisory agents focusing on system design, standards, and coordination. No direct code commits.
- `[POS:SCOUT]`: Research agents for standards and technology radar sweeps.
- `[POS:DISPATCHER]`: Agent responsible for assigning tasks to other agents based on capability and load.
- `[POS:PROPHET]`: Agent responsible for forecasting potential issues and opportunities based on historical data.
- `[POS:CONDUCTOR]`: Automated agent responsible for releasing batches of work based on completion criteria.
- `[POS:WRITER-VOLUME]`: High-volume, low-latency agents for small-scoped, light-weight tasks.
- `[POS:OPERATOR]`: Computer-use agents capable of interacting with the system through terminal and browser interfaces within a sandboxed environment.