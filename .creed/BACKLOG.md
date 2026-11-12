# AgentCreed Backlog

<!-- ↓↓↓ agentcreed ↓↓↓ -->

This file is used to collect tasks for the project codebase discovered during development (e.g. refactoring, duplicated or unused code, bugs, missing tests or documentation, changes out of the current task scope). Findings about agent instructions belong to `SUGGESTIONS.md`.

This file holds pending tasks only. Resolved items are deleted, never marked as done.

<!-- ↑↑↑ agentcreed ↑↑↑ -->

- `docs/4-1-contributing.md` contains a `TODO :(` placeholder - the contributing guide is incomplete.
- The JSDoc step list in `cli/commands/update.js` (step 2) says it bumps `nuxt-spec` "to the latest version". The code bumps it to `SPEC_VERSION`, which is the CLI's own version (`nuxt-spec@${SPEC_VERSION}`), not the latest.
