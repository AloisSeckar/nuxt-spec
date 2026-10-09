# Dependencies

Overview of the packages Nuxt Spec currently consists of.

Versions are listed as defined in Nuxt Spec's `package.json`.

Loose versions prefixed with `~` allow patch updates.

## Basic Vue/Nuxt infrastructure

| Package | Description | Version |
| --- | --- | --- |
| [nuxt](https://npmx.dev/package/nuxt) | The Nuxt framework itself | `4.6.0` |
| [vue](https://npmx.dev/package/vue) | The Vue.js framework | `~3.5.43` |

## Core test features

| Package | Description | Version |
| --- | --- | --- |
| [vitest](https://npmx.dev/package/vitest) | The fundamental testing framework | `5.0.3` |
| [@vitest/browser](https://npmx.dev/package/@vitest/browser) | More advanced browser-native test runner | `5.0.3` |
| [@vitest/browser-playwright](https://npmx.dev/package/@vitest/browser-playwright) | Playwright provider for Vitest browser mode | `5.0.3` |
| [@vitest/ui](https://npmx.dev/package/@vitest/ui) | Graphical UI for the Vitest test runner | `5.0.3` |
| [happy-dom](https://npmx.dev/package/happy-dom) | Headless browser runtime | `~20.14.5` |
| [playwright](https://npmx.dev/package/playwright) | Headless browser testing framework | `~1.63.0` |
| [playwright-core](https://npmx.dev/package/playwright-core) | Core Playwright browser API used by Nuxt Spec utilities | `~1.63.0` |
| [@vue/test-utils](https://npmx.dev/package/@vue/test-utils) | Utilities for testing Vue stuff | `2.5.1` |
| [@nuxt/test-utils](https://npmx.dev/package/@nuxt/test-utils) | Utilities for testing Nuxt stuff | `4.3.3` |
| [@nuxt/devtools](https://npmx.dev/package/@nuxt/devtools) | Development browser console for Nuxt | `4.0.0-beta.4` |
| [@nuxt/hints](https://npmx.dev/package/@nuxt/hints) | DevTools performance, hydration, and security tips (can be opted out of via [configuration](2-1-configuration.html#nuxt-hints-integration)) | `1.1.4` |

## Test supporting features

| Package | Description | Version |
| --- | --- | --- |
| [@vitejs/plugin-vue](https://npmx.dev/package/@vitejs/plugin-vue) | Vite plugin for processing Vue SFCs in Vitest | `~6.0.9` |
| [vitest-browser-vue](https://npmx.dev/package/vitest-browser-vue) | Rendering Vue components in Vitest browser mode | `3.1.0` |
| [pixelmatch](https://npmx.dev/package/pixelmatch) | Pixel-level image comparison for visual regression testing | `~7.2.0` |
| [fast-png](https://npmx.dev/package/fast-png) | PNG decoding for visual regression testing | `~8.0.0` |

## Other development/supporting features

| Package | Description | Version |
| --- | --- | --- |
| [typescript](https://npmx.dev/package/typescript) | TypeScript language support | `~6.0.3` |
| [vue-tsc](https://npmx.dev/package/vue-tsc) | Type-checking for Vue components | `~3.3.12` |
| [vue-router](https://npmx.dev/package/vue-router) | Official router for Vue.js | `~5.3.1` |
| [@nuxt/eslint](https://npmx.dev/package/@nuxt/eslint) | ESLint integration for Nuxt | `~1.17.0` |
| [elrh-cosca](https://npmx.dev/package/elrh-cosca) | CLI scripting helpers powering the `nuxt-spec` CLI | `0.4.1` |
