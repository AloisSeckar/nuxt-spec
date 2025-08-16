# Changelog

Overview of the newest features in Nuxt Spec.

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
