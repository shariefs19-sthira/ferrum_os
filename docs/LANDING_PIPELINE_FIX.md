# W2-357 landing pipeline: docs-only rebase then squash

`scripts/land.ps1` identifies a docs-only branch when every path unique to
`main...origin/<branch>` is under `docs/`. For that narrow class it checks out
the remote tip detached, rebases it onto current `main`, then squash-merges
the rebased tip. The remote branch is never rewritten.

Shared documents are auto-resolved only when both sides are independently
append-only from their merge base. The current `main` text is retained first,
then the rebased branch's appended text, preserving chronological ledger/queue
order. Any edit, deletion, reordering, or non-doc conflict is rejected.

A rejected rebase aborts, restores `main`, creates no landing commit, and
prints `REPORT (landing requires review)` with the branch, phase, and paths.
A post-rebase squash conflict and a docs commit failure use the same REPORT
contract. Ordinary squash conflicts are also reported rather than silently
being left as a skipped branch.

SCRIBE must still rebase each docs branch onto `origin/main` before pushing.
CRANE should review the next three docs-only branches and record whether each
uses a clean rebase-then-squash landing or an explicit REPORT. This branch has
no landing authority.

## Undo

`git revert <W2-357 landing commit SHA>`
