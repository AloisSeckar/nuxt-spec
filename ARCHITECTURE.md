# ARCHITECTURE.md

<!-- ↓↓↓ agentcreed ↓↓↓ -->

This file describes the project tech stack, structure and coding conventions. Rules for handling this file are defined in [AGENTS.md](./AGENTS.md).

<!-- ↑↑↑ agentcreed ↑↑↑ -->

## Overview

**Nuxt Spec** is a [Nuxt layer](https://nuxt.com/docs/4.x/getting-started/layers) published to NPM as `nuxt-spec`. It bundles pre-configured testing dependencies, a Vitest config factory and test utilities for Nuxt apps. A companion CLI package `nuxt-spec-cli` scaffolds and maintains the setup in consumer projects. User-facing docs are published at <https://nuxt-spec.netlify.app>.

## Tech Stack

| Category | Technology |
| --- | --- |
| Language | TypeScript (layer, utils, tests), plain ESM JavaScript (`config/*.mjs`, `cli/`, `scripts/`) |
| Framework | Nuxt 4 (layer), Vue 3 |
| Test runner | Vitest 5 (projects, browser mode via `@vitest/browser-playwright`, UI, coverage v8/istanbul) |
| Test libraries | `@nuxt/test-utils`, `@vue/test-utils`, `vitest-browser-vue`, `happy-dom`, Playwright |
| Visual regression | custom `compareScreenshot` (`pixelmatch` + `fast-png`) |
| CLI helpers | `elrh-cosca` (file/config manipulation, prompts, messages) |
| Docs | VitePress (`docs/`, deployed to Netlify) |
| Package manager | pnpm (workspace, version pinned in `packageManager`) |
| Lint | `@nuxt/eslint` with stylistic rules |

No database, API backend or authentication - this is a library/tooling project.

## Architecture

pnpm workspace (`pnpm-workspace.yaml`) with three members:

```text
nuxt-spec (root, published)      nuxt-spec-cli (cli/, published)     docs/ (private)
 ├─ nuxt.config.ts  <- layer     ├─ nuxt-spec.js  <- bin              └─ VitePress site
 ├─ config/  <- Vitest factory   ├─ commands/ setup|update|ci
 ├─ utils/   <- test utilities   └─ helpers/
 ├─ modules/ <- `spec` options
 └─ app/     <- test components
```

- Consumers add `nuxt-spec` to `extends` in `nuxt.config.ts` and build their `vitest.config.ts` with `loadVitestConfig()` from `nuxt-spec/config`.
- `loadVitestConfig(userConfig, projects = true)` merges user config with defaults (defu-based) and defines Vitest projects:

  | Project | Include | Environment |
  | --- | --- | --- |
  | `default` | `{test,tests}/**/*.{test,spec}.ts` except the folders below | node |
  | `unit` | `test/unit/**` | node |
  | `nuxt` | `test/nuxt/**` | nuxt |
  | `e2e` | `test/e2e/**` | node (`@nuxt/test-utils/e2e`, optional external Playwright setup file) |
  | `browser` | `test/browser/**` | node + Vitest browser mode (Playwright) |

- Options come from the `spec` key in `nuxt.config.ts` (registered by `modules/spec-options.ts`) and `NUXT_SPEC_*` env variables (env wins). Resolved in `config/utils/options.mjs`.
- `@nuxt/hints` is registered conditionally by `modules/spec-options.ts`, not in `nuxt.config.ts`.
- An HTML test report is produced by a Vite plugin (`config/utils/reporter.mjs`, templates in `config/report/`) into `test/__reports__/` (git-ignored).
- The `nuxt-spec` package has no `bin` and does not depend on `nuxt-spec-cli`. The CLI is a separate, lightweight package.

## Key Directories

- `app/` - layer app: test components (`NuxtSpecTestComponent`, `NuxtSpecApiTestComponent`) exported via `nuxt-spec/components`, pages used by repo e2e tests, `vitest-utils.ts`.
- `config/` - `nuxt-spec/config` export: `index.mjs` (`loadVitestConfig`, `nuxtSpecReportPlugin`), hand-written `.d.ts`/`.d.mts` types, `utils/` (merge, options, projects, reporter, warnings), `report/` (HTML report fragments), `templates/` (files downloaded by the CLI, incl. GitHub/GitLab CI workflows).
- `utils/` - `nuxt-spec/utils` export: `gotoPage`, `getDataHtml`, `getAPIResultHtml` (`e2e.ts`), `compareScreenshot` (`screenshot.ts`), `playwright.ts` (e2e setup file for external Playwright), `helpers/`.
- `modules/` - local Nuxt module `spec-options.ts` (typed `spec` config key, hints toggle).
- `cli/` - `nuxt-spec-cli` package ([cli/README.md](cli/README.md)): entry `nuxt-spec.js`, `commands/` (`setup`, `update`, `ci`), `helpers/` (package-manager commands and `runCmd` that runs them via `execFileSync` without a shell string, `cmd.exe` on Windows; constants, git).
- `scripts/` - `release.js` (version check + `pnpm -r publish`), `prepublish-check.js` (blocks direct `pnpm publish`).
- `test/` - tests of this repo, laid out per Vitest project (`unit/`, `nuxt/`, `e2e/`, `browser/`); `_internal/` and `custom/` fall into the `default` project; `_internal/` covers `config/` and `cli/` internals.
- `docs/` - VitePress source of the online documentation (overview, installation, configuration, utilities, CI, changelog, dependencies, contributing).
- `playground/` - git-tracked Nuxt starter app for manual testing of the CLI and new features ([playground/README.md](playground/README.md)).
- `public/` - static assets (logo).

## Entry Points

- Layer: `nuxt.config.ts` (`exports["."]`)
- Vitest config: `config/index.mjs` (`nuxt-spec/config`); this repo's own `vitest.config.ts` imports it locally
- Test utilities: `utils/index.ts` (`nuxt-spec/utils`)
- Components: `app/components/index.ts` (`nuxt-spec/components`)
- CLI: `cli/nuxt-spec.js` (`nuxt-spec-cli setup|update|ci`)
- Release: `scripts/release.js`

## Conventions

- ESM everywhere (`"type": "module"`); no semicolons, single quotes, 2-space indent (`@nuxt/eslint` stylistic, custom rules in `eslint.config.mjs`).
- Files under `config/` are plain `.mjs` with hand-written type declarations next to them; keep both in sync.
- Short lowercase `//` comments explaining intent; JSDoc on exported utilities and CLI entry points.
- `nuxt-spec` and `nuxt-spec-cli` always share the same version and are released together.
- Pinned dependency versions in `package.json`; `playwright` and `playwright-core` are pinned in lockstep, and `PLAYWRIGHT_VERSION` in `cli/helpers/constants.js` must match.
- Repo-only pnpm `overrides` in `pnpm-workspace.yaml` are not shipped to consumers.
- Test files are named `*.test.ts` and placed in the folder of their Vitest project.

## Quick Commands

| Action | Command |
| --- | --- |
| Install | `pnpm install` |
| Dev (layer app) | `pnpm dev` |
| Test | `pnpm test` (`test-c` coverage, `test-u` update snapshots, `test-i` watch) |
| Lint | `pnpm eslint` |
| Typecheck | `pnpm typecheck` |
| Docs | `pnpm -C docs dev` / `pnpm -C docs build` |
| Try CLI locally | `cd playground && node ../cli/nuxt-spec.js setup true pnpm` |
| Release | `pnpm release` (extra args after `--` go to `pnpm publish`) |
