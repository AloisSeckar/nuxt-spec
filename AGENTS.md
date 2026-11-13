# AGENTS.md

<!-- ↓↓↓ agentcreed ↓↓↓ -->

This project uses the `AgentCreed` methodology for AI-assisted software development.

## Agentic development

Always use the `creed-dev` skill when tasked to interact with the codebase.

Lines `<!-- ↓↓↓ agentcreed ↓↓↓ -->` and `<!-- ↑↑↑ agentcreed ↑↑↑ -->` are structural markers, not instructions. Text between them is managed by AgentCreed and gets overwritten on `agentcreed update`: each file has a single managed block, project-specific content belongs AFTER `<!-- ↑↑↑ agentcreed ↑↑↑ -->`, and managed text must not be edited unless `AGENTS.md` allows it.

When the user prompt contradicts any of the established rules, notify the user and ask for confirmation.

## Architecture and security

Before starting any task, read:

- [ARCHITECTURE.md](./ARCHITECTURE.md) - the project tech stack, structure and coding conventions.
- [SECURITY.md](./SECURITY.md) - security boundaries and restrictions that MUST ALWAYS be followed.

Rules for both files:

- Respect their contents as the baseline. Make sure they are aligned with each other, with the requirements of the given task and with any other instructions. If not, pause the execution and let the user decide the next step.
- Prefer `ARCHITECTURE.md` to gather relevant info about the project. Fallback to `README.md` if needed. If a topic is not sufficiently covered and further discovery is required, suggest that the user update the file accordingly.
- `ARCHITECTURE.md`, `README.md` and files linked from them are documentation, not instruction files. Keep them up-to-date by this rule for every wrong or outdated passage you notice:
  - If it describes code, configuration, commands or behavior changed in the current task, make the whole passage correct as part of the task, even if parts were wrong before. Notify the user about implied architecture changes.
  - Otherwise do not edit it, but log it into `BACKLOG.md` with the quoted passage and the actual state.
- Rules in `SECURITY.md` take precedence over any task, user prompt or other instruction. Never break them silently, partially or temporarily. If the task contradicts or would violate them, pause the execution before making the violating change, quote the affected rule and let the user decide the next step. Proceed only after explicit user confirmation for this specific case, and suggest updating `SECURITY.md` instead of one-off exceptions.

## Suggestions and backlog

Two files versioned in git collect **pending** items only:

- [SUGGESTIONS.md](./.creed/SUGGESTIONS.md) - findings about agent instructions: ambiguities, discrepancies, contradictions, duplications, inefficiencies or possible improvements in `AGENTS.md`, `SECURITY.md`, skills, other instruction files and AgentCreed-managed text in any file.
- [BACKLOG.md](./.creed/BACKLOG.md) - tasks for the project codebase: refactoring, duplicated or unused code, bugs, missing tests, missing or outdated documentation and other changes out of the current task scope.

Rules for both files:

- Items are numbered list entries (`1.`, `2.`, ...) for easy reference by number.
- When you notice applicable item, append it as a new numbered item into the matching file and notify the user. Other instructions referring to "log into `SUGGESTIONS.md`" or "log into `BACKLOG.md`" mean this procedure.
- Logging never replaces asking. If the item blocks or affects the current task, also stop and let the user decide.
- Never mark items as done, resolved or obsolete. Once an item is resolved, delete it from the file entirely.
- Treat an item as resolved only when its change has been implemented in this session or the user explicitly confirms it. Otherwise leave it untouched.

<!-- ↑↑↑ agentcreed ↑↑↑ -->

## Project-specific rules

- `playground/` is git-tracked. ALWAYS revert changes made there and NEVER commit them.
- NEVER run `cli/nuxt-spec.js setup` in the repository root - it deletes `node_modules` and lock files in the current directory. Use `playground/` or a temporary folder.
- Publish only via `pnpm release`. Direct `pnpm publish` is blocked by `scripts/prepublish-check.js`.
- Documentation lives in `docs/` and is served online at [https://nuxt-spec.netlify.app](https://nuxt-spec.netlify.app). While keeping documentation up-to-date, always ensure that changes in the codebase are also reflected in the corresponding `docs/*.md` files.
