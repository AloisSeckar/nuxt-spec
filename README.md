# Nuxt Spec

![Nuxt Spec](https://github.com/AloisSeckar/nuxt-spec/blob/main/public/nuxt-spec.png)

**Nuxt Spec** (aka `nuxt-spec`) is a base layer for [Nuxt](https://nuxt.com/) applications incorporating together a couple of testing libraries and packages and providing some utility functions. I created this project in early 2025 because I was unable to find a convenient "one-dependency" way to start testing my Nuxt apps and I didn't want to repeat the same steps and maintain the same set of dependencies over and over. 

While Nuxt itself does have a [dedicated module for testing](https://nuxt.com/docs/getting-started/testing), to remain as versatile as possible, it has to be combined with other packages (which can be different based on your choice). I am trying to overcome this by defining "The Way". This is both the strength and the weakness of this project. You were warned.

The most important client of `nuxt-spec` is my [Nuxt Ignis](https://github.com/AloisSeckar/nuxt-ignis) template starter that adds up even more ready-to-use cool stuff for your future awesome Nuxt websites.

## How to use

Aside from being "forked" and used as you seem fit, `nuxt-spec` is also available as an [NPM package](https://www.npmjs.com/package/nuxt-spec) that can be referenced as a single-import with all the features incoming.

The `nuxt-spec` package comes with a built-in CLI tool that can help you:
- setup the dependency in your project
- scaffold the default `vitest.config.ts` (see [configuration](#configuration) section)
- add a few test-related script shorthands into your `package.json` (see [running tests](#running-tests) section)
- create demo test files in proposed file structure

To use it, just run the CLI script in your terminal:

| Manager | Command |
|-----------------|---------|
| npm | `npx nuxt-spec setup` |
| yarn | `yarn dlx nuxt-spec setup` |
| pnpm | `pnpx nuxt-spec setup` |
| Bun | `bunx nuxt-spec setup` |
| Deno | `deno run --allow-run npm:npx nuxt-spec setup` |

First, the CLI tool will ask you whether you want to do the setup automatically. If you choose `y`es, it will perform all the steps for you. If you choose `n`o, it will guide you through the manual setup step-by-step (see [manual setup](#manual-setup) section).

### Manual setup

If you don't want to use the CLI tool, or you want to understand its flow better, here are the detailed steps:

1) Add following dependency into your `package.json`:

```
"nuxt-spec": "0.2.0-alpha.1"
```

2) Add following section into your `nuxt.config.ts`:

```
extends: [
  'nuxt-spec'
]
```

3) Add `.npmrc` file with following content (if you don't have it yet):

```
shamefully-hoist=true
```

4) Add `vitest.config.ts` file with following content (if you don't have it yet):

```ts
import { loadVitestConfig } from 'nuxt-spec/config'

export default loadVitestConfig({
  // your custom config here
})
```

5) (Optional) Add following scripts into your `package.json`:

```
"scripts": {
  "test": "vitest run",
  "test-u": "vitest run -u",
  "test-i": "vitest"
}
```

6) (Optional) Setup file structures for tests as follows:

```
test/
├── browser/
│   └── vitest-browser.test.ts
├── e2e/
│   └── nuxt-e2e.test.ts
│   └── nuxt-visual.test.ts
├── nuxt/
│   └── nuxt-unit.test.ts
└── unit/
    └── vitest-unit.test.ts
```

You can use sample files from the [project repository](https://github.com/AloisSeckar/nuxt-spec/tree/v0.2.0-alpha.1/test).

### Install and execute

Whether you used the CLI tool or did the manual setup, you are ready to install and run the tests.

1) Install the dependencies:

<!-- tabs:start -->

#### **npm**

```bash
npm install
```

#### **yarn**

```bash
yarn install
```

#### **pnpm**

```bash
pnpm install
```

#### **bun**

```bash
bun install
```

<!-- tabs:end -->

2) If you're prompted (for the first time when installing to a new machine), install headless browser runtimes:

<!-- tabs:start -->

#### **npm**

```bash
npx playwright-core install
```

#### **yarn**

```bash
yarn dlx playwright-core install
```

#### **pnpm**

```bash
pnpm exec playwright-core install
```

#### **bun**

```bash
bunx playwright-core install
```

<!-- tabs:end -->

3) Start the development server of your awesome Nuxt project:

<!-- tabs:start -->

#### **npm**

```bash
npm run dev
```

#### **yarn**

```bash
yarn dev
```

#### **pnpm**

```bash
pnpm dev
```

#### **bun**

```bash
bun run dev
```

<!-- tabs:end -->

### Running tests

Once installed, Vitest automatically discovers all `*.test.ts` and `*.spec.ts` files in project and becomes capable of running them.

You can use those three optional commands `package.json` file in `"scripts"` section in order to run tests easilly:
- `test: vitest run` - runs once and ends
- `test-u: vitest run -u` - runs once and updates snapshots
- `test-i: vitest` - runs and waits in HMR mode for test file changes

Then you can call in terminal in root of your project:

<!-- tabs:start -->

#### **npm**

```bash
npm run test     # runs once and ends
npm run test-u   # runs once and updates snapshots
npm run test-i   # runs and waits in HMR mode
```

#### **yarn**

```bash
yarn test        # runs once and ends
yarn test-u      # runs once and updates snapshots
yarn test-i      # runs and waits in HMR mode
```

#### **pnpm**

```bash
pnpm test        # runs once and ends
pnpm test-u      # runs once and updates snapshots
pnpm test-i      # runs and waits in HMR mode
```

#### **bun**

```bash
bun run test     # runs once and ends
bun run test-u   # runs once and updates snapshots
bun run test-i   # runs and waits in HMR mode
```

<!-- tabs:end -->

Or you can use the `vitest` command directly with all its parameters. See [Vitest CLI documentation](https://vitest.dev/guide/cli.html) for more info.

## Overview

**Nuxt Spec** currently contains:
- [vitest](https://www.npmjs.com/package/vitest) **v4** as the fundamental testing framework
- [@vitest/browser](https://www.npmjs.com/package/@vitest/browser) as more advanced browser-native testing runner
- [@vitest/ui](https://www.npmjs.com/package/@vitest/ui) as graphic UI above the Vitest test runner
- [happy-dom](https://www.npmjs.com/package/happy-dom) as the headless browser runtime
- [playwright-core](https://www.npmjs.com/package/playwright-core) as the headless browser testing framework
- [@vue/test-utils](https://www.npmjs.com/package/@vue/test-utils) for testing Vue stuff
- [@nuxt/test-utils](https://www.npmjs.com/package/@nuxt/test-utils) for testing Nuxt stuff

Planned future development:
- reason about (not) using Vitest browser mode (or make it optional)
- solution for visual regression testing - (currently there is experimental custom solution)

See [CHANGELOG.md](https://github.com/AloisSeckar/nuxt-spec/blob/v0.2.0-alpha.1/CHANGELOG.md) for the latest updates and features.

## Configuration

By default, `nuxt-spec` uses Vitest configuration defined in [`/config/index.mjs`](https://github.com/AloisSeckar/nuxt-spec/blob/v0.2.0-alpha.1/config/index.mjs). The configuration is based on [Nuxt team recommendations](https://nuxt.com/docs/4.x/getting-started/testing) and our best judgement.

To add/override your custom config, you can create (or scaffold via CLI tool) a file named `vitest.config.ts` in the root of your project with the following content:

```ts
import { loadVitestConfig } from 'nuxt-spec/config'

export default loadVitestConfig({
  // your custom config here
})
```

And pass whatever you want as a parameter object. It will be defu-merged with the defaults (custom config takes precedence). The object is typed to be compatible with both [Vite](https://vite.dev/config/) and [Vitest](https://vitest.dev/config/) configuration options. Used type is derived from the respective `.d.ts` files of those packages.

**NOTE**: Based on the [Vitest documentation](https://main.vitest.dev/config/), it is possible to pass in **any configuration option** valid for [Vite](https://vite.dev/config/). Configuration related directly to Vitest must be passed under the `test` key, e.g.:

```ts
import { loadVitestConfig } from 'nuxt-spec/config'

export default loadVitestConfig({
  test: {
    // your custom config specific to Vitest here
  }
  // by the nature of the Vitest config resolution,
  // you may also pass ANY OTHER valid Vite configuration options here
})
```

By default, Nuxt Spec built-in configuration establishes 4 `projects` + one fallback:
- `unit` - for unit tests in `test/unit/**` - env is set to `node` 
- `nuxt` - for Nuxt-related tests in `test/nuxt/**` - env is set to `nuxt` 
- `e2e` - for end-to-end tests in `test/e2e/**` - env is set to `node` 
- `browser` - for browser-mode tests in `test/browser/**` - env is set to `node` (this is effectively an alternative to `nuxt` relying on `@vitest/browser` instead of `@nuxt/test-utils`)
- `default` - fallback for all other tests in `test/**` and/or `tests/**` directories - env is set to `node` 

Vitest will then expects at least one test defined in either of those directories. Any parts of the `test.projects` confing may be altered and user-defined values will be logically merged with the defaults. Also you may add new custom projects' definitions to fit your needs. If your project uses significantly different configuration (i.e. your tests reside in completely different path), you can pass `false` as a second parameter to `loadVitestConfig()` function to exclude default `test.projects` values from being injected completely:

```ts
import { loadVitestConfig } from 'nuxt-spec/config'

export default loadVitestConfig({
  // your custom config here
}, false)
```

Alternatively, if you don't want to use any part of the `nuxt-spec` default configuration at all, you can override `vitest.config.ts` file completely and define your own [Vitest configuration](https://vitest.dev/config/) from scratch.

## Utilities

Nuxt Spec offers couple of utility functions that are exported via `nuxt-spec/utils` subpackage.

You can use them in your test files as follows:

```ts
import { compareScreenshot, gotoPage, getDataHtml, getAPIResultHtml, } from 'nuxt-spec/utils'

// accepts instance of NuxtPage (from @nuxt/test-utils)
// takes a screenshot of current viewport and compares it with stored baseline
// if screenshot doesn't exist, it will be created as baseline
// if screenshots don't match, the method will cause Vitest test to fail
await compareScreenshot(page, 'screenshot.png')

// navigates to given URL and returns the instance of NuxtPage (from @nuxt/test-utils)
const page: NuxtPage = await gotoPage('url')

// accepts either a URL string or instance of NuxtPage (from @nuxt/test-utils) and a CSS selector
// returns `innerHTML` of the element matching the selector
const html: string = await getDataHtml('/', '#test') 
const html: string = await getDataHtml(page, '#test')

// accepts either a URL string or instance of NuxtPage (from @nuxt/test-utils)
// css selector for element that triggers API call when clicked (i.e. button)
// fragment of API endpoint URL that should be called (to test the response)
// css selector for element where the API response should be rendered (i.e. div)
// returns `innerHTML` of the element matching the result selector after the API call 
// is made by Playwright runner
const html: string = await getAPIResultHtml('/', '#api-fetch', '/your-api', '#api-result')
const html: string = await getAPIResultHtml(page, '#api-fetch', '/your-api', '#api-result')
```

For detailed description, see [utils.d.ts](https://github.com/AloisSeckar/nuxt-spec/blob/v0.2.0-alpha.1/utils/index.d.ts).

## Contact

Use GitHub issues to report bugs or suggest improvements. I will be more than happy to address them.
