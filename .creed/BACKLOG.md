# AgentCreed Backlog

<!-- ↓↓↓ agentcreed ↓↓↓ -->

This file is used to collect tasks for the project codebase discovered during development (e.g. refactoring, duplicated or unused code, bugs, missing tests, missing or outdated documentation, changes out of the current task scope). Findings about agent instructions belong in `SUGGESTIONS.md`.

This file holds pending tasks only, as a numbered list. Resolved items are deleted, never marked as done. When deleting resolved, remaining items are renumbered.

<!-- ↑↑↑ agentcreed ↑↑↑ -->

1. `docs/4-1-contributing.md` is incomplete - it only links to the author's GitHub profile and lacks contribution rules.
2. `scripts/release.js` runs `<pm> publish` with `shell: true` on Windows (`spawnSync`) and passes through user-supplied args (`--pm`, extra publish args). This is not covered by "Known exceptions" in `SECURITY.md` - either document it there or avoid the shell.
