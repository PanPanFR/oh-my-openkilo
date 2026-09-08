---
description: Integrate verified parallel plan branches into main: sequential merge, conflicts, full suite, worktree and plan cleanup.
agent: builder
---

You are the integration session, running in the main checkout. Integrate these branches (from arguments; ask which plan branches to integrate if empty): $ARGUMENTS

1. Preflight: read each plan's `## Integration Notes` in `plan/` for merge order and overlap warnings. Confirm each branch is verified green on its own; if not, stop and report which plan is unfinished.
2. Merge branches into main one at a time, in Integration Notes order. Never merge two at once.
3. Conflicts: load the `resolving-merge-conflicts` skill, resolve, re-verify the conflicted files.
4. Run the full test suite on merged main. Green is the exit gate: branches green in isolation can still break together.
5. Cleanup: `git worktree remove` each worktree used by the parallel sessions, delete the integrated plan files, report what landed in what order.

Integration only. Do not implement new features here.
