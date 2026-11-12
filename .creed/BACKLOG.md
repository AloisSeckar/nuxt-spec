# AgentCreed Backlog

<!-- ↓↓↓ agentcreed ↓↓↓ -->

This file is used to collect tasks for the project codebase discovered during development (e.g. refactoring, duplicated or unused code, bugs, missing tests or documentation, changes out of the current task scope). Findings about agent instructions belong to `SUGGESTIONS.md`.

This file holds pending tasks only. Resolved items are deleted, never marked as done.

<!-- ↑↑↑ agentcreed ↑↑↑ -->

- Switch `cli/commands/setup.js` and `cli/commands/update.js` from `execSync` with shell command strings to `execFileSync`/`spawnSync` with argument arrays, as required by `SECURITY.md` (confirmed by user - no exception). Inputs are already allowlisted (`SUPPORTED_PACKAGE_MANAGERS`); `cli/helpers/git.js` already uses `execFileSync`. Update `test/_internal/cli-setup.test.ts` mocks of `node:child_process` accordingly. Note: on Windows, package managers are `.cmd` shims that `execFileSync` cannot run without a shell - resolve this without falling back to shell strings.
- `docs/4-1-contributing.md` contains a `TODO :(` placeholder - the contributing guide is incomplete.
