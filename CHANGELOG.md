# Changelog

Overview of the newest features in Nuxt Spec.

## 0.1.14

**2025-10-27**
- fix: proper error handling in CLI (#20)
- fix: loading vitest config during runtime (#21)

## 0.1.13

**2025-10-26**
- feat: TS types in `nuxt-spec/config` (#18)
- feat: option to exclude `projects` from vitest config (#19)
- build: updated dependencies
  - `nuxt` to `4.2.0`
  - `nuxt-test-utils` to `3.20.1`
  - `vitest` to `4.0.3`
  - `happy-dom` to `20.0.8`
  - `playwright-core` to `1.56.1`
  - `vue-router` to `4.6.3`

## 0.1.12

**2025-10-16**

- fix: allow proper extending from Nuxt Spec layer again (#16)
- fix: update component import in Nuxt component test file (#15)
- build: bump `happy-dom` to `20.0.2` (fix CVE-2025-62410)

## 0.1.11

**2025-10-15**

- feat: CLI scripts can scaffold sample test files (#8)
- feat: CLI script also removes `deno.lock` file if present(#13)
- feat: CLI scripts only set `shamefully-hoist=true` for `pnpm` (#14)
- feat: GitHub links now use specific version tags

## 0.1.10

**2025-10-10**

- feat: CLI script now try-catches each step and will finish even if errors encountered
- feat: CLI script now accepts external `autoRun` parameter to avoid even the initial prompt
- feat: CLI script now guesses executing package manager to give more accurate usage hints
- feat: CLI script now scaffolds `"pnpm": "onlyBuildDependencies"` if `pnpm` is used
- refactor: merge "auto" and "manual" CLI scripts to avoid duplication
- test: small updates in demo suite
- docs: instructions for more package managers
- build: updated dependencies
  - `nuxt` to `4.1.3`
  - `vitest` to `4.0.0-beta.17`
  - `happy-dom` to `20.0.0`
  - `playwright-core` to `1.56.0`

## 0.1.9

**2025-10-05**

- feat: improved CLI setup - removing dependencies (`nuxt`, `vue`, `vue-router`) from `package.json`
- feat: improved CLI setup - removing `node_modules` and lock file(s)
- feat: change CLI execution - now runs via `npx nuxt-spec setup`
- build: bump `vitest` to `4.0.0-beta.16`, `happy-dom` to `19.0.2`, `playwright-core` to `1.55.1` and `typescript` to `5.9.3`

## 0.1.8

**2025-09-18**

- feat: improved CLI tooling with `elrh-cosca` - run `npx nuxt-spec` to start the setup wizard
- feat: "auto" and "manual" CLI mode
- docs: updated README with new setup instructions
- build: bump Nuxt to `4.1.2`, Vitest to `4.0.0-beta.11` + few other deps
- chore: improved release process - run tests before building and build before publishing

## 0.1.7

**2025-08-24**

- fix: update `elrh-cosca` to solve module resolution issue (experimental)

## 0.1.6

**2025-08-24**

- feat: delegate code-scaffolding tasks to new `elrh-cosca` library (experimental)

## 0.1.5

**2025-08-16**

- fix: invalid Vitest config + broken import path (#4)
- build: bump Vitest

## 0.1.4

**2025-08-16**

- fix: make loadVitestConfig available from root dir - solving issues from testing (#4)

## 0.1.3

**2025-08-16**

- fix: make loadVitestConfig available from root dir (#4)

## 0.1.2

**2025-08-09**

- fix: target path for scaffolded `vitest.config.ts` (#3)

## 0.1.1

**2025-08-09**

- feat: CLI tool for scaffolding `vitest.config.ts` and test-related scripts in `package.json`
- docs: added `CHANGELOG.md` and fixed link to `playwright-core`

## 0.1.0

**2025-08-08**

- initial release [v0.1.0](https://github.com/AloisSeckar/nuxt-spec/releases/tag/v0.1.0)
- key features:
  - Nuxt base layer for testing
  - Nuxt v4 and Vitest v4 compatibility
  - Integrated `vitest`, `@vitest/browser`, `happy-dom`, `playwright-core`, `@vue/test-utils`, `@nuxt/test-utils`
  - Support for custom configuration via `loadVitestConfig` function in `vitest.config.ts`
